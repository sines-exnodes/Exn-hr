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
		PersonalEmail:   req.PersonalEmail,
		Gender:          req.Gender,
		PermanentAddress: req.PermanentAddress,
		CurrentAddress:  req.CurrentAddress,
		DOB:             req.DOB,
		Nationality:     req.Nationality,
		IDNumber:        req.IDNumber,
		IDIssueDate:     req.IDIssueDate,
		IDFrontImage:    req.IDFrontImage,
		IDBackImage:     req.IDBackImage,
		Education:       req.Education,
		MaritalStatus:   req.MaritalStatus,
		EmergencyContactName:     req.EmergencyContactName,
		EmergencyContactRelation: req.EmergencyContactRelation,
		EmergencyContactPhone:    req.EmergencyContactPhone,
		DepartmentID:    req.DepartmentID,
		ManagerID:       req.ManagerID,
		JoinDate:        req.JoinDate,
		ContractType:    req.ContractType,
		ContractSignDate: req.ContractSignDate,
		ContractEndDate:  req.ContractEndDate,
		ContractRenewal:  req.ContractRenewal,
		BasicSalary:     req.BasicSalary,
		InsuranceSalary: req.InsuranceSalary,
		BankAccount:     req.BankAccount,
		BankName:        req.BankName,
		BankHolderName:  req.BankHolderName,
		PaymentMethod:   req.PaymentMethod,
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

func (s *EmployeeService) UpdateMyProfile(userID uint, req dto.UpdateMyProfileReq) (*models.Employee, error) {
	emp, err := s.empRepo.FindByUserID(userID)
	if err != nil {
		return nil, errors.New("employee profile not found")
	}
	if req.Phone != "" {
		emp.Phone = req.Phone
	}
	if req.PersonalEmail != "" {
		emp.PersonalEmail = req.PersonalEmail
	}
	if req.PermanentAddress != "" {
		emp.PermanentAddress = req.PermanentAddress
	}
	if req.CurrentAddress != "" {
		emp.CurrentAddress = req.CurrentAddress
	}
	if req.DOB != "" {
		emp.DOB = req.DOB
	}
	if req.Gender != "" {
		emp.Gender = req.Gender
	}
	if req.Nationality != "" {
		emp.Nationality = req.Nationality
	}
	if req.IDNumber != "" {
		emp.IDNumber = req.IDNumber
	}
	if req.IDIssueDate != "" {
		emp.IDIssueDate = req.IDIssueDate
	}
	if req.IDFrontImage != "" {
		emp.IDFrontImage = req.IDFrontImage
	}
	if req.IDBackImage != "" {
		emp.IDBackImage = req.IDBackImage
	}
	if req.Education != "" {
		emp.Education = req.Education
	}
	if req.MaritalStatus != "" {
		emp.MaritalStatus = req.MaritalStatus
	}
	if req.EmergencyContactName != "" {
		emp.EmergencyContactName = req.EmergencyContactName
	}
	if req.EmergencyContactRelation != "" {
		emp.EmergencyContactRelation = req.EmergencyContactRelation
	}
	if req.EmergencyContactPhone != "" {
		emp.EmergencyContactPhone = req.EmergencyContactPhone
	}
	if req.BankAccount != "" {
		emp.BankAccount = req.BankAccount
	}
	if req.BankName != "" {
		emp.BankName = req.BankName
	}
	if req.BankHolderName != "" {
		emp.BankHolderName = req.BankHolderName
	}
	if err := s.empRepo.UpdateEmployee(emp); err != nil {
		return nil, errors.New("failed to update profile")
	}
	return emp, nil
}

