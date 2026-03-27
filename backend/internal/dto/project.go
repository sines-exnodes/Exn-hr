package dto

type CreateProjectReq struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	Status      string `json:"status"`
	StartDate   string `json:"start_date"`
	EndDate     string `json:"end_date"`
}

type UpdateProjectReq struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
	Status      *string `json:"status"`
	StartDate   *string `json:"start_date"`
	EndDate     *string `json:"end_date"`
}

type AssignMemberReq struct {
	EmployeeID           uint   `json:"employee_id" binding:"required"`
	Role                 string `json:"role" binding:"required"`
	AllocationPercentage int    `json:"allocation_percentage"`
	StartDate            string `json:"start_date"`
	EndDate              string `json:"end_date"`
}

type UpdateAssignmentReq struct {
	Role                 *string `json:"role"`
	AllocationPercentage *int    `json:"allocation_percentage"`
	StartDate            *string `json:"start_date"`
	EndDate              *string `json:"end_date"`
}
