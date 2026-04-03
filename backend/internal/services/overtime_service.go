package services

import (
	"errors"
	"fmt"

	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/models"
	"github.com/exn-hr/backend/internal/repositories"
	"github.com/exn-hr/backend/internal/sse"
)

type OvertimeService struct {
	otRepo   *repositories.OvertimeRepository
	empRepo  *repositories.EmployeeRepository
	notifSvc *NotificationService
	userRepo *repositories.UserRepository
	sseHub   *sse.Hub
}

func NewOvertimeService(
	otRepo *repositories.OvertimeRepository,
	empRepo *repositories.EmployeeRepository,
	notifSvc *NotificationService,
	userRepo *repositories.UserRepository,
	sseHub *sse.Hub,
) *OvertimeService {
	return &OvertimeService{otRepo: otRepo, empRepo: empRepo, notifSvc: notifSvc, userRepo: userRepo, sseHub: sseHub}
}

func (s *OvertimeService) Create(userID uint, req dto.CreateOTReq) (*models.OvertimeRequest, error) {
	emp, err := s.empRepo.FindByUserID(userID)
	if err != nil {
		return nil, errors.New("employee profile not found")
	}

	otReq := &models.OvertimeRequest{
		EmployeeID:    emp.ID,
		Date:          req.Date,
		StartTime:     req.StartTime,
		EndTime:       req.EndTime,
		Hours:         req.Hours,
		Reason:        req.Reason,
		LeaderStatus:  "pending",
		CEOStatus:     "pending",
		OverallStatus: "pending",
	}

	if err := s.otRepo.Create(otReq); err != nil {
		return nil, errors.New("failed to create overtime request")
	}

	// Notify line manager
	if emp.ManagerID != nil {
		leaderEmp, err := s.empRepo.FindByID(*emp.ManagerID)
		if err == nil && leaderEmp.User != nil {
			refID := otReq.ID
			s.notifSvc.Send(
				leaderEmp.UserID,
				"New Overtime Request",
				fmt.Sprintf("%s has submitted an overtime request for %s (%.1f hours)",
					emp.FullName, req.Date, req.Hours),
				"ot",
				&refID,
				"overtime_request",
			)
		}
	}

	// Broadcast SSE event
	if s.sseHub != nil {
		s.sseHub.Broadcast(sse.Event{
			Type: "overtime_created",
			Data: map[string]interface{}{"ot_id": otReq.ID, "employee_name": emp.FullName, "hours": otReq.Hours},
		})
	}

	return otReq, nil
}

// ApproveByLeader handles first-stage approval
func (s *OvertimeService) ApproveByLeader(leaderUserID uint, otID uint, req dto.ApproveOTReq) (*models.OvertimeRequest, error) {
	otReq, err := s.otRepo.FindByID(otID)
	if err != nil {
		return nil, errors.New("overtime request not found")
	}

	if otReq.LeaderStatus != "pending" {
		return nil, errors.New("overtime request has already been reviewed by leader")
	}

	otReq.LeaderStatus = req.Status

	if req.Status == "rejected" {
		otReq.OverallStatus = "rejected"
	}

	if err := s.otRepo.Update(otReq); err != nil {
		return nil, errors.New("failed to update overtime request")
	}

	// Notify employee
	statusMsg := req.Status
	if otReq.Employee != nil {
		s.notifSvc.Send(
			otReq.Employee.UserID,
			"Overtime Request Update",
			fmt.Sprintf("Your overtime request has been %s by your team leader", statusMsg),
			"ot",
			&otID,
			"overtime_request",
		)
	}

	// If leader approved, notify CEO
	if req.Status == "approved" {
		users, _, _ := s.userRepo.List(1, 100)
		for _, u := range users {
			if u.Role == models.RoleCEO {
				refID := otReq.ID
				s.notifSvc.Send(
					u.ID,
					"Overtime Request Pending CEO Approval",
					fmt.Sprintf("%s's overtime request has been approved by leader and requires your approval",
						otReq.Employee.FullName),
					"ot",
					&refID,
					"overtime_request",
				)
			}
		}
	}

	// Broadcast SSE event
	if s.sseHub != nil {
		s.sseHub.Broadcast(sse.Event{
			Type: "overtime_approved",
			Data: map[string]interface{}{"ot_id": otReq.ID, "status": otReq.OverallStatus},
		})
	}

	return otReq, nil
}

// ApproveByCEO handles second-stage approval
func (s *OvertimeService) ApproveByCEO(ceoUserID uint, otID uint, req dto.ApproveOTReq) (*models.OvertimeRequest, error) {
	otReq, err := s.otRepo.FindByID(otID)
	if err != nil {
		return nil, errors.New("overtime request not found")
	}

	if otReq.LeaderStatus != "approved" {
		return nil, errors.New("overtime request must be approved by leader first")
	}

	if otReq.CEOStatus != "pending" {
		return nil, errors.New("overtime request has already been reviewed by CEO")
	}

	otReq.CEOStatus = req.Status
	otReq.OverallStatus = req.Status

	if err := s.otRepo.Update(otReq); err != nil {
		return nil, errors.New("failed to update overtime request")
	}

	// Notify employee
	if otReq.Employee != nil {
		s.notifSvc.Send(
			otReq.Employee.UserID,
			"Overtime Request Final Decision",
			fmt.Sprintf("Your overtime request has been %s by CEO", req.Status),
			"ot",
			&otID,
			"overtime_request",
		)
	}

	// Broadcast SSE event
	if s.sseHub != nil {
		s.sseHub.Broadcast(sse.Event{
			Type: "overtime_approved",
			Data: map[string]interface{}{"ot_id": otReq.ID, "status": otReq.OverallStatus},
		})
	}

	return otReq, nil
}

func (s *OvertimeService) GetByID(id uint) (*models.OvertimeRequest, error) {
	req, err := s.otRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("overtime request not found")
	}
	return req, nil
}

func (s *OvertimeService) List(filter dto.OTFilter) ([]models.OvertimeRequest, int64, error) {
	return s.otRepo.List(filter)
}

func (s *OvertimeService) Cancel(userID uint, otID uint) error {
	otReq, err := s.otRepo.FindByID(otID)
	if err != nil {
		return errors.New("overtime request not found")
	}

	emp, err := s.empRepo.FindByUserID(userID)
	if err != nil {
		return errors.New("employee profile not found")
	}

	if otReq.EmployeeID != emp.ID {
		return errors.New("you can only cancel your own overtime requests")
	}

	if otReq.OverallStatus == "approved" {
		return errors.New("cannot cancel an approved overtime request")
	}

	return s.otRepo.Delete(otID)
}