func (s *EmployeeService) Update(id uint, req dto.UpdateEmployeeReq) (*models.Employee, error) {
	emp, err := s.empRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("employee not found")
	}

	// Thông tin cá nhân
	if req.FullName != "" {
		emp.FullName = req.FullName
	}
	if req.Phone != "" {
		emp.Phone = req.Phone
	}
	if req.PersonalEmail != "" {
		emp.PersonalEmail = req.PersonalEmail
	}
	if req.Gender != "" {
		emp.Gender = req.Gender
	}
	if req.PermanentAddress != "" {
		emp.PermanentAddress = req.PermanentAddress
	}
	if req.CurrentAddress != "" {
		emp.CurrentAddress = req.CurrentAddress
	}
	if req.DOB != "" {
		emp.DOB = req.DOB
	}
	if req.Nationality != "" {
		emp.Nationality = req.Nationality
	}
	if req.IDNumber != "" {
		emp.IDNumber = req.IDNumber
	}
	if req.IDIssueDate != "" {
		emp.IDIssueDate = req.IDIssueDate
	}
	if req.IDFrontImage != "" {
		emp.IDFrontImage = req.IDFrontImage
	}
	if req.IDBackImage != "" {
		emp.IDBackImage = req.IDBackImage
	}
	if req.Education != "" {
		emp.Education = req.Education
	}
	if req.MaritalStatus != "" {
		emp.MaritalStatus = req.MaritalStatus
	}

	// Liên hệ khẩn cấp
	if req.EmergencyContactName != "" {
		emp.EmergencyContactName = req.EmergencyContactName
	}
	if req.EmergencyContactRelation != "" {
		emp.EmergencyContactRelation = req.EmergencyContactRelation
	}
	if req.EmergencyContactPhone != "" {
		emp.EmergencyContactPhone = req.EmergencyContactPhone
	}

	// Thông tin công việc
	if req.ClearDepartment != nil && *req.ClearDepartment {
		emp.DepartmentID = nil
	} else if req.DepartmentID != nil {
		emp.DepartmentID = req.DepartmentID
	}
	if req.ClearManager != nil && *req.ClearManager {
		emp.ManagerID = nil
	} else if req.ManagerID != nil {
		emp.ManagerID = req.ManagerID
	}
	if req.JoinDate != "" {
		emp.JoinDate = req.JoinDate
	}
	if req.ContractType != "" {
		emp.ContractType = req.ContractType
	}
	if req.ContractSignDate != "" {
		emp.ContractSignDate = req.ContractSignDate
	}
	if req.ContractEndDate != "" {
		emp.ContractEndDate = req.ContractEndDate
	}
	if req.ContractRenewal != nil {
		emp.ContractRenewal = *req.ContractRenewal
	}

	// Lương
	if req.BasicSalary != nil {
		emp.BasicSalary = *req.BasicSalary
	}
	if req.InsuranceSalary != nil {
		emp.InsuranceSalary = *req.InsuranceSalary
	}

	// Ngân hàng
	if req.BankAccount != "" {
		emp.BankAccount = req.BankAccount
	}
	if req.BankName != "" {
		emp.BankName = req.BankName
	}
	if req.BankHolderName != "" {
		emp.BankHolderName = req.BankHolderName
	}
	if req.PaymentMethod != "" {
		emp.PaymentMethod = req.PaymentMethod
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

// --- Dependent CRUD ---

func (s *EmployeeService) ListDependents(employeeID uint) ([]models.Dependent, error) {
	return s.empRepo.ListDependents(employeeID)
}

func (s *EmployeeService) CreateDependent(employeeID uint, req dto.CreateDependentReq) (*models.Dependent, error) {
	if _, err := s.empRepo.FindByID(employeeID); err != nil {
		return nil, errors.New("employee not found")
	}
	dep := &models.Dependent{
		EmployeeID:   employeeID,
		FullName:     req.FullName,
		DOB:          req.DOB,
		Gender:       req.Gender,
		Relationship: req.Relationship,
	}
	if err := s.empRepo.CreateDependent(dep); err != nil {
		return nil, errors.New("failed to create dependent")
	}
	return dep, nil
}

func (s *EmployeeService) UpdateDependent(depID uint, req dto.UpdateDependentReq) (*models.Dependent, error) {
	dep, err := s.empRepo.FindDependentByID(depID)
	if err != nil {
		return nil, errors.New("dependent not found")
	}
	if req.FullName != "" {
		dep.FullName = req.FullName
	}
	if req.DOB != "" {
		dep.DOB = req.DOB
	}
	if req.Gender != "" {
		dep.Gender = req.Gender
	}
	if req.Relationship != "" {
		dep.Relationship = req.Relationship
	}
	if err := s.empRepo.UpdateDependent(dep); err != nil {
		return nil, errors.New("failed to update dependent")
	}
	return dep, nil
}

func (s *EmployeeService) DeleteDependent(depID uint) error {
	return s.empRepo.DeleteDependent(depID)
}
