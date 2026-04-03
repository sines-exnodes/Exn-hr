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
