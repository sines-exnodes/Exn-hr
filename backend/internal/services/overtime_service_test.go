package services_test

import (
	"testing"

	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/models"
)

func TestCreateOvertimeRequest_Success(t *testing.T) {
	cleanTables(t)
	userID, _ := seedEmployee(t, "ot@test.com", models.RoleEmployee, nil)

	ot, err := otSvc.Create(userID, dto.CreateOTReq{
		Date:      "2026-04-01",
		StartTime: "18:00",
		EndTime:   "21:00",
		Hours:     3,
		Reason:    "Urgent deployment",
	})

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if ot.OverallStatus != "pending" {
		t.Errorf("expected status 'pending', got '%s'", ot.OverallStatus)
	}
	if ot.Hours != 3 {
		t.Errorf("expected 3 hours, got %f", ot.Hours)
	}
}

func TestOvertimeApprovalFlow_LeaderThenCEO(t *testing.T) {
	cleanTables(t)

	// Setup
	leaderUserID, leaderEmpID := seedEmployee(t, "leader@test.com", models.RoleLeader, nil)
	_, teamID := seedDepartmentAndTeam(t, &leaderEmpID)
	empUserID, _ := seedEmployee(t, "emp@test.com", models.RoleEmployee, &teamID)
	ceoUserID, _ := seedEmployee(t, "ceo@test.com", models.RoleCEO, nil)

	// Employee creates OT request
	ot, _ := otSvc.Create(empUserID, dto.CreateOTReq{
		Date: "2026-04-01", StartTime: "18:00", EndTime: "21:00", Hours: 3,
		Reason: "Deployment",
	})

	// Step 1: Leader approves
	ot, err := otSvc.ApproveByLeader(leaderUserID, ot.ID, dto.ApproveOTReq{Status: "approved"})
	if err != nil {
		t.Fatalf("leader approve failed: %v", err)
	}
	if ot.LeaderStatus != "approved" {
		t.Errorf("expected leader_status 'approved', got '%s'", ot.LeaderStatus)
	}
	if ot.OverallStatus != "pending" {
		t.Errorf("expected overall_status 'pending' after leader approval, got '%s'", ot.OverallStatus)
	}

	// Step 2: CEO approves
	ot, err = otSvc.ApproveByCEO(ceoUserID, ot.ID, dto.ApproveOTReq{Status: "approved"})
	if err != nil {
		t.Fatalf("CEO approve failed: %v", err)
	}
	if ot.CEOStatus != "approved" {
		t.Errorf("expected ceo_status 'approved', got '%s'", ot.CEOStatus)
	}
	if ot.OverallStatus != "approved" {
		t.Errorf("expected overall_status 'approved', got '%s'", ot.OverallStatus)
	}
}

func TestOvertimeApproval_LeaderReject(t *testing.T) {
	cleanTables(t)

	leaderUserID, leaderEmpID := seedEmployee(t, "leader@test.com", models.RoleLeader, nil)
	_, teamID := seedDepartmentAndTeam(t, &leaderEmpID)
	empUserID, _ := seedEmployee(t, "emp@test.com", models.RoleEmployee, &teamID)

	ot, _ := otSvc.Create(empUserID, dto.CreateOTReq{
		Date: "2026-04-01", StartTime: "18:00", EndTime: "21:00", Hours: 3,
	})

	ot, err := otSvc.ApproveByLeader(leaderUserID, ot.ID, dto.ApproveOTReq{Status: "rejected"})
	if err != nil {
		t.Fatalf("leader reject failed: %v", err)
	}
	if ot.OverallStatus != "rejected" {
		t.Errorf("expected overall_status 'rejected', got '%s'", ot.OverallStatus)
	}
}

func TestOvertimeApproval_CEOCannotApproveBeforeLeader(t *testing.T) {
	cleanTables(t)

	empUserID, _ := seedEmployee(t, "emp@test.com", models.RoleEmployee, nil)
	ceoUserID, _ := seedEmployee(t, "ceo@test.com", models.RoleCEO, nil)

	ot, _ := otSvc.Create(empUserID, dto.CreateOTReq{
		Date: "2026-04-01", StartTime: "18:00", EndTime: "21:00", Hours: 3,
	})

	_, err := otSvc.ApproveByCEO(ceoUserID, ot.ID, dto.ApproveOTReq{Status: "approved"})
	if err == nil {
		t.Fatal("expected error when CEO approves before leader, got nil")
	}
	if err.Error() != "overtime request must be approved by leader first" {
		t.Errorf("unexpected error: %s", err.Error())
	}
}

