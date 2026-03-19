package services

import (
	"errors"

	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/models"
	"github.com/exn-hr/backend/internal/repositories"
	"github.com/exn-hr/backend/pkg/utils"
)

type EmployeeService struct {
	empRepo  *repositories.EmployeeRepository
	userRepo *repositories.UserRepository
	notifSvc *NotificationService
}

func NewEmployeeService(
	empRepo *repositories.EmployeeRepository,
	userRepo *repositories.UserRepository,
	notifSvc *NotificationService,
) *EmployeeService {
	return &EmployeeService{empRepo: empRepo, userRepo: userRepo, notifSvc: notifSvc}
}

func (s *EmployeeService) Create(req dto.CreateEmployeeReq) (*models.Employee, error) {
	hash, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	user := &models.User{
		Email:        req.Email,
		PasswordHash: hash,
		Role:         req.Role,
		IsActive:     true,
	}
	if err := s.empRepo.CreateUser(user); err != nil {
		return nil, errors.New("email already exists or failed to create user")
	}

	emp := &models.Employee{
		UserID:          user.ID,
		FullName:        req.FullName,
		Phone:           req.Phone,
		Address:         req.Address,
		DOB:             req.DOB,
		Gender:          req.Gender,
		JoinDate:        req.JoinDate,
		Position:        req.Position,
		TeamID:          req.TeamID,
		BasicSalary:     req.BasicSalary,
		InsuranceSalary: req.InsuranceSalary,
	}
	if err := s.empRepo.CreateEmployee(emp); err != nil {
		return nil, errors.New("failed to create employee profile")
	}

	emp.User = user
	return emp, nil
}

func (s *EmployeeService) GetByID(id uint) (*models.Employee, error) {
	emp, err := s.empRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("employee not found")
	}
	return emp, nil
}

func (s *EmployeeService) GetByUserID(userID uint) (*models.Employee, error) {
	emp, err := s.empRepo.FindByUserID(userID)
	if err != nil {
		return nil, errors.New("employee not found")
	}
	return emp, nil
}

func (s *EmployeeService) Update(id uint, req dto.UpdateEmployeeReq) (*models.Employee, error) {
	emp, err := s.empRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("employee not found")
	}

	if req.FullName != "" {
		emp.FullName = req.FullName
	}
	if req.Phone != "" {
		emp.Phone = req.Phone
	}
	if req.Address != "" {
		emp.Address = req.Address
	}
	if req.DOB != "" {
		emp.DOB = req.DOB
	}
	if req.Gender != "" {
		emp.Gender = req.Gender
	}
	if req.Position != "" {
		emp.Position = req.Position
	}
	if req.TeamID != nil {
		emp.TeamID = req.TeamID
	}
	if req.BasicSalary != nil {
		emp.BasicSalary = *req.BasicSalary
	}
	if req.InsuranceSalary != nil {
		emp.InsuranceSalary = *req.InsuranceSalary
	}

	if err := s.empRepo.UpdateEmployee(emp); err != nil {
		return nil, errors.New("failed to update employee")
	}

	// Update user active status if provided
	if req.IsActive != nil && emp.User != nil {
		emp.User.IsActive = *req.IsActive
		s.empRepo.UpdateUser(emp.User)
	}

	return emp, nil
}

func (s *EmployeeService) List(filter dto.EmployeeFilter) ([]models.Employee, int64, error) {
	return s.empRepo.List(filter)
}

func (s *EmployeeService) ChangePassword(userID uint, req dto.ChangePasswordReq) error {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return errors.New("user not found")
	}
	if !utils.CheckPassword(req.OldPassword, user.PasswordHash) {
		return errors.New("current password is incorrect")
	}
	hash, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		return errors.New("failed to hash password")
	}
	user.PasswordHash = hash
	return s.userRepo.Update(user)
}

func (s *EmployeeService) SetAllowance(employeeID uint, req dto.SetEmployeeAllowanceReq) error {
	// Verify employee exists
	if _, err := s.empRepo.FindByID(employeeID); err != nil {
		return errors.New("employee not found")
	}
	ea := &models.EmployeeAllowance{
		EmployeeID:  employeeID,
		AllowanceID: req.AllowanceID,
		Amount:      req.Amount,
	}
	return s.empRepo.SetAllowance(ea)
}

func (s *EmployeeService) DeleteAllowance(employeeID, allowanceID uint) error {
	return s.empRepo.DeleteAllowance(employeeID, allowanceID)
}

func (s *EmployeeService) GetAllowances(employeeID uint) ([]models.EmployeeAllowance, error) {
	return s.empRepo.GetAllowances(employeeID)
}
