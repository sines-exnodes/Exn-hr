package models

import "time"

type AttendanceRecord struct {
	ID           uint       `gorm:"primaryKey" json:"id"`
	EmployeeID   uint       `gorm:"not null;index" json:"employee_id"`
	CheckInTime  time.Time  `json:"check_in_time"`
	CheckOutTime *time.Time `json:"check_out_time"`
	GPSLat       float64    `json:"gps_lat"`
	GPSLng       float64    `json:"gps_lng"`
	WiFiSSID     string     `json:"wifi_ssid"`
	Status       string     `gorm:"default:checked_in" json:"status"` // checked_in, checked_out
	IsLate       bool       `gorm:"default:false" json:"is_late"`
	LateMinutes  int        `gorm:"default:0" json:"late_minutes"`
	CreatedAt    time.Time  `json:"created_at"`

	Employee *Employee `gorm:"foreignKey:EmployeeID" json:"employee,omitempty"`
}

type OfficeLocation struct {
	ID            uint    `gorm:"primaryKey" json:"id"`
	Name          string  `gorm:"not null" json:"name"`
	Latitude      float64 `gorm:"not null" json:"latitude"`
	Longitude     float64 `gorm:"not null" json:"longitude"`
	RadiusMeters  float64 `gorm:"not null;default:100" json:"radius_meters"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	ApprovedWiFis []ApprovedWiFi `gorm:"foreignKey:OfficeLocationID" json:"approved_wifis,omitempty"`
}

type ApprovedWiFi struct {
	ID               uint   `gorm:"primaryKey" json:"id"`
	SSID             string `gorm:"not null" json:"ssid"`
	BSSID            string `json:"bssid"`
	OfficeLocationID uint   `gorm:"not null" json:"office_location_id"`
	CreatedAt        time.Time `json:"created_at"`
}
