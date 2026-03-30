package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/models"
	"github.com/exn-hr/backend/internal/repositories"
	"github.com/exn-hr/backend/internal/sse"
)

const annualLeavedays = 12

type LeaveService struct {
	leaveRepo *repositories.LeaveRepository
	empRepo   *repositories.EmployeeRepository
	notifSvc  *NotificationService
	userRepo  *repositories.UserRepository
	sseHub    *sse.Hub
}

func NewLeaveService(
	leaveRepo *repositories.LeaveRepository,
	empRepo *repositories.EmployeeRepository,
	notifSvc *NotificationService,
	userRepo *repositories.UserRepository,
	sseHub *sse.Hub,
) *LeaveService {
	return &LeaveService{leaveRepo: leaveRepo, empRepo: empRepo, notifSvc: notifSvc, userRepo: userRepo, sseHub: sseHub}
}

func (s *LeaveService) ensureBalance(employeeID uint, year int) (*models.LeaveBalance, error) {
	balance, err := s.leaveRepo.GetBalance(employeeID, year)
	if err != nil {
		// Create balance record for the year
		balance = &models.LeaveBalance{
			EmployeeID:    employeeID,
			Year:          year,
			TotalDays:     annualLeavedays,
			UsedDays:      0,
			RemainingDays: annualLeavedays,
		}
		if err := s.leaveRepo.CreateBalance(balance); err != nil {
			return nil, fmt.Errorf("failed to create leave balance: %w", err)
		}
	}
	return balance, nil
}

func (s *LeaveService) Create(userID uint, req dto.CreateLeaveReq) (*models.LeaveRequest, error) {
	emp, err := s.empRepo.FindByUserID(userID)
	if err != nil {
		return nil, errors.New("employee profile not found")
	}

	year := time.Now().Year()

	// For paid leave, check remaining balance
	if req.Type == "paid" {
		balance, err := s.ensureBalance(emp.ID, year)
		if err != nil {
			return nil, err
		}
		if float64(balance.RemainingDays) < req.Days {
			return nil, fmt.Errorf("insufficient leave balance: %.1f days requested, %.1f days remaining",
				req.Days, float64(balance.RemainingDays))
		}
	}

	leaveReq := &models.LeaveRequest{
		EmployeeID:    emp.ID,
		Type:          req.Type,
		StartDate:     req.StartDate,
		EndDate:       req.EndDate,
		Days:          req.Days,
		Reason:        req.Reason,
		LeaderStatus:  "pending",
		HRStatus:      "pending",
		OverallStatus: "pending",
	}

	if err := s.leaveRepo.Create(leaveReq); err != nil {
		return nil, errors.New("failed to create leave request")
	}

	// Notify the team leader
	if emp.Team != nil && emp.Team.LeaderID != nil {
		leaderEmp, err := s.empRepo.FindByID(*emp.Team.LeaderID)
		if err == nil && leaderEmp.User != nil {
			refID := leaveReq.ID
			s.notifSvc.Send(
				leaderEmp.UserID,
				"New Leave Request",
				fmt.Sprintf("%s has submitted a leave request for %s to %s (%.1f days)",
					emp.FullName, req.StartDate, req.EndDate, req.Days),
				"leave",
				&refID,
				"leave_request",
			)
		}
	}

	// Broadcast SSE event
	if s.sseHub != nil {
		s.sseHub.Broadcast(sse.Event{
			Type: "leave_created",
			Data: map[string]interface{}{"leave_id": leaveReq.ID, "employee_name": emp.FullName, "days": leaveReq.Days},
		})
	}

	return leaveReq, nil
}

