package models

import (
	"time"
)

// Role constants
const (
	RoleAdmin    = "admin"
	RoleCEO      = "ceo"
	RoleHR       = "hr"
	RoleLeader   = "leader"
	RoleEmployee = "employee"
)

type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Email        string    `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash string    `gorm:"not null" json:"-"`
	Role         string    `gorm:"not null;default:employee" json:"role"`
	IsActive     bool      `gorm:"default:true" json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`

	Employee *Employee `gorm:"foreignKey:UserID" json:"employee,omitempty"`
}

type Employee struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	UserID          uint      `gorm:"uniqueIndex;not null" json:"user_id"`
	FullName        string    `gorm:"not null" json:"full_name"`
	Phone           string    `json:"phone"`
	Address         string    `json:"address"`
	DOB             string    `json:"dob"`
	Gender          string    `json:"gender"`
	JoinDate        string    `json:"join_date"`
	Position        string    `json:"position"`
	TeamID          *uint     `json:"team_id"`
	BasicSalary        float64   `gorm:"default:0" json:"basic_salary"`
	InsuranceSalary    float64   `gorm:"default:0" json:"insurance_salary"`
	ContractType       string    `gorm:"default:full_time" json:"contract_type"`                // full_time, expat, probation, intern, collaborator, service_contract
	NumberOfDependents int       `gorm:"default:0" json:"number_of_dependents"`
	BankAccount        string    `json:"bank_account,omitempty"`
	BankName           string    `json:"bank_name,omitempty"`
	BankHolderName     string    `json:"bank_holder_name,omitempty"`
	PaymentMethod      string    `gorm:"default:bank_transfer" json:"payment_method"`           // bank_transfer, cash
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`

	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Team *Team `gorm:"foreignKey:TeamID" json:"team,omitempty"`
}

type Department struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	Teams []Team `gorm:"foreignKey:DepartmentID" json:"teams,omitempty"`
}

type Team struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Name         string    `gorm:"not null" json:"name"`
	DepartmentID uint      `gorm:"not null" json:"department_id"`
	LeaderID     *uint     `json:"leader_id"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`

	Department *Department `gorm:"foreignKey:DepartmentID" json:"department,omitempty"`
	Leader     *Employee   `gorm:"foreignKey:LeaderID" json:"leader,omitempty"`
	Members    []Employee  `gorm:"foreignKey:TeamID" json:"members,omitempty"`
}
