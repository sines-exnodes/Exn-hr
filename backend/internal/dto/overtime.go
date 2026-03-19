package dto

// --- Overtime ---

type CreateOTReq struct {
	Date      string  `json:"date" binding:"required"`
	StartTime string  `json:"start_time" binding:"required"`
	EndTime   string  `json:"end_time" binding:"required"`
	Hours     float64 `json:"hours" binding:"required,min=0.5"`
	Reason    string  `json:"reason"`
}

type ApproveOTReq struct {
	Status  string `json:"status" binding:"required,oneof=approved rejected"`
	Comment string `json:"comment"`
}

type OTFilter struct {
	EmployeeID    *uint  `form:"employee_id"`
	OverallStatus string `form:"status"`
	Month         int    `form:"month"`
	Year          int    `form:"year"`
	Page          int    `form:"page,default=1"`
	Size          int    `form:"size,default=20"`
}
