package services

import (
	"errors"
	"fmt"
	"math"

	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/models"
	"github.com/exn-hr/backend/internal/repositories"
)

// Insurance rates (employee side, on InsuranceSalary)
const (
	BHXHRate = 0.08  // 8%
	BHYTRate = 0.015 // 1.5%
	BHTNRate = 0.01  // 1%
	TotalInsuranceEmployeeRate = 0.105 // 10.5%

	// Insurance rates (employer side)
	BHXHEmployerRate = 0.17  // 17%
	TNNNEmployerRate = 0.005 // 0.5%
	BHYTEmployerRate = 0.03  // 3%
	BHTNEmployerRate = 0.01  // 1%
	TotalInsuranceEmployerRate = 0.215 // 21.5%

	// Union fee rates
	UnionFeeEmployeeRate = 0.01 // 1%
	UnionFeeEmployerRate = 0.02 // 2%

	// OT multipliers
	OTRateNormal  = 1.5
	OTRateWeekend = 2.0
	OTRateHoliday = 3.0

	// PIT deductions
	PersonalDeductionAmount  = 11000000.0 // 11,000,000 VND
	DependentDeductionAmount = 4400000.0  // 4,400,000 VND per dependent
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

// calculateProgressivePIT calculates PIT using Vietnam's progressive tax brackets
func calculateProgressivePIT(taxableIncome float64) float64 {
	if taxableIncome <= 0 {
		return 0
	}

	// Progressive tax brackets (VND)
	brackets := []struct {
		limit float64
		rate  float64
	}{
		{5000000, 0.05},   // Up to 5M: 5%
		{10000000, 0.10},  // 5M - 10M: 10%
		{18000000, 0.15},  // 10M - 18M: 15%
		{32000000, 0.20},  // 18M - 32M: 20%
		{52000000, 0.25},  // 32M - 52M: 25%
		{80000000, 0.30},  // 52M - 80M: 30%
		{math.MaxFloat64, 0.35}, // Over 80M: 35%
	}

	var totalTax float64
	var prevLimit float64

	for _, b := range brackets {
		if taxableIncome <= prevLimit {
			break
		}
		taxableInBracket := math.Min(taxableIncome, b.limit) - prevLimit
		if taxableInBracket > 0 {
			totalTax += taxableInBracket * b.rate
		}
		prevLimit = b.limit
	}

	return math.Round(totalTax)
}

// computeBreakdown calculates payroll for a single employee for a given month/year
func (s *SalaryService) computeBreakdown(emp models.Employee, month, year, standardWorkDays int) (dto.SalaryBreakdown, error) {
	var bd dto.SalaryBreakdown

	bd.EmployeeID = emp.ID
	bd.FullName = emp.FullName
	bd.ContractType = emp.ContractType

	basicSalary := emp.BasicSalary
	insuranceSalary := emp.InsuranceSalary

	bd.BasicSalary = basicSalary
	bd.InsuranceSalary = insuranceSalary
	bd.StandardWorkDays = standardWorkDays

	// --- Actual work days from attendance ---
	actualWorkDays, err := s.salaryRepo.CountWorkDays(emp.ID, month, year)
	if err != nil {
		return bd, fmt.Errorf("failed to count work days: %w", err)
	}
	bd.ActualWorkDays = actualWorkDays

	// --- Prorated salary ---
	if standardWorkDays > 0 {
		bd.ProratedSalary = math.Round(basicSalary / float64(standardWorkDays) * actualWorkDays)
	}

	// --- Allowances (taxable vs non-taxable) ---
	allowanceSplit, err := s.salaryRepo.GetEmployeeAllowancesSplit(emp.ID)
	if err != nil {
		return bd, fmt.Errorf("failed to get allowances: %w", err)
	}
	taxableAllowances := allowanceSplit.TaxableTotal
	bd.TotalAllowances = allowanceSplit.TaxableTotal + allowanceSplit.NonTaxableTotal

	// --- OT Pay (3 types) ---
	var hourlyRate float64
	if basicSalary > 0 && standardWorkDays > 0 {
		hourlyRate = basicSalary / float64(standardWorkDays) / 8.0
	}
	bd.OTHourlyRate = hourlyRate

	otByType, err := s.otRepo.SumApprovedHoursByType(emp.ID, month, year)
	if err != nil {
		return bd, fmt.Errorf("failed to get OT hours: %w", err)
	}

	bd.OTPayNormal = math.Round(otByType.Normal * hourlyRate * OTRateNormal)
	bd.OTPayWeekend = math.Round(otByType.Weekend * hourlyRate * OTRateWeekend)
	bd.OTPayHoliday = math.Round(otByType.Holiday * hourlyRate * OTRateHoliday)
	bd.TotalOTPay = bd.OTPayNormal + bd.OTPayWeekend + bd.OTPayHoliday

	// --- Bonuses ---
	totalBonus, err := s.salaryRepo.SumBonuses(emp.ID, month, year)
	if err != nil {
		return bd, fmt.Errorf("failed to get bonuses: %w", err)
	}
	bd.TotalBonus = totalBonus

	// --- Total Income ---
	bd.TotalIncome = bd.ProratedSalary + bd.TotalAllowances + bd.TotalOTPay + bd.TotalBonus

	// --- Insurance (skip for probation/intern/collaborator/service_contract if InsuranceSalary is 0) ---
	skipInsurance := insuranceSalary == 0
	if !skipInsurance {
		// Employee side
		bd.BHXH = math.Round(insuranceSalary * BHXHRate)
		bd.BHYT = math.Round(insuranceSalary * BHYTRate)
		bd.BHTN = math.Round(insuranceSalary * BHTNRate)
		bd.TotalInsuranceEmployee = math.Round(insuranceSalary * TotalInsuranceEmployeeRate)

		// Employer side
		bd.BHXHEmployer = math.Round(insuranceSalary * BHXHEmployerRate)
		bd.TNNNEmployer = math.Round(insuranceSalary * TNNNEmployerRate)
		bd.BHYTEmployer = math.Round(insuranceSalary * BHYTEmployerRate)
		bd.BHTNEmployer = math.Round(insuranceSalary * BHTNEmployerRate)
		bd.EmployerInsuranceCost = math.Round(insuranceSalary * TotalInsuranceEmployerRate)

		// Union fees
		bd.UnionFeeEmployee = math.Round(insuranceSalary * UnionFeeEmployeeRate)
		bd.UnionFeeEmployer = math.Round(insuranceSalary * UnionFeeEmployerRate)
	}

	// --- PIT (Personal Income Tax) ---
	switch emp.ContractType {
	case "full_time", "expat":
		// Progressive tax with deductions
		bd.PersonalDeduction = PersonalDeductionAmount
		bd.DependentDeduction = float64(emp.NumberOfDependents) * DependentDeductionAmount

		bd.TaxableIncome = (bd.ProratedSalary + taxableAllowances + bd.TotalOTPay + bd.TotalBonus) -
			bd.TotalInsuranceEmployee - bd.PersonalDeduction - bd.DependentDeduction

		if bd.TaxableIncome < 0 {
			bd.TaxableIncome = 0
		}

		bd.PITAmount = calculateProgressivePIT(bd.TaxableIncome)

	case "probation", "collaborator":
		// Flat 10% on gross taxable income, no deductions
		bd.TaxableIncome = bd.ProratedSalary + taxableAllowances + bd.TotalOTPay + bd.TotalBonus
		bd.PITAmount = math.Round(bd.TaxableIncome * 0.10)

	case "intern", "service_contract":
		// No tax
		bd.PITAmount = 0

	default:
		// Default: treat as full_time
		bd.PersonalDeduction = PersonalDeductionAmount
		bd.DependentDeduction = float64(emp.NumberOfDependents) * DependentDeductionAmount

		bd.TaxableIncome = (bd.ProratedSalary + taxableAllowances + bd.TotalOTPay + bd.TotalBonus) -
			bd.TotalInsuranceEmployee - bd.PersonalDeduction - bd.DependentDeduction

		if bd.TaxableIncome < 0 {
			bd.TaxableIncome = 0
		}

		bd.PITAmount = calculateProgressivePIT(bd.TaxableIncome)
	}

	// --- Total Deductions ---
	bd.TotalDeductions = bd.TotalInsuranceEmployee + bd.PITAmount + bd.UnionFeeEmployee

	// --- Salary Advance ---
	salaryAdvance, err := s.salaryRepo.SumSalaryAdvances(emp.ID, month, year)
	if err != nil {
		return bd, fmt.Errorf("failed to get salary advance: %w", err)
	}
	bd.SalaryAdvance = salaryAdvance

	// --- Net Salary ---
	bd.NetSalary = bd.TotalIncome - bd.TotalDeductions - bd.SalaryAdvance

	// --- Total Employer Cost ---
	bd.TotalEmployerCost = bd.NetSalary + bd.TotalDeductions + bd.EmployerInsuranceCost + bd.UnionFeeEmployer

	return bd, nil
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

		breakdown, err := s.computeBreakdown(emp, req.Month, req.Year, req.StandardWorkDays)
		if err != nil {
			continue
		}

		// Upsert salary record
		record := &models.SalaryRecord{
			EmployeeID:   emp.ID,
			Month:        req.Month,
			Year:         req.Year,
			ContractType: emp.ContractType,

			BasicSalary:      breakdown.BasicSalary,
			InsuranceSalary:  breakdown.InsuranceSalary,
			StandardWorkDays: breakdown.StandardWorkDays,
			ActualWorkDays:   breakdown.ActualWorkDays,
			ProratedSalary:   breakdown.ProratedSalary,

			TotalAllowances: breakdown.TotalAllowances,

			OTPayNormal:  breakdown.OTPayNormal,
			OTPayWeekend: breakdown.OTPayWeekend,
			OTPayHoliday: breakdown.OTPayHoliday,
			TotalOTPay:   breakdown.TotalOTPay,

			TotalBonus:  breakdown.TotalBonus,
			TotalIncome: breakdown.TotalIncome,

			BHXH:                   breakdown.BHXH,
			BHYT:                   breakdown.BHYT,
			BHTN:                   breakdown.BHTN,
			TotalInsuranceEmployee: breakdown.TotalInsuranceEmployee,

			BHXHEmployer:          breakdown.BHXHEmployer,
			TNNNEmployer:          breakdown.TNNNEmployer,
			BHYTEmployer:          breakdown.BHYTEmployer,
			BHTNEmployer:          breakdown.BHTNEmployer,
			EmployerInsuranceCost: breakdown.EmployerInsuranceCost,

			UnionFeeEmployee: breakdown.UnionFeeEmployee,
			UnionFeeEmployer: breakdown.UnionFeeEmployer,

			PersonalDeduction:  breakdown.PersonalDeduction,
			DependentDeduction: breakdown.DependentDeduction,
			TaxableIncome:      breakdown.TaxableIncome,
			PITAmount:          breakdown.PITAmount,

			TotalDeductions:   breakdown.TotalDeductions,
			SalaryAdvance:     breakdown.SalaryAdvance,
			NetSalary:         breakdown.NetSalary,
			TotalEmployerCost: breakdown.TotalEmployerCost,

			Status: "draft",
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

func (s *SalaryService) GetSalaryRecordByID(id uint) (*models.SalaryRecord, error) {
	record, err := s.salaryRepo.GetSalaryRecordByID(id)
	if err != nil {
		return nil, errors.New("salary record not found")
	}
	return record, nil
}

func (s *SalaryService) GetSalaryRecord(employeeID uint, month, year int) (*models.SalaryRecord, error) {
	record, err := s.salaryRepo.FindSalaryRecord(employeeID, month, year)
	if err != nil {
		return nil, errors.New("salary record not found")
	}
	return record, nil
}

func (s *SalaryService) GetEmployeeByUserID(userID uint) (*models.Employee, error) {
	emp, err := s.empRepo.FindByUserID(userID)
	if err != nil {
		return nil, errors.New("employee not found")
	}
	return emp, nil
}

func (s *SalaryService) GetSalaryRecordsByEmployee(employeeID uint) ([]models.SalaryRecord, error) {
	return s.salaryRepo.ListSalaryRecordsByEmployee(employeeID)
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
	if req.IsTaxable != nil {
		a.IsTaxable = *req.IsTaxable
	} else {
		a.IsTaxable = true // default
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
	if req.IsTaxable != nil {
		a.IsTaxable = *req.IsTaxable
	}
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