// ApproveByLeader is used by a Leader to approve/reject the first stage
func (s *LeaveService) ApproveByLeader(leaderUserID uint, leaveID uint, req dto.ApproveLeaveReq) (*models.LeaveRequest, error) {
	leaveReq, err := s.leaveRepo.FindByID(leaveID)
	if err != nil {
		return nil, errors.New("leave request not found")
	}

	if leaveReq.LeaderStatus != "pending" {
		return nil, errors.New("leave request has already been reviewed by leader")
	}

	// Verify the leader owns this team
	leaderEmp, err := s.empRepo.FindByUserID(leaderUserID)
	if err != nil {
		return nil, errors.New("leader employee profile not found")
	}

	_ = leaderEmp

	leaveReq.LeaderStatus = req.Status

	if req.Status == "rejected" {
		leaveReq.OverallStatus = "rejected"
	}
	// If approved by leader, it goes to HR — overall stays pending

	if err := s.leaveRepo.Update(leaveReq); err != nil {
		return nil, errors.New("failed to update leave request")
	}

	// Notify employee
	statusMsg := "approved"
	if req.Status == "rejected" {
		statusMsg = "rejected"
	}
	s.notifSvc.Send(
		leaveReq.Employee.UserID,
		"Leave Request Update",
		fmt.Sprintf("Your leave request has been %s by your team leader", statusMsg),
		"leave",
		&leaveID,
		"leave_request",
	)

	// If leader approved, notify HR
	if req.Status == "approved" {
		hrUsers, _, _ := s.userRepo.List(1, 100)
		for _, u := range hrUsers {
			if u.Role == models.RoleHR {
				refID := leaveReq.ID
				s.notifSvc.Send(
					u.ID,
					"Leave Request Pending HR Review",
					fmt.Sprintf("%s's leave request has been approved by leader and requires your review",
						leaveReq.Employee.FullName),
					"leave",
					&refID,
					"leave_request",
				)
			}
		}
	}

	// Broadcast SSE event
	if s.sseHub != nil {
		s.sseHub.Broadcast(sse.Event{
			Type: "leave_approved",
			Data: map[string]interface{}{"leave_id": leaveReq.ID, "status": leaveReq.OverallStatus},
		})
	}

	return leaveReq, nil
}

// ApproveByHR is used by HR to give final approval
func (s *LeaveService) ApproveByHR(hrUserID uint, leaveID uint, req dto.ApproveLeaveReq) (*models.LeaveRequest, error) {
	leaveReq, err := s.leaveRepo.FindByID(leaveID)
	if err != nil {
		return nil, errors.New("leave request not found")
	}

	if leaveReq.LeaderStatus != "approved" {
		return nil, errors.New("leave request must be approved by leader first")
	}

	if leaveReq.HRStatus != "pending" {
		return nil, errors.New("leave request has already been reviewed by HR")
	}

	leaveReq.HRStatus = req.Status
	leaveReq.OverallStatus = req.Status

	if err := s.leaveRepo.Update(leaveReq); err != nil {
		return nil, errors.New("failed to update leave request")
	}

	// Update leave balance if approved and paid type
	if req.Status == "approved" && leaveReq.Type == "paid" {
		year := time.Now().Year()
		balance, err := s.ensureBalance(leaveReq.EmployeeID, year)
		if err == nil {
			balance.UsedDays += int(leaveReq.Days)
			balance.RemainingDays = balance.TotalDays - balance.UsedDays
			s.leaveRepo.UpdateBalance(balance)
		}
	}

	// Notify employee
	statusMsg := "approved"
	if req.Status == "rejected" {
		statusMsg = "rejected"
	}
	if leaveReq.Employee != nil {
		s.notifSvc.Send(
			leaveReq.Employee.UserID,
			"Leave Request Final Decision",
			fmt.Sprintf("Your leave request has been %s by HR", statusMsg),
			"leave",
			&leaveID,
			"leave_request",
		)
	}

	// Broadcast SSE event
	if s.sseHub != nil {
		s.sseHub.Broadcast(sse.Event{
			Type: "leave_approved",
			Data: map[string]interface{}{"leave_id": leaveReq.ID, "status": leaveReq.OverallStatus},
		})
	}

	return leaveReq, nil
}

func (s *LeaveService) GetByID(id uint) (*models.LeaveRequest, error) {
	req, err := s.leaveRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("leave request not found")
	}
	return req, nil
}

func (s *LeaveService) List(filter dto.LeaveFilter) ([]models.LeaveRequest, int64, error) {
	return s.leaveRepo.List(filter)
}

func (s *LeaveService) GetBalance(userID uint, year int) (*models.LeaveBalance, error) {
	emp, err := s.empRepo.FindByUserID(userID)
	if err != nil {
		return nil, errors.New("employee profile not found")
	}
	if year == 0 {
		year = time.Now().Year()
	}
	return s.ensureBalance(emp.ID, year)
}

func (s *LeaveService) Cancel(userID uint, leaveID uint) error {
	leaveReq, err := s.leaveRepo.FindByID(leaveID)
	if err != nil {
		return errors.New("leave request not found")
	}

	emp, err := s.empRepo.FindByUserID(userID)
	if err != nil {
		return errors.New("employee profile not found")
	}

	if leaveReq.EmployeeID != emp.ID {
		return errors.New("you can only cancel your own leave requests")
	}

	if leaveReq.OverallStatus == "approved" {
		return errors.New("cannot cancel an approved leave request")
	}

	return s.leaveRepo.Delete(leaveID)
}
