package services_test

import (
	"testing"

	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/models"
)

func TestCreateLeaveRequest_Paid_Success(t *testing.T) {
	cleanTables(t)
	userID, _ := seedEmployee(t, "leave@test.com", models.RoleEmployee, nil)

	leave, err := leaveSvc.Create(userID, dto.CreateLeaveReq{
		Type:      "paid",
		StartDate: "2026-04-01",
		EndDate:   "2026-04-02",
		Days:      2,
		Reason:    "Personal leave",
	})

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if leave.Type != "paid" {
		t.Errorf("expected type 'paid', got '%s'", leave.Type)
	}
	if leave.OverallStatus != "pending" {
		t.Errorf("expected status 'pending', got '%s'", leave.OverallStatus)
	}
	if leave.Days != 2 {
		t.Errorf("expected 2 days, got %f", leave.Days)
	}
}

func TestCreateLeaveRequest_Unpaid_Success(t *testing.T) {
	cleanTables(t)
	userID, _ := seedEmployee(t, "unpaid@test.com", models.RoleEmployee, nil)

	leave, err := leaveSvc.Create(userID, dto.CreateLeaveReq{
		Type:      "unpaid",
		StartDate: "2026-04-01",
		EndDate:   "2026-04-05",
		Days:      5,
		Reason:    "Extended leave",
	})

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if leave.Type != "unpaid" {
		t.Errorf("expected type 'unpaid', got '%s'", leave.Type)
	}
}

func TestCreateLeaveRequest_InsufficientBalance(t *testing.T) {
	cleanTables(t)
	userID, _ := seedEmployee(t, "nobalance@test.com", models.RoleEmployee, nil)

	_, err := leaveSvc.Create(userID, dto.CreateLeaveReq{
		Type:      "paid",
		StartDate: "2026-04-01",
		EndDate:   "2026-04-20",
		Days:      15,
		Reason:    "Long vacation",
	})

	if err == nil {
		t.Fatal("expected error for insufficient balance, got nil")
	}
}

func TestLeaveApprovalFlow_LeaderThenHR(t *testing.T) {
	cleanTables(t)

	leaderUserID, empUserID, _ := seedDepartmentWithLeaderAndEmployee(t)
	hrUserID, _ := seedEmployee(t, "hr@test.com", models.RoleHR, nil)

	leave, err := leaveSvc.Create(empUserID, dto.CreateLeaveReq{
		Type:      "paid",
		StartDate: "2026-04-01",
		EndDate:   "2026-04-02",
		Days:      2,
		Reason:    "Personal",
	})
	if err != nil {
		t.Fatalf("create leave failed: %v", err)
	}

	if leave.LeaderStatus != "pending" {
		t.Errorf("expected leader_status 'pending', got '%s'", leave.LeaderStatus)
	}

	// Step 1: Leader approves
	leave, err = leaveSvc.ApproveByLeader(leaderUserID, leave.ID, dto.ApproveLeaveReq{Status: "approved"})
	if err != nil {
		t.Fatalf("leader approve failed: %v", err)
	}
	if leave.LeaderStatus != "approved" {
		t.Errorf("expected leader_status 'approved', got '%s'", leave.LeaderStatus)
	}
	if leave.OverallStatus != "pending" {
		t.Errorf("expected overall_status still 'pending' after leader approval, got '%s'", leave.OverallStatus)
	}

	// Step 2: HR approves
	leave, err = leaveSvc.ApproveByHR(hrUserID, leave.ID, dto.ApproveLeaveReq{Status: "approved"})
	if err != nil {
		t.Fatalf("HR approve failed: %v", err)
	}
	if leave.HRStatus != "approved" {
		t.Errorf("expected hr_status 'approved', got '%s'", leave.HRStatus)
	}
	if leave.OverallStatus != "approved" {
		t.Errorf("expected overall_status 'approved', got '%s'", leave.OverallStatus)
	}
}

func TestLeaveApproval_LeaderReject(t *testing.T) {
	cleanTables(t)

	leaderUserID, empUserID, _ := seedDepartmentWithLeaderAndEmployee(t)

	leave, _ := leaveSvc.Create(empUserID, dto.CreateLeaveReq{
		Type: "paid", StartDate: "2026-04-01", EndDate: "2026-04-02", Days: 1,
	})

	leave, err := leaveSvc.ApproveByLeader(leaderUserID, leave.ID, dto.ApproveLeaveReq{Status: "rejected"})
	if err != nil {
		t.Fatalf("leader reject failed: %v", err)
	}
	if leave.OverallStatus != "rejected" {
		t.Errorf("expected overall_status 'rejected', got '%s'", leave.OverallStatus)
	}
}

func TestLeaveApproval_HRCannotApproveBeforeLeader(t *testing.T) {
	cleanTables(t)

	empUserID, _ := seedEmployee(t, "emp@test.com", models.RoleEmployee, nil)
	hrUserID, _ := seedEmployee(t, "hr@test.com", models.RoleHR, nil)

	leave, _ := leaveSvc.Create(empUserID, dto.CreateLeaveReq{
		Type: "paid", StartDate: "2026-04-01", EndDate: "2026-04-02", Days: 1,
	})

	_, err := leaveSvc.ApproveByHR(hrUserID, leave.ID, dto.ApproveLeaveReq{Status: "approved"})
	if err == nil {
		t.Fatal("expected error when HR approves before leader, got nil")
	}
	if err.Error() != "leave request must be approved by leader first" {
		t.Errorf("unexpected error: %s", err.Error())
	}
}

