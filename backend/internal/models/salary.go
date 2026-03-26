package models

import "time"

type Allowance struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `json:"description"`
	IsTaxable   bool      `gorm:"default:true" json:"is_taxable"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type EmployeeAllowance struct {
	ID          uint    `gorm:"primaryKey" json:"id"`
	EmployeeID  uint    `gorm:"not null;index" json:"employee_id"`
	AllowanceID uint    `gorm:"not null" json:"allowance_id"`
	Amount      float64 `gorm:"not null" json:"amount"`

	Employee  *Employee  `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
	Allowance *Allowance `gorm:"foreignKey:AllowanceID" json:"allowance,omitempty"`
}

type Bonus struct {
	ID          uint    `gorm:"primaryKey" json:"id"`
	EmployeeID  uint    `gorm:"not null;index" json:"employee_id"`
	Month       int     `gorm:"not null" json:"month"`
	Year        int     `gorm:"not null" json:"year"`
	Type        string  `gorm:"not null" json:"type"` // kpi, project, commission
	Amount      float64 `gorm:"not null" json:"amount"`
	Description string  `json:"description"`

	Employee *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
}

type SalaryAdvance struct {
	ID         uint    `gorm:"primaryKey" json:"id"`
	EmployeeID uint    `gorm:"not null;index" json:"employee_id"`
	Month      int     `gorm:"not null" json:"month"`
	Year       int     `gorm:"not null" json:"year"`
	Amount     float64 `gorm:"not null" json:"amount"`
	Reason     string  `json:"reason"`
	Status     string  `gorm:"default:approved" json:"status"`

	Employee *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
}

type SalaryRecord struct {
	ID           uint   `gorm:"primaryKey" json:"id"`
	EmployeeID   uint   `gorm:"not null;uniqueIndex:idx_emp_month_year" json:"employee_id"`
	Month        int    `gorm:"not null;uniqueIndex:idx_emp_month_year" json:"month"`
	Year         int    `gorm:"not null;uniqueIndex:idx_emp_month_year" json:"year"`
	ContractType string `json:"contract_type"`

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

	// OT breakdown
	OTPayNormal  float64 `json:"ot_pay_normal"`
	OTPayWeekend float64 `json:"ot_pay_weekend"`
	OTPayHoliday float64 `json:"ot_pay_holiday"`
	TotalOTPay   float64 `json:"total_ot_pay"`

	// Bonus
	TotalBonus float64 `json:"total_bonus"`

	// Total income
	TotalIncome float64 `json:"total_income"`

	// Employee insurance (on InsuranceSalary)
	BHXH                   float64 `json:"bhxh"`
	BHYT                   float64 `json:"bhyt"`
	BHTN                   float64 `json:"bhtn"`
	TotalInsuranceEmployee float64 `json:"total_insurance_employee"`

	// Employer insurance (on InsuranceSalary)
	BHXHEmployer          float64 `json:"bhxh_employer"`
	TNNNEmployer          float64 `json:"tnnn_employer"`
	BHYTEmployer          float64 `json:"bhyt_employer"`
	BHTNEmployer          float64 `json:"bhtn_employer"`
	EmployerInsuranceCost float64 `json:"employer_insurance_cost"`

	// Union fees
	UnionFeeEmployee float64 `json:"union_fee_employee"`
	UnionFeeEmployer float64 `json:"union_fee_employer"`

	// PIT (Personal Income Tax)
	PersonalDeduction  float64 `json:"personal_deduction"`
	DependentDeduction float64 `json:"dependent_deduction"`
	TaxableIncome      float64 `json:"taxable_income"`
	PITAmount          float64 `json:"pit_amount"`

	// Deductions & net
	TotalDeductions   float64 `json:"total_deductions"`
	SalaryAdvance     float64 `json:"salary_advance"`
	NetSalary         float64 `json:"net_salary"`
	TotalEmployerCost float64 `json:"total_employer_cost"`

	Status    string    `gorm:"default:draft" json:"status"` // draft, confirmed
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Employee *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
}

type Notification struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	UserID        uint      `gorm:"not null;index" json:"user_id"`
	Title         string    `gorm:"not null" json:"title"`
	Body          string    `json:"body"`
	Type          string    `json:"type"` // leave, ot, salary, attendance
	IsRead        bool      `gorm:"default:false" json:"is_read"`
	ReferenceID   *uint     `json:"reference_id"`
	ReferenceType string    `json:"reference_type"`
	CreatedAt     time.Time `json:"created_at"`

	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}
