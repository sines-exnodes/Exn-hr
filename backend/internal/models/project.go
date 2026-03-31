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
	Milestones  []Milestone         `gorm:"foreignKey:ProjectID" json:"milestones,omitempty"`
}

type ProjectAssignment struct {
	ID                   uint   `gorm:"primaryKey" json:"id"`
	ProjectID            uint   `gorm:"not null;uniqueIndex:idx_proj_emp_role" json:"project_id"`
	EmployeeID           uint   `gorm:"not null;uniqueIndex:idx_proj_emp_role" json:"employee_id"`
	Role                 string `gorm:"not null;uniqueIndex:idx_proj_emp_role" json:"role"` // backend, frontend, fullstack, mobile, qa, qc, ba, designer, pm, devops
	AllocationPercentage int    `gorm:"default:100" json:"allocation_percentage"` // 0-100
	StartDate            string `json:"start_date,omitempty"`
	EndDate              string `json:"end_date,omitempty"`

	Project  *Project  `gorm:"foreignKey:ProjectID" json:"project,omitempty"`
	Employee *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
}

type Milestone struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	ProjectID   uint       `gorm:"not null" json:"project_id"`
	Title       string     `gorm:"not null" json:"title"`
	Description string     `json:"description"`
	Deadline    string     `json:"deadline,omitempty"`
	Status      string     `gorm:"default:upcoming" json:"status"` // upcoming, in_progress, completed, overdue
	CompletedAt *time.Time `json:"completed_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`

	Items []MilestoneItem `gorm:"foreignKey:MilestoneID" json:"items,omitempty"`
}

type MilestoneItem struct {
	ID           uint   `gorm:"primaryKey" json:"id"`
	MilestoneID  uint   `gorm:"not null" json:"milestone_id"`
	Content      string `gorm:"not null" json:"content"`
	IsCompleted  bool   `gorm:"default:false" json:"is_completed"`
	DisplayOrder int    `gorm:"default:0" json:"display_order"`
}
