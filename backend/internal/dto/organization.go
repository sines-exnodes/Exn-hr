package dto

// --- Department ---

type CreateDepartmentReq struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

type UpdateDepartmentReq struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

// --- Office Location / Attendance Config ---

type CreateOfficeLocationReq struct {
	Name         string  `json:"name" binding:"required"`
	Latitude     float64 `json:"latitude" binding:"required"`
	Longitude    float64 `json:"longitude" binding:"required"`
	RadiusMeters float64 `json:"radius_meters" binding:"required"`
}

type AddApprovedWiFiReq struct {
	SSID             string `json:"ssid" binding:"required"`
	BSSID            string `json:"bssid"`
	OfficeLocationID uint   `json:"office_location_id" binding:"required"`
}
