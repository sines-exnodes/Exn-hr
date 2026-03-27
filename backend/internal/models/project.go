package models

import "time"

type Project struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `json:"description"`
	Status      string    `gorm:"default:active" json:"status"` // active, completed, on_hold
	StartDate   string    `json:"start_date,omitempty"`
	EndDate     string    `json:"end_date,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	Assignments []ProjectAssignment `gorm:"foreignKey:ProjectID" json:"assignments,omitempty"`
}

type ProjectAssignment struct {
	ID                   uint   `gorm:"primaryKey" json:"id"`
	ProjectID            uint   `gorm:"not null;uniqueIndex:idx_proj_emp" json:"project_id"`
	EmployeeID           uint   `gorm:"not null;uniqueIndex:idx_proj_emp" json:"employee_id"`
	Role                 string `gorm:"not null" json:"role"` // backend, frontend, mobile, qa, ba, designer, pm, devops
	AllocationPercentage int    `gorm:"default:100" json:"allocation_percentage"` // 0-100
	StartDate            string `json:"start_date,omitempty"`
	EndDate              string `json:"end_date,omitempty"`

	Project  *Project  `gorm:"foreignKey:ProjectID" json:"project,omitempty"`
	Employee *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
}
