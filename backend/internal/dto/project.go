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

type CreateMilestoneReq struct {
	Title       string                `json:"title" binding:"required"`
	Description string                `json:"description"`
	Deadline    string                `json:"deadline"`
	Items       []CreateMilestoneItem `json:"items"`
}

type CreateMilestoneItem struct {
	Content      string `json:"content" binding:"required"`
	DisplayOrder int    `json:"display_order"`
}

type UpdateMilestoneReq struct {
	Title       *string               `json:"title"`
	Description *string               `json:"description"`
	Deadline    *string               `json:"deadline"`
	Status      *string               `json:"status"`
	Items       []UpdateMilestoneItem `json:"items"`
}

type UpdateMilestoneItem struct {
	ID           *uint  `json:"id"`
	Content      string `json:"content"`
	IsCompleted  bool   `json:"is_completed"`
	DisplayOrder int    `json:"display_order"`
}
