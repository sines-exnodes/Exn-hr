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
	ID     uint   `gorm:"primaryKey" json:"id"`
	UserID uint   `gorm:"uniqueIndex;not null" json:"user_id"`

	// --- Thông tin cá nhân ---
	FullName         string `gorm:"not null" json:"full_name"`
	Phone            string `json:"phone"`
	PersonalEmail    string `json:"personal_email"`
	Gender           string `json:"gender"`                             // male, female, other
	PermanentAddress string `json:"permanent_address"`
	CurrentAddress   string `json:"current_address"`
	DOB              string `json:"dob"`
	Nationality      string `json:"nationality"`
	IDNumber         string `json:"id_number"`                          // Số CCCD
	IDIssueDate      string `json:"id_issue_date"`                      // Ngày cấp CCCD
	IDFrontImage     string `json:"id_front_image"`                     // Cloudinary URL
	IDBackImage      string `json:"id_back_image"`                      // Cloudinary URL
	AvatarURL        string `json:"avatar_url"`                         // Cloudinary URL
	Education        string `json:"education"`                          // high_school, college, university, master
	MaritalStatus    string `json:"marital_status"`                     // single, married, other

	// --- Liên hệ khẩn cấp ---
	EmergencyContactName     string `json:"emergency_contact_name"`
	EmergencyContactRelation string `json:"emergency_contact_relation"`
	EmergencyContactPhone    string `json:"emergency_contact_phone"`

	// --- Thông tin công việc ---
	DepartmentID    *uint  `json:"department_id"`
	ManagerID       *uint  `json:"manager_id"`                          // Line Manager (self-ref)
	JoinDate        string `json:"join_date"`
	ContractType    string `gorm:"default:official" json:"contract_type"` // probation, official
	ContractSignDate string `json:"contract_sign_date"`
	ContractEndDate  string `json:"contract_end_date"`
	ContractRenewal  int    `gorm:"default:1" json:"contract_renewal"`   // Lần ký: 1, 2, 3

	// --- Lương & Bảo hiểm ---
	BasicSalary     float64 `gorm:"default:0" json:"basic_salary"`
	InsuranceSalary float64 `gorm:"default:0" json:"insurance_salary"`

	// --- Ngân hàng ---
	BankAccount    string `json:"bank_account,omitempty"`
	BankName       string `json:"bank_name,omitempty"`
	BankHolderName string `json:"bank_holder_name,omitempty"`
	PaymentMethod  string `gorm:"default:bank_transfer" json:"payment_method"` // bank_transfer, cash

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// --- Relations ---
	User       *User       `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Department *Department `gorm:"foreignKey:DepartmentID" json:"department,omitempty"`
	Manager    *Employee   `gorm:"foreignKey:ManagerID" json:"manager,omitempty"`
	Dependents []Dependent `gorm:"foreignKey:EmployeeID" json:"dependents,omitempty"`
}

// Dependent — người phụ thuộc (con, cha mẹ, etc.)
type Dependent struct {
	ID           uint   `gorm:"primaryKey" json:"id"`
	EmployeeID   uint   `gorm:"not null" json:"employee_id"`
	FullName     string `gorm:"not null" json:"full_name"`
	DOB          string `json:"dob"`
	Gender       string `json:"gender"`       // male, female, other
	Relationship string `json:"relationship"` // child, parent, spouse, other

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Department struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	Members []Employee `gorm:"foreignKey:DepartmentID" json:"members,omitempty"`
}