func TestGetLeaveBalance(t *testing.T) {
	cleanTables(t)
	userID, _ := seedEmployee(t, "balance@test.com", models.RoleEmployee, nil)

	balance, err := leaveSvc.GetBalance(userID, 2026)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if balance.TotalDays != 12 {
		t.Errorf("expected 12 total days, got %d", balance.TotalDays)
	}
	if balance.UsedDays != 0 {
		t.Errorf("expected 0 used days, got %d", balance.UsedDays)
	}
	if balance.RemainingDays != 12 {
		t.Errorf("expected 12 remaining days, got %d", balance.RemainingDays)
	}
}

func TestLeaveBalance_DecreasesAfterApproval(t *testing.T) {
	cleanTables(t)

	leaderUserID, empUserID, _ := seedDepartmentWithLeaderAndEmployee(t)
	hrUserID, _ := seedEmployee(t, "hr@test.com", models.RoleHR, nil)

	leave, _ := leaveSvc.Create(empUserID, dto.CreateLeaveReq{
		Type: "paid", StartDate: "2026-04-01", EndDate: "2026-04-02", Days: 2,
	})
	leaveSvc.ApproveByLeader(leaderUserID, leave.ID, dto.ApproveLeaveReq{Status: "approved"})
	leaveSvc.ApproveByHR(hrUserID, leave.ID, dto.ApproveLeaveReq{Status: "approved"})

	balance, err := leaveSvc.GetBalance(empUserID, 2026)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if balance.UsedDays != 2 {
		t.Errorf("expected 2 used days, got %d", balance.UsedDays)
	}
	if balance.RemainingDays != 10 {
		t.Errorf("expected 10 remaining days, got %d", balance.RemainingDays)
	}
}

func TestCancelLeave_Success(t *testing.T) {
	cleanTables(t)
	userID, _ := seedEmployee(t, "cancel@test.com", models.RoleEmployee, nil)

	leave, _ := leaveSvc.Create(userID, dto.CreateLeaveReq{
		Type: "paid", StartDate: "2026-04-01", EndDate: "2026-04-02", Days: 1,
	})

	err := leaveSvc.Cancel(userID, leave.ID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	_, err = leaveSvc.GetByID(leave.ID)
	if err == nil {
		t.Error("expected error after cancellation, got nil")
	}
}

func TestCancelLeave_CannotCancelApproved(t *testing.T) {
	cleanTables(t)

	leaderUserID, empUserID, _ := seedDepartmentWithLeaderAndEmployee(t)
	hrUserID, _ := seedEmployee(t, "hr@test.com", models.RoleHR, nil)

	leave, _ := leaveSvc.Create(empUserID, dto.CreateLeaveReq{
		Type: "paid", StartDate: "2026-04-01", EndDate: "2026-04-02", Days: 1,
	})
	leaveSvc.ApproveByLeader(leaderUserID, leave.ID, dto.ApproveLeaveReq{Status: "approved"})
	leaveSvc.ApproveByHR(hrUserID, leave.ID, dto.ApproveLeaveReq{Status: "approved"})

	err := leaveSvc.Cancel(empUserID, leave.ID)
	if err == nil {
		t.Fatal("expected error when cancelling approved leave, got nil")
	}
}

func TestCancelLeave_CannotCancelOthersLeave(t *testing.T) {
	cleanTables(t)
	userID1, _ := seedEmployee(t, "emp1@test.com", models.RoleEmployee, nil)
	userID2, _ := seedEmployee(t, "emp2@test.com", models.RoleEmployee, nil)

	leave, _ := leaveSvc.Create(userID1, dto.CreateLeaveReq{
		Type: "paid", StartDate: "2026-04-01", EndDate: "2026-04-02", Days: 1,
	})

	err := leaveSvc.Cancel(userID2, leave.ID)
	if err == nil {
		t.Fatal("expected error when cancelling other's leave, got nil")
	}
}

func TestListLeave(t *testing.T) {
	cleanTables(t)
	userID, _ := seedEmployee(t, "list@test.com", models.RoleEmployee, nil)

	leaveSvc.Create(userID, dto.CreateLeaveReq{
		Type: "paid", StartDate: "2026-04-01", EndDate: "2026-04-02", Days: 1,
	})
	leaveSvc.Create(userID, dto.CreateLeaveReq{
		Type: "unpaid", StartDate: "2026-05-01", EndDate: "2026-05-02", Days: 1,
	})

	leaves, total, err := leaveSvc.List(dto.LeaveFilter{Page: 1, Size: 10})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if total != 2 {
		t.Errorf("expected 2 leave requests, got %d", total)
	}
	if len(leaves) != 2 {
		t.Errorf("expected 2 in list, got %d", len(leaves))
	}
}
