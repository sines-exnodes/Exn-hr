package dto

// --- Salary / Payroll ---

type RunPayrollReq struct {
	Month            int `json:"month" binding:"required,min=1,max=12"`
	Year             int `json:"year" binding:"required"`
	StandardWorkDays int `json:"standard_work_days" binding:"required,min=1,max=31"`
}

type AllowanceTypeReq struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	IsTaxable   *bool  `json:"is_taxable"`
}

type SetAllowanceTypeReq struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	IsTaxable   *bool  `json:"is_taxable"`
}

type SalaryFilter struct {
	EmployeeID *uint  `form:"employee_id"`
	Month      int    `form:"month"`
	Year       int    `form:"year"`
	Status     string `form:"status"`
	Page       int    `form:"page,default=1"`
	Size       int    `form:"size,default=20"`
}

// SalaryBreakdown is returned per employee when payroll is run
type SalaryBreakdown struct {
	EmployeeID   uint    `json:"employee_id"`
	FullName     string  `json:"full_name"`
	ContractType string  `json:"contract_type"`

	// Salary basics
	BasicSalary      float64 `json:"basic_salary"`
	InsuranceSalary  float64 `json:"insurance_salary"`
	StandardWorkDays int     `json:"standard_work_days"`
	ActualWorkDays   float64 `json:"actual_work_days"`
	ProratedSalary   float64 `json:"prorated_salary"`

	// Allowances
	TaxableAllowances    float64 `json:"taxable_allowances"`
	NonTaxableAllowances float64 `json:"non_taxable_allowances"`
	TotalAllowances      float64 `json:"total_allowances"`

	// OT
	OTHourlyRate float64 `json:"ot_hourly_rate"`
	OTPayNormal  float64 `json:"ot_pay_normal"`
	OTPayWeekend float64 `json:"ot_pay_weekend"`
	OTPayHoliday float64 `json:"ot_pay_holiday"`
	TotalOTPay   float64 `json:"total_ot_pay"`

	// Bonus
	TotalBonus float64 `json:"total_bonus"`

	// Total income
	TotalIncome float64 `json:"total_income"`

	// Employee insurance
	BHXH                   float64 `json:"bhxh"`
	BHYT                   float64 `json:"bhyt"`
	BHTN                   float64 `json:"bhtn"`
	TotalInsuranceEmployee float64 `json:"total_insurance_employee"`

	// Employer insurance
	BHXHEmployer          float64 `json:"bhxh_employer"`
	TNNNEmployer          float64 `json:"tnnn_employer"`
	BHYTEmployer          float64 `json:"bhyt_employer"`
	BHTNEmployer          float64 `json:"bhtn_employer"`
	EmployerInsuranceCost float64 `json:"employer_insurance_cost"`

	// Union fees
	UnionFeeEmployee float64 `json:"union_fee_employee"`
	UnionFeeEmployer float64 `json:"union_fee_employer"`

	// PIT
	PersonalDeduction  float64 `json:"personal_deduction"`
	DependentDeduction float64 `json:"dependent_deduction"`
	TaxableIncome      float64 `json:"taxable_income"`
	PITAmount          float64 `json:"pit_amount"`

	// Deductions & net
	TotalDeductions   float64 `json:"total_deductions"`
	SalaryAdvance     float64 `json:"salary_advance"`
	NetSalary         float64 `json:"net_salary"`
	TotalEmployerCost float64 `json:"total_employer_cost"`
}