func TestOvertimeApproval_CEOReject(t *testing.T) {
	cleanTables(t)

	leaderUserID, leaderEmpID := seedEmployee(t, "leader@test.com", models.RoleLeader, nil)
	_, teamID := seedDepartmentAndTeam(t, &leaderEmpID)
	empUserID, _ := seedEmployee(t, "emp@test.com", models.RoleEmployee, &teamID)
	ceoUserID, _ := seedEmployee(t, "ceo@test.com", models.RoleCEO, nil)

	ot, _ := otSvc.Create(empUserID, dto.CreateOTReq{
		Date: "2026-04-01", StartTime: "18:00", EndTime: "21:00", Hours: 3,
	})

	// Leader approves, CEO rejects
	otSvc.ApproveByLeader(leaderUserID, ot.ID, dto.ApproveOTReq{Status: "approved"})
	ot, err := otSvc.ApproveByCEO(ceoUserID, ot.ID, dto.ApproveOTReq{Status: "rejected"})

	if err != nil {
		t.Fatalf("CEO reject failed: %v", err)
	}
	if ot.OverallStatus != "rejected" {
		t.Errorf("expected overall_status 'rejected', got '%s'", ot.OverallStatus)
	}
}

func TestCancelOvertime_Success(t *testing.T) {
	cleanTables(t)
	userID, _ := seedEmployee(t, "cancel@test.com", models.RoleEmployee, nil)

	ot, _ := otSvc.Create(userID, dto.CreateOTReq{
		Date: "2026-04-01", StartTime: "18:00", EndTime: "21:00", Hours: 3,
	})

	err := otSvc.Cancel(userID, ot.ID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	_, err = otSvc.GetByID(ot.ID)
	if err == nil {
		t.Error("expected error after cancellation")
	}
}

func TestCancelOvertime_CannotCancelApproved(t *testing.T) {
	cleanTables(t)

	leaderUserID, leaderEmpID := seedEmployee(t, "leader@test.com", models.RoleLeader, nil)
	_, teamID := seedDepartmentAndTeam(t, &leaderEmpID)
	empUserID, _ := seedEmployee(t, "emp@test.com", models.RoleEmployee, &teamID)
	ceoUserID, _ := seedEmployee(t, "ceo@test.com", models.RoleCEO, nil)

	ot, _ := otSvc.Create(empUserID, dto.CreateOTReq{
		Date: "2026-04-01", StartTime: "18:00", EndTime: "21:00", Hours: 3,
	})
	otSvc.ApproveByLeader(leaderUserID, ot.ID, dto.ApproveOTReq{Status: "approved"})
	otSvc.ApproveByCEO(ceoUserID, ot.ID, dto.ApproveOTReq{Status: "approved"})

	err := otSvc.Cancel(empUserID, ot.ID)
	if err == nil {
		t.Fatal("expected error when cancelling approved OT, got nil")
	}
}

func TestCancelOvertime_CannotCancelOthers(t *testing.T) {
	cleanTables(t)
	userID1, _ := seedEmployee(t, "emp1@test.com", models.RoleEmployee, nil)
	userID2, _ := seedEmployee(t, "emp2@test.com", models.RoleEmployee, nil)

	ot, _ := otSvc.Create(userID1, dto.CreateOTReq{
		Date: "2026-04-01", StartTime: "18:00", EndTime: "21:00", Hours: 3,
	})

	err := otSvc.Cancel(userID2, ot.ID)
	if err == nil {
		t.Fatal("expected error when cancelling other's OT, got nil")
	}
}

func TestListOvertime(t *testing.T) {
	cleanTables(t)
	userID, _ := seedEmployee(t, "list@test.com", models.RoleEmployee, nil)

	otSvc.Create(userID, dto.CreateOTReq{
		Date: "2026-04-01", StartTime: "18:00", EndTime: "21:00", Hours: 3,
	})
	otSvc.Create(userID, dto.CreateOTReq{
		Date: "2026-04-02", StartTime: "18:00", EndTime: "20:00", Hours: 2,
	})

	ots, total, err := otSvc.List(dto.OTFilter{Page: 1, Size: 10})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if total != 2 {
		t.Errorf("expected 2 OT requests, got %d", total)
	}
	if len(ots) != 2 {
		t.Errorf("expected 2 in list, got %d", len(ots))
	}
}
