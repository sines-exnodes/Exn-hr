package services

import (
	"errors"
	"fmt"

	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/models"
	"github.com/exn-hr/backend/internal/repositories"
)

// Insurance deduction rates (applied on insurance_salary)
const (
	BHXHRate = 0.08  // 8%
	BHYTRate = 0.015 // 1.5%
	BHTNRate = 0.01  // 1%
	OTRate   = 1.5   // x1.5
)

type SalaryService struct {
	salaryRepo *repositories.SalaryRepository
	empRepo    *repositories.EmployeeRepository
	otRepo     *repositories.OvertimeRepository
	notifSvc   *NotificationService
}

func NewSalaryService(
	salaryRepo *repositories.SalaryRepository,
	empRepo *repositories.EmployeeRepository,
	otRepo *repositories.OvertimeRepository,
	notifSvc *NotificationService,
) *SalaryService {
	return &SalaryService{salaryRepo: salaryRepo, empRepo: empRepo, otRepo: otRepo, notifSvc: notifSvc}
}

// computeBreakdown calculates payroll for a single employee for a given month/year
func (s *SalaryService) computeBreakdown(emp models.Employee, month, year int) (dto.SalaryBreakdown, error) {
	basicSalary := emp.BasicSalary
	insuranceSalary := emp.InsuranceSalary

	// Total allowances
	totalAllowances, err := s.salaryRepo.GetEmployeeAllowancesTotal(emp.ID)
	if err != nil {
		return dto.SalaryBreakdown{}, fmt.Errorf("failed to get allowances: %w", err)
	}

	// Approved OT hours for the month
	otHours, err := s.otRepo.SumApprovedHours(emp.ID, month, year)
	if err != nil {
		return dto.SalaryBreakdown{}, fmt.Errorf("failed to get OT hours: %w", err)
	}

	// OT hourly rate = basicSalary / 26 working days / 8 hours * 1.5
	var otHourlyRate float64
	if basicSalary > 0 {
		otHourlyRate = (basicSalary / 26 / 8) * OTRate
	}
	totalOTPay := otHours * otHourlyRate

	// Bonuses
	totalBonus, err := s.salaryRepo.SumBonuses(emp.ID, month, year)
	if err != nil {
		return dto.SalaryBreakdown{}, fmt.Errorf("failed to get bonuses: %w", err)
	}

	// Deductions based on insurance_salary
	bhxh := insuranceSalary * BHXHRate
	bhyt := insuranceSalary * BHYTRate
	bhtn := insuranceSalary * BHTNRate
	totalDeductions := bhxh + bhyt + bhtn

	// Salary advance deduction
	salaryAdvance, err := s.salaryRepo.SumSalaryAdvances(emp.ID, month, year)
	if err != nil {
		return dto.SalaryBreakdown{}, fmt.Errorf("failed to get salary advance: %w", err)
	}

	// Net salary
	netSalary := basicSalary + totalAllowances + totalOTPay + totalBonus - totalDeductions - salaryAdvance

	fullName := emp.FullName
	if emp.User != nil {
		_ = emp.User.Email // just access user to avoid lint
	}

	return dto.SalaryBreakdown{
		EmployeeID:      emp.ID,
		FullName:        fullName,
		BasicSalary:     basicSalary,
		InsuranceSalary: insuranceSalary,
		TotalAllowances: totalAllowances,
		OTHours:         otHours,
		OTRate:          otHourlyRate,
		TotalOTPay:      totalOTPay,
		TotalBonus:      totalBonus,
		BHXH:            bhxh,
		BHYT:            bhyt,
		BHTN:            bhtn,
		TotalDeductions: totalDeductions,
		SalaryAdvance:   salaryAdvance,
		NetSalary:       netSalary,
	}, nil
}

