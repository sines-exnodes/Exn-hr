package services_test

import (
	"testing"

	"github.com/exn-hr/backend/internal/dto"
)

// ==================== Department Tests ====================

func TestCreateDepartment_Success(t *testing.T) {
	cleanTables(t)

	dept, err := deptSvc.Create(dto.CreateDepartmentReq{
		Name:        "Engineering",
		Description: "Engineering Department",
	})

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if dept.Name != "Engineering" {
		t.Errorf("expected name 'Engineering', got '%s'", dept.Name)
	}
	if dept.ID == 0 {
		t.Error("expected non-zero ID")
	}
}

func TestGetDepartmentByID_Success(t *testing.T) {
	cleanTables(t)

	created, _ := deptSvc.Create(dto.CreateDepartmentReq{Name: "HR", Description: "HR Department"})

	dept, err := deptSvc.GetByID(created.ID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if dept.Name != "HR" {
		t.Errorf("expected 'HR', got '%s'", dept.Name)
	}
}

func TestGetDepartmentByID_NotFound(t *testing.T) {
	cleanTables(t)

	_, err := deptSvc.GetByID(999)
	if err == nil {
		t.Fatal("expected error for non-existent department, got nil")
	}
}

func TestUpdateDepartment_Success(t *testing.T) {
	cleanTables(t)

	created, _ := deptSvc.Create(dto.CreateDepartmentReq{Name: "Old Name"})

	updated, err := deptSvc.Update(created.ID, dto.UpdateDepartmentReq{Name: "New Name"})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if updated.Name != "New Name" {
		t.Errorf("expected 'New Name', got '%s'", updated.Name)
	}
}

func TestDeleteDepartment_Success(t *testing.T) {
	cleanTables(t)

	created, _ := deptSvc.Create(dto.CreateDepartmentReq{Name: "ToDelete"})

	err := deptSvc.Delete(created.ID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	_, err = deptSvc.GetByID(created.ID)
	if err == nil {
		t.Error("expected error after deletion, got nil")
	}
}

func TestListDepartments(t *testing.T) {
	cleanTables(t)

	deptSvc.Create(dto.CreateDepartmentReq{Name: "Dept A"})
	deptSvc.Create(dto.CreateDepartmentReq{Name: "Dept B"})

	depts, err := deptSvc.List()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(depts) != 2 {
		t.Errorf("expected 2 departments, got %d", len(depts))
	}
}

// ==================== Team Tests ====================

func TestCreateTeam_Success(t *testing.T) {
	cleanTables(t)

	dept, _ := deptSvc.Create(dto.CreateDepartmentReq{Name: "Engineering"})

	team, err := teamSvc.Create(dto.CreateTeamReq{
		Name:         "Backend Team",
		DepartmentID: dept.ID,
	})

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if team.Name != "Backend Team" {
		t.Errorf("expected 'Backend Team', got '%s'", team.Name)
	}
	if team.DepartmentID != dept.ID {
		t.Errorf("expected department_id %d, got %d", dept.ID, team.DepartmentID)
	}
}

func TestCreateTeam_InvalidDepartment(t *testing.T) {
	cleanTables(t)

	_, err := teamSvc.Create(dto.CreateTeamReq{
		Name:         "Team X",
		DepartmentID: 999,
	})

	if err == nil {
		t.Fatal("expected error for invalid department, got nil")
	}
}

func TestGetTeamByID(t *testing.T) {
	cleanTables(t)

	dept, _ := deptSvc.Create(dto.CreateDepartmentReq{Name: "D"})
	created, _ := teamSvc.Create(dto.CreateTeamReq{Name: "T", DepartmentID: dept.ID})

	team, err := teamSvc.GetByID(created.ID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if team.Name != "T" {
		t.Errorf("expected 'T', got '%s'", team.Name)
	}
}

func TestUpdateTeam_Success(t *testing.T) {
	cleanTables(t)

	dept, _ := deptSvc.Create(dto.CreateDepartmentReq{Name: "D"})
	created, _ := teamSvc.Create(dto.CreateTeamReq{Name: "Old Team", DepartmentID: dept.ID})

	updated, err := teamSvc.Update(created.ID, dto.UpdateTeamReq{Name: "New Team"})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if updated.Name != "New Team" {
		t.Errorf("expected 'New Team', got '%s'", updated.Name)
	}
}

func TestDeleteTeam_Success(t *testing.T) {
	cleanTables(t)

	dept, _ := deptSvc.Create(dto.CreateDepartmentReq{Name: "D"})
	created, _ := teamSvc.Create(dto.CreateTeamReq{Name: "ToDelete", DepartmentID: dept.ID})

	err := teamSvc.Delete(created.ID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	_, err = teamSvc.GetByID(created.ID)
	if err == nil {
		t.Error("expected error after deletion")
	}
}

func TestListTeams(t *testing.T) {
	cleanTables(t)

	dept, _ := deptSvc.Create(dto.CreateDepartmentReq{Name: "D"})
	teamSvc.Create(dto.CreateTeamReq{Name: "T1", DepartmentID: dept.ID})
	teamSvc.Create(dto.CreateTeamReq{Name: "T2", DepartmentID: dept.ID})

	teams, err := teamSvc.List()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(teams) != 2 {
		t.Errorf("expected 2 teams, got %d", len(teams))
	}
}

func TestListTeamsByDepartment(t *testing.T) {
	cleanTables(t)

	dept1, _ := deptSvc.Create(dto.CreateDepartmentReq{Name: "D1"})
	dept2, _ := deptSvc.Create(dto.CreateDepartmentReq{Name: "D2"})
	teamSvc.Create(dto.CreateTeamReq{Name: "T1", DepartmentID: dept1.ID})
	teamSvc.Create(dto.CreateTeamReq{Name: "T2", DepartmentID: dept1.ID})
	teamSvc.Create(dto.CreateTeamReq{Name: "T3", DepartmentID: dept2.ID})

	teams, err := teamSvc.ListByDepartment(dept1.ID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(teams) != 2 {
		t.Errorf("expected 2 teams for dept1, got %d", len(teams))
	}
}
