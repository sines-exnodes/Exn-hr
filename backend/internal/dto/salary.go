package dto

// --- Salary / Payroll ---

type RunPayrollReq struct {
	Month int `json:"month" binding:"required,min=1,max=12"`
	Year  int `json:"year" binding:"required"`
}

type AllowanceTypeReq struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
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
	EmployeeID      uint    `json:"employee_id"`
	FullName        string  `json:"full_name"`
	BasicSalary     float64 `json:"basic_salary"`
	InsuranceSalary float64 `json:"insurance_salary"`
	TotalAllowances float64 `json:"total_allowances"`
	OTHours         float64 `json:"ot_hours"`
	OTRate          float64 `json:"ot_rate"`
	TotalOTPay      float64 `json:"total_ot_pay"`
	TotalBonus      float64 `json:"total_bonus"`
	BHXH            float64 `json:"bhxh"`   // 8%
	BHYT            float64 `json:"bhyt"`   // 1.5%
	BHTN            float64 `json:"bhtn"`   // 1%
	TotalDeductions float64 `json:"total_deductions"`
	SalaryAdvance   float64 `json:"salary_advance"`
	NetSalary       float64 `json:"net_salary"`
}
