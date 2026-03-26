package models

import "time"

type OvertimeRequest struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	EmployeeID    uint      `gorm:"not null;index" json:"employee_id"`
	Date          string    `gorm:"not null" json:"date"`
	StartTime     string    `gorm:"not null" json:"start_time"`
	EndTime       string    `gorm:"not null" json:"end_time"`
	Hours         float64   `gorm:"not null" json:"hours"`
	OTType        string    `gorm:"default:normal" json:"ot_type"` // normal (x1.5), weekend (x2.0), holiday (x3.0)
	Reason        string    `json:"reason"`
	LeaderStatus  string    `gorm:"default:pending" json:"leader_status"`  // pending, approved, rejected
	CEOStatus     string    `gorm:"default:pending" json:"ceo_status"`     // pending, approved, rejected
	OverallStatus string    `gorm:"default:pending" json:"overall_status"` // pending, approved, rejected
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	Employee *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
}
