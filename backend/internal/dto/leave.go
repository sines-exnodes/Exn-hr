package dto

// --- Leave ---

type CreateLeaveReq struct {
	Type          string  `json:"type" binding:"required,oneof=paid unpaid"`
	StartDate     string  `json:"start_date" binding:"required"`
	EndDate       string  `json:"end_date" binding:"required"`
	Days          float64 `json:"days" binding:"required,min=0.5"`
	IsHalfDay     bool    `json:"is_half_day"`                                       // true = nửa buổi (0.5 ngày)
	HalfDayPeriod string  `json:"half_day_period" binding:"omitempty,oneof=morning afternoon"` // morning or afternoon
	Reason        string  `json:"reason"`
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
