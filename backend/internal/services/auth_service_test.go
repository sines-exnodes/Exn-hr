package services_test

import (
	"testing"

	"github.com/exn-hr/backend/internal/dto"
)

func TestLogin_Success(t *testing.T) {
	cleanTables(t)
	seedAdmin(t)

	resp, err := authSvc.Login(dto.LoginRequest{
		Email:    "admin@test.com",
		Password: "admin123",
	})

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if resp == nil {
		t.Fatal("expected response, got nil")
	}
	if resp.Token == "" {
		t.Error("expected non-empty token")
	}
	if resp.User.Email != "admin@test.com" {
		t.Errorf("expected email admin@test.com, got %s", resp.User.Email)
	}
	if resp.User.Role != "admin" {
		t.Errorf("expected role admin, got %s", resp.User.Role)
	}
}

func TestLogin_WrongPassword(t *testing.T) {
	cleanTables(t)
	seedAdmin(t)

	_, err := authSvc.Login(dto.LoginRequest{
		Email:    "admin@test.com",
		Password: "wrongpassword",
	})

	if err == nil {
		t.Fatal("expected error for wrong password, got nil")
	}
	if err.Error() != "invalid email or password" {
		t.Errorf("expected 'invalid email or password', got '%s'", err.Error())
	}
}

func TestLogin_NonExistentEmail(t *testing.T) {
	cleanTables(t)

	_, err := authSvc.Login(dto.LoginRequest{
		Email:    "nonexistent@test.com",
		Password: "password123",
	})

	if err == nil {
		t.Fatal("expected error for non-existent email, got nil")
	}
}

func TestLogin_InactiveAccount(t *testing.T) {
	cleanTables(t)
	seedAdmin(t)

	// Deactivate admin
	testDB.Exec("UPDATE users SET is_active = false WHERE email = 'admin@test.com'")

	_, err := authSvc.Login(dto.LoginRequest{
		Email:    "admin@test.com",
		Password: "admin123",
	})

	if err == nil {
		t.Fatal("expected error for inactive account, got nil")
	}
	if err.Error() != "account is deactivated" {
		t.Errorf("expected 'account is deactivated', got '%s'", err.Error())
	}
}