// RunPayroll computes and saves salary records for all active employees for the given month/year
func (s *SalaryService) RunPayroll(req dto.RunPayrollReq) ([]dto.SalaryBreakdown, error) {
	filter := dto.EmployeeFilter{Page: 1, Size: 1000}
	employees, _, err := s.empRepo.List(filter)
	if err != nil {
		return nil, errors.New("failed to fetch employees")
	}

	var results []dto.SalaryBreakdown

	for _, emp := range employees {
		// Skip inactive employees
		if emp.User != nil && !emp.User.IsActive {
			continue
		}

		breakdown, err := s.computeBreakdown(emp, req.Month, req.Year)
		if err != nil {
			continue
		}

		// Upsert salary record
		record := &models.SalaryRecord{
			EmployeeID:      emp.ID,
			Month:           req.Month,
			Year:            req.Year,
			BasicSalary:     breakdown.BasicSalary,
			TotalAllowances: breakdown.TotalAllowances,
			TotalOTPay:      breakdown.TotalOTPay,
			TotalBonus:      breakdown.TotalBonus,
			TotalDeductions: breakdown.TotalDeductions,
			SalaryAdvance:   breakdown.SalaryAdvance,
			NetSalary:       breakdown.NetSalary,
			Status:          "draft",
		}
		s.salaryRepo.UpsertSalaryRecord(record)

		// Notify employee
		refID := record.ID
		s.notifSvc.Send(
			emp.UserID,
			"Salary Record Available",
			fmt.Sprintf("Your salary for %02d/%d has been calculated. Net salary: %.0f VND",
				req.Month, req.Year, breakdown.NetSalary),
			"salary",
			&refID,
			"salary_record",
		)

		results = append(results, breakdown)
	}

	return results, nil
}

func (s *SalaryService) GetSalaryRecord(employeeID uint, month, year int) (*models.SalaryRecord, error) {
	record, err := s.salaryRepo.FindSalaryRecord(employeeID, month, year)
	if err != nil {
		return nil, errors.New("salary record not found")
	}
	return record, nil
}

func (s *SalaryService) ListSalaryRecords(month, year, page, size int) ([]models.SalaryRecord, int64, error) {
	return s.salaryRepo.ListSalaryRecords(month, year, page, size)
}

func (s *SalaryService) ConfirmSalaryRecord(id uint) error {
	return s.salaryRepo.ConfirmSalaryRecord(id)
}

// --- Allowance types ---

func (s *SalaryService) CreateAllowanceType(req dto.AllowanceTypeReq) (*models.Allowance, error) {
	a := &models.Allowance{
		Name:        req.Name,
		Description: req.Description,
	}
	if err := s.salaryRepo.CreateAllowanceType(a); err != nil {
		return nil, errors.New("failed to create allowance type")
	}
	return a, nil
}

func (s *SalaryService) ListAllowanceTypes() ([]models.Allowance, error) {
	return s.salaryRepo.ListAllowanceTypes()
}

func (s *SalaryService) DeleteAllowanceType(id uint) error {
	return s.salaryRepo.DeleteAllowanceType(id)
}

func (s *SalaryService) UpdateAllowanceType(id uint, req dto.AllowanceTypeReq) (*models.Allowance, error) {
	a, err := s.salaryRepo.GetAllowanceTypeByID(id)
	if err != nil {
		return nil, errors.New("allowance type not found")
	}
	a.Name = req.Name
	a.Description = req.Description
	if err := s.salaryRepo.UpdateAllowanceType(a); err != nil {
		return nil, errors.New("failed to update allowance type")
	}
	return a, nil
}

// --- Bonuses ---

func (s *SalaryService) AddBonus(req dto.AddBonusReq) (*models.Bonus, error) {
	if _, err := s.empRepo.FindByID(req.EmployeeID); err != nil {
		return nil, errors.New("employee not found")
	}
	b := &models.Bonus{
		EmployeeID:  req.EmployeeID,
		Month:       req.Month,
		Year:        req.Year,
		Type:        req.Type,
		Amount:      req.Amount,
		Description: req.Description,
	}
	if err := s.salaryRepo.CreateBonus(b); err != nil {
		return nil, errors.New("failed to add bonus")
	}
	return b, nil
}

// --- Salary Advances ---

func (s *SalaryService) AddSalaryAdvance(req dto.AddSalaryAdvanceReq) (*models.SalaryAdvance, error) {
	if _, err := s.empRepo.FindByID(req.EmployeeID); err != nil {
		return nil, errors.New("employee not found")
	}
	sa := &models.SalaryAdvance{
		EmployeeID: req.EmployeeID,
		Month:      req.Month,
		Year:       req.Year,
		Amount:     req.Amount,
		Reason:     req.Reason,
		Status:     "approved",
	}
	if err := s.salaryRepo.CreateSalaryAdvance(sa); err != nil {
		return nil, errors.New("failed to add salary advance")
	}
	return sa, nil
}
