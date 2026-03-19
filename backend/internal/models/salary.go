package models

import "time"

type Allowance struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `json:"description"`
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
	ID              uint      `gorm:"primaryKey" json:"id"`
	EmployeeID      uint      `gorm:"not null;uniqueIndex:idx_emp_month_year" json:"employee_id"`
	Month           int       `gorm:"not null;uniqueIndex:idx_emp_month_year" json:"month"`
	Year            int       `gorm:"not null;uniqueIndex:idx_emp_month_year" json:"year"`
	BasicSalary     float64   `json:"basic_salary"`
	TotalAllowances float64   `json:"total_allowances"`
	TotalOTPay      float64   `json:"total_ot_pay"`
	TotalBonus      float64   `json:"total_bonus"`
	TotalDeductions float64   `json:"total_deductions"`
	SalaryAdvance   float64   `json:"salary_advance"`
	NetSalary       float64   `json:"net_salary"`
	Status          string    `gorm:"default:draft" json:"status"` // draft, confirmed
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`

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
