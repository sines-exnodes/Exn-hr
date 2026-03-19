package models

import "time"

type LeaveRequest struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	EmployeeID    uint      `gorm:"not null;index" json:"employee_id"`
	Type          string    `gorm:"not null" json:"type"`                // paid, unpaid
	StartDate     string    `gorm:"not null" json:"start_date"`
	EndDate       string    `gorm:"not null" json:"end_date"`
	Days          float64   `gorm:"not null" json:"days"`
	Reason        string    `json:"reason"`
	LeaderStatus  string    `gorm:"default:pending" json:"leader_status"`  // pending, approved, rejected
	HRStatus      string    `gorm:"default:pending" json:"hr_status"`      // pending, approved, rejected
	OverallStatus string    `gorm:"default:pending" json:"overall_status"` // pending, approved, rejected
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	Employee *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
}

type LeaveBalance struct {
	ID            uint `gorm:"primaryKey" json:"id"`
	EmployeeID    uint `gorm:"not null;uniqueIndex:idx_emp_year" json:"employee_id"`
	Year          int  `gorm:"not null;uniqueIndex:idx_emp_year" json:"year"`
	TotalDays     int  `gorm:"not null;default:12" json:"total_days"`
	UsedDays      int  `gorm:"default:0" json:"used_days"`
	RemainingDays int  `gorm:"default:12" json:"remaining_days"`

	Employee *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
}
