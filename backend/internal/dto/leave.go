package dto

// --- Leave ---

type CreateLeaveReq struct {
	Type      string  `json:"type" binding:"required,oneof=paid unpaid"`
	StartDate string  `json:"start_date" binding:"required"`
	EndDate   string  `json:"end_date" binding:"required"`
	Days      float64 `json:"days" binding:"required,min=0.5"`
	Reason    string  `json:"reason"`
}

type ApproveLeaveReq struct {
	Status  string `json:"status" binding:"required,oneof=approved rejected"`
	Comment string `json:"comment"`
}

type LeaveFilter struct {
	EmployeeID    *uint  `form:"employee_id"`
	OverallStatus string `form:"status"`
	Type          string `form:"type"`
	Year          int    `form:"year"`
	Page          int    `form:"page,default=1"`
	Size          int    `form:"size,default=20"`
}
