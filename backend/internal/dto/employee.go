package dto

// --- Employee ---

type CreateEmployeeReq struct {
	// User account fields
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Role     string `json:"role" binding:"required,oneof=admin ceo hr leader employee"`

	// Employee profile fields
	FullName        string  `json:"full_name" binding:"required"`
	Phone           string  `json:"phone"`
	Address         string  `json:"address"`
	DOB             string  `json:"dob"`
	Gender          string  `json:"gender"`
	JoinDate        string  `json:"join_date"`
	Position        string  `json:"position"`
	TeamID          *uint   `json:"team_id"`
	BasicSalary     float64 `json:"basic_salary"`
	InsuranceSalary float64 `json:"insurance_salary"`
}

type UpdateEmployeeReq struct {
	FullName        string  `json:"full_name"`
	Phone           string  `json:"phone"`
	Address         string  `json:"address"`
	DOB             string  `json:"dob"`
	Gender          string  `json:"gender"`
	Position        string  `json:"position"`
	TeamID          *uint   `json:"team_id"`
	BasicSalary     *float64 `json:"basic_salary"`
	InsuranceSalary *float64 `json:"insurance_salary"`
	IsActive        *bool    `json:"is_active"`
}

type EmployeeFilter struct {
	TeamID       *uint   `form:"team_id"`
	DepartmentID *uint   `form:"department_id"`
	Role         string  `form:"role"`
	Search       string  `form:"search"` // search by name or email
	Page         int     `form:"page,default=1"`
	Size         int     `form:"size,default=20"`
}

type ChangePasswordReq struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

type SetEmployeeAllowanceReq struct {
	AllowanceID uint    `json:"allowance_id" binding:"required"`
	Amount      float64 `json:"amount" binding:"required"`
}

type AddBonusReq struct {
	EmployeeID  uint    `json:"employee_id" binding:"required"`
	Month       int     `json:"month" binding:"required,min=1,max=12"`
	Year        int     `json:"year" binding:"required"`
	Type        string  `json:"type" binding:"required"`
	Amount      float64 `json:"amount" binding:"required"`
	Description string  `json:"description"`
}

type AddSalaryAdvanceReq struct {
	EmployeeID uint    `json:"employee_id" binding:"required"`
	Month      int     `json:"month" binding:"required,min=1,max=12"`
	Year       int     `json:"year" binding:"required"`
	Amount     float64 `json:"amount" binding:"required"`
	Reason     string  `json:"reason"`
}
