package dto

// --- Attendance ---

type CheckInReq struct {
	Latitude  float64 `json:"latitude" binding:"required"`
	Longitude float64 `json:"longitude" binding:"required"`
	WiFiSSID  string  `json:"wifi_ssid"`
}

type CheckOutReq struct {
	Latitude  float64 `json:"latitude" binding:"required"`
	Longitude float64 `json:"longitude" binding:"required"`
	WiFiSSID  string  `json:"wifi_ssid"`
}

type AttendanceFilter struct {
	EmployeeID *uint  `form:"employee_id"`
	StartDate  string `form:"start_date"` // YYYY-MM-DD
	EndDate    string `form:"end_date"`   // YYYY-MM-DD
	Page       int    `form:"page,default=1"`
	Size       int    `form:"size,default=20"`
}
