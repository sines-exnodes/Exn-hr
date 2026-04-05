package dto

// --- Employee ---

type CreateEmployeeReq struct {
	// User account fields
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Role     string `json:"role" binding:"required,oneof=admin ceo hr leader employee"`

	// Thông tin cá nhân
	FullName         string `json:"full_name" binding:"required"`
	Phone            string `json:"phone"`
	PersonalEmail    string `json:"personal_email"`
	Gender           string `json:"gender"`
	PermanentAddress string `json:"permanent_address"`
	CurrentAddress   string `json:"current_address"`
	DOB              string `json:"dob"`
	Nationality      string `json:"nationality"`
	IDNumber         string `json:"id_number"`
	IDIssueDate      string `json:"id_issue_date"`
	IDFrontImage     string `json:"id_front_image"`
	IDBackImage      string `json:"id_back_image"`
	AvatarURL        string `json:"avatar_url"`
	Education        string `json:"education"`      // high_school, college, university, master
	MaritalStatus    string `json:"marital_status"`  // single, married, other

	// Liên hệ khẩn cấp
	EmergencyContactName     string `json:"emergency_contact_name"`
	EmergencyContactRelation string `json:"emergency_contact_relation"`
	EmergencyContactPhone    string `json:"emergency_contact_phone"`

	// Thông tin công việc
	DepartmentID     *uint  `json:"department_id"`
	ManagerID        *uint  `json:"manager_id"`
	JoinDate         string `json:"join_date"`
	ContractType     string `json:"contract_type"`       // probation, official
	ContractSignDate string `json:"contract_sign_date"`
	ContractEndDate  string `json:"contract_end_date"`
	ContractRenewal  int    `json:"contract_renewal"`

	// Lương & Bảo hiểm
	BasicSalary     float64 `json:"basic_salary"`
	InsuranceSalary float64 `json:"insurance_salary"`

	// Ngân hàng
	BankAccount    string `json:"bank_account"`
	BankName       string `json:"bank_name"`
	BankHolderName string `json:"bank_holder_name"`
	PaymentMethod  string `json:"payment_method"` // bank_transfer, cash
}

type UpdateEmployeeReq struct {
	// Thông tin cá nhân
	FullName         string `json:"full_name"`
	Phone            string `json:"phone"`
	PersonalEmail    string `json:"personal_email"`
	Gender           string `json:"gender"`
	PermanentAddress string `json:"permanent_address"`
	CurrentAddress   string `json:"current_address"`
	DOB              string `json:"dob"`
	Nationality      string `json:"nationality"`
	IDNumber         string `json:"id_number"`
	IDIssueDate      string `json:"id_issue_date"`
	IDFrontImage     string `json:"id_front_image"`
	IDBackImage      string `json:"id_back_image"`
	AvatarURL        string `json:"avatar_url"`
	Education        string `json:"education"`
	MaritalStatus    string `json:"marital_status"`

	// Liên hệ khẩn cấp
	EmergencyContactName     string `json:"emergency_contact_name"`
	EmergencyContactRelation string `json:"emergency_contact_relation"`
	EmergencyContactPhone    string `json:"emergency_contact_phone"`

	// Thông tin công việc
	DepartmentID     *uint  `json:"department_id"`
	ClearDepartment  *bool  `json:"clear_department"`
	ManagerID        *uint  `json:"manager_id"`
	ClearManager     *bool  `json:"clear_manager"`
	JoinDate         string `json:"join_date"`
	ContractType     string `json:"contract_type"`
	ContractSignDate string `json:"contract_sign_date"`
	ContractEndDate  string `json:"contract_end_date"`
	ContractRenewal  *int   `json:"contract_renewal"`

	// Lương & Bảo hiểm
	BasicSalary     *float64 `json:"basic_salary"`
	InsuranceSalary *float64 `json:"insurance_salary"`

	// Ngân hàng
	BankAccount    string `json:"bank_account"`
	BankName       string `json:"bank_name"`
	BankHolderName string `json:"bank_holder_name"`
	PaymentMethod  string `json:"payment_method"`

	// Account
	IsActive *bool `json:"is_active"`
}

// UpdateMyProfileReq — fields an employee can update about themselves (no salary, role, department changes)
type UpdateMyProfileReq struct {
	Phone            string `json:"phone"`
	PersonalEmail    string `json:"personal_email"`
	PermanentAddress string `json:"permanent_address"`
	CurrentAddress   string `json:"current_address"`
	DOB              string `json:"dob"`
	Gender           string `json:"gender"`
	Nationality      string `json:"nationality"`
	IDNumber         string `json:"id_number"`
	IDIssueDate      string `json:"id_issue_date"`
	IDFrontImage     string `json:"id_front_image"`
	IDBackImage      string `json:"id_back_image"`
	AvatarURL        string `json:"avatar_url"`
	Education        string `json:"education"`
	MaritalStatus    string `json:"marital_status"`

	// Liên hệ khẩn cấp
	EmergencyContactName     string `json:"emergency_contact_name"`
	EmergencyContactRelation string `json:"emergency_contact_relation"`
	EmergencyContactPhone    string `json:"emergency_contact_phone"`

	// Ngân hàng
	BankAccount    string `json:"bank_account"`
	BankName       string `json:"bank_name"`
	BankHolderName string `json:"bank_holder_name"`
}

type EmployeeFilter struct {
	DepartmentID *uint  `form:"department_id"`
	Role         string `form:"role"`
	Search       string `form:"search"` // search by name or email
	Page         int    `form:"page,default=1"`
	Size         int    `form:"size,default=20"`
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

// --- Dependent ---

type CreateDependentReq struct {
	FullName     string `json:"full_name" binding:"required"`
	DOB          string `json:"dob"`
	Gender       string `json:"gender"`
	Relationship string `json:"relationship" binding:"required"` // child, parent, spouse, other
}

type UpdateDependentReq struct {
	FullName     string `json:"full_name"`
	DOB          string `json:"dob"`
	Gender       string `json:"gender"`
	Relationship string `json:"relationship"`
}
