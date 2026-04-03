package services_test

import (
	"testing"

	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/models"
)

func TestCreateEmployee_Success(t *testing.T) {
	cleanTables(t)

	emp, err := empSvc.Create(dto.CreateEmployeeReq{
		Email:           "john@test.com",
		Password:        "password123",
		Role:            models.RoleEmployee,
		FullName:        "John Doe",
		Phone:           "0901234567",
		BasicSalary:     15000000,
		InsuranceSalary: 8000000,
	})

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if emp.FullName != "John Doe" {
		t.Errorf("expected FullName 'John Doe', got '%s'", emp.FullName)
	}
	if emp.User == nil {
		t.Fatal("expected User to be set")
	}
	if emp.User.Role != models.RoleEmployee {
		t.Errorf("expected role employee, got %s", emp.User.Role)
	}
}

func TestCreateEmployee_DuplicateEmail(t *testing.T) {
	cleanTables(t)

	_, _ = empSvc.Create(dto.CreateEmployeeReq{
		Email:    "dup@test.com",
		Password: "password123",
		Role:     models.RoleEmployee,
		FullName: "First User",
	})

	_, err := empSvc.Create(dto.CreateEmployeeReq{
		Email:    "dup@test.com",
		Password: "password123",
		Role:     models.RoleEmployee,
		FullName: "Second User",
	})

	if err == nil {
		t.Fatal("expected error for duplicate email, got nil")
	}
}

func TestGetEmployeeByID_Success(t *testing.T) {
	cleanTables(t)
	_, empID := seedEmployee(t, "emp@test.com", models.RoleEmployee, nil)

	emp, err := empSvc.GetByID(empID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if emp.ID != empID {
		t.Errorf("expected ID %d, got %d", empID, emp.ID)
	}
}

func TestGetEmployeeByID_NotFound(t *testing.T) {
	cleanTables(t)

	_, err := empSvc.GetByID(999)
	if err == nil {
		t.Fatal("expected error for non-existent employee, got nil")
	}
}

func TestUpdateEmployee_Success(t *testing.T) {
	cleanTables(t)
	_, empID := seedEmployee(t, "update@test.com", models.RoleEmployee, nil)

	newSalary := float64(20000000)
	emp, err := empSvc.Update(empID, dto.UpdateEmployeeReq{
		FullName:    "Updated Name",
		BasicSalary: &newSalary,
	})

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if emp.FullName != "Updated Name" {
		t.Errorf("expected 'Updated Name', got '%s'", emp.FullName)
	}
	if emp.BasicSalary != 20000000 {
		t.Errorf("expected salary 20000000, got %f", emp.BasicSalary)
	}
}

func TestListEmployees(t *testing.T) {
	cleanTables(t)
	seedEmployee(t, "emp1@test.com", models.RoleEmployee, nil)
	seedEmployee(t, "emp2@test.com", models.RoleEmployee, nil)

	employees, total, err := empSvc.List(dto.EmployeeFilter{Page: 1, Size: 10})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if total != 2 {
		t.Errorf("expected 2 employees, got %d", total)
	}
	if len(employees) != 2 {
		t.Errorf("expected 2 employees in list, got %d", len(employees))
	}
}

func TestChangePassword_Success(t *testing.T) {
	cleanTables(t)
	userID, _ := seedEmployee(t, "pwd@test.com", models.RoleEmployee, nil)

	err := empSvc.ChangePassword(userID, dto.ChangePasswordReq{
		OldPassword: "password123",
		NewPassword: "newpassword456",
	})

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// Verify new password works
	resp, err := authSvc.Login(dto.LoginRequest{
		Email:    "pwd@test.com",
		Password: "newpassword456",
	})
	if err != nil {
		t.Fatalf("login with new password failed: %v", err)
	}
	if resp.User.Email != "pwd@test.com" {
		t.Error("login returned wrong user")
	}
}

func TestChangePassword_WrongOldPassword(t *testing.T) {
	cleanTables(t)
	userID, _ := seedEmployee(t, "pwdfail@test.com", models.RoleEmployee, nil)

	err := empSvc.ChangePassword(userID, dto.ChangePasswordReq{
		OldPassword: "wrongoldpwd",
		NewPassword: "newpassword456",
	})

	if err == nil {
		t.Fatal("expected error for wrong old password, got nil")
	}
}

func TestSetAllowance_Success(t *testing.T) {
	cleanTables(t)
	_, empID := seedEmployee(t, "allow@test.com", models.RoleEmployee, nil)

	// Create allowance type
	allowance := &models.Allowance{Name: "Transport", Description: "Transport allowance"}
	testDB.Create(allowance)

	err := empSvc.SetAllowance(empID, dto.SetEmployeeAllowanceReq{
		AllowanceID: allowance.ID,
		Amount:      500000,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// Verify
	allowances, err := empSvc.GetAllowances(empID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(allowances) != 1 {
		t.Fatalf("expected 1 allowance, got %d", len(allowances))
	}
	if allowances[0].Amount != 500000 {
		t.Errorf("expected amount 500000, got %f", allowances[0].Amount)
	}
}

func TestDeleteAllowance_Success(t *testing.T) {
	cleanTables(t)
	_, empID := seedEmployee(t, "delallow@test.com", models.RoleEmployee, nil)

	allowance := &models.Allowance{Name: "Meal", Description: "Meal allowance"}
	testDB.Create(allowance)
	empSvc.SetAllowance(empID, dto.SetEmployeeAllowanceReq{AllowanceID: allowance.ID, Amount: 300000})

	err := empSvc.DeleteAllowance(empID, allowance.ID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	allowances, _ := empSvc.GetAllowances(empID)
	if len(allowances) != 0 {
		t.Errorf("expected 0 allowances after delete, got %d", len(allowances))
	}
}
