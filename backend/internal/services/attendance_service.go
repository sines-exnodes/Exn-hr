package services

import (
	"errors"
	"fmt"
	"math"
	"time"

	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/models"
	"github.com/exn-hr/backend/internal/repositories"
	"github.com/exn-hr/backend/internal/sse"
)

type AttendanceService struct {
	attendanceRepo *repositories.AttendanceRepository
	empRepo        *repositories.EmployeeRepository
	notifSvc       *NotificationService
	sseHub         *sse.Hub
}

func NewAttendanceService(
	attendanceRepo *repositories.AttendanceRepository,
	empRepo *repositories.EmployeeRepository,
	notifSvc *NotificationService,
	sseHub *sse.Hub,
) *AttendanceService {
	return &AttendanceService{
		attendanceRepo: attendanceRepo,
		empRepo:        empRepo,
		notifSvc:       notifSvc,
		sseHub:         sseHub,
	}
}

// haversineDistance returns distance in meters between two GPS coordinates
func haversineDistance(lat1, lng1, lat2, lng2 float64) float64 {
	const earthRadiusM = 6371000.0

	dLat := (lat2 - lat1) * math.Pi / 180
	dLng := (lng2 - lng1) * math.Pi / 180

	lat1Rad := lat1 * math.Pi / 180
	lat2Rad := lat2 * math.Pi / 180

	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(lat1Rad)*math.Cos(lat2Rad)*math.Sin(dLng/2)*math.Sin(dLng/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return earthRadiusM * c
}

// isLocationValid checks if the provided GPS is within any office radius OR wifi SSID matches an approved one
func (s *AttendanceService) isLocationValid(lat, lng float64, wifiSSID string) (bool, error) {
	locations, err := s.attendanceRepo.GetOfficeLocations()
	if err != nil {
		return false, err
	}

	// Check WiFi SSID first
	if wifiSSID != "" {
		for _, loc := range locations {
			for _, wifi := range loc.ApprovedWiFis {
				if wifi.SSID == wifiSSID {
					return true, nil
				}
			}
		}
	}

	// Check GPS distance
	for _, loc := range locations {
		dist := haversineDistance(lat, lng, loc.Latitude, loc.Longitude)
		if dist <= loc.RadiusMeters {
			return true, nil
		}
	}

	return false, nil
}

func (s *AttendanceService) CheckIn(userID uint, req dto.CheckInReq) (*models.AttendanceRecord, error) {
	// Get employee
	emp, err := s.empRepo.FindByUserID(userID)
	if err != nil {
		return nil, errors.New("employee profile not found")
	}

	// Check for existing open check-in today
	existing, err := s.attendanceRepo.FindActiveCheckIn(emp.ID)
	if err == nil && existing != nil {
		return nil, errors.New("you already have an active check-in")
	}

	// Validate location
	valid, err := s.isLocationValid(req.Latitude, req.Longitude, req.WiFiSSID)
	if err != nil {
		return nil, errors.New("failed to validate location")
	}
	if !valid {
		return nil, errors.New("location is not within an approved office area or WiFi network")
	}

	// Late check: if check-in after 08:15 (15 min grace from 08:00), mark as late
	now := time.Now()
	workStartHour, workStartMin := 8, 0
	gracePeriodMinutes := 15
	startOfWork := time.Date(now.Year(), now.Month(), now.Day(), workStartHour, workStartMin, 0, 0, now.Location())
	deadline := startOfWork.Add(time.Duration(gracePeriodMinutes) * time.Minute)

	isLate := now.After(deadline)
	lateMinutes := 0
	if isLate {
		lateMinutes = int(now.Sub(startOfWork).Minutes())
	}

	record := &models.AttendanceRecord{
		EmployeeID:  emp.ID,
		CheckInTime: now,
		GPSLat:      req.Latitude,
		GPSLng:      req.Longitude,
		WiFiSSID:    req.WiFiSSID,
		Status:      "checked_in",
		IsLate:      isLate,
		LateMinutes: lateMinutes,
	}

	if err := s.attendanceRepo.Create(record); err != nil {
		return nil, errors.New("failed to record check-in")
	}

	// Broadcast SSE event
	if s.sseHub != nil {
		s.sseHub.Broadcast(sse.Event{
			Type: "attendance_updated",
			Data: map[string]interface{}{"employee_id": emp.ID, "employee_name": emp.FullName, "action": "check_in"},
		})
	}

	return record, nil
}

func (s *AttendanceService) CheckOut(userID uint, req dto.CheckOutReq) (*models.AttendanceRecord, error) {
	// Get employee
	emp, err := s.empRepo.FindByUserID(userID)
	if err != nil {
		return nil, errors.New("employee profile not found")
	}

	// Find the active check-in
	record, err := s.attendanceRepo.FindActiveCheckIn(emp.ID)
	if err != nil {
		return nil, errors.New("no active check-in found")
	}

	// Validate location
	valid, err := s.isLocationValid(req.Latitude, req.Longitude, req.WiFiSSID)
	if err != nil {
		return nil, errors.New("failed to validate location")
	}
	if !valid {
		return nil, errors.New("location is not within an approved office area or WiFi network")
	}

	now := time.Now()
	record.CheckOutTime = &now
	record.Status = "checked_out"

	if err := s.attendanceRepo.Update(record); err != nil {
		return nil, errors.New("failed to record check-out")
	}

	// Broadcast SSE event
	if s.sseHub != nil {
		s.sseHub.Broadcast(sse.Event{
			Type: "attendance_updated",
			Data: map[string]interface{}{"employee_id": emp.ID, "employee_name": emp.FullName, "action": "check_out"},
		})
	}

	return record, nil
}

func (s *AttendanceService) List(filter dto.AttendanceFilter) ([]models.AttendanceRecord, int64, error) {
	return s.attendanceRepo.List(filter)
}

func (s *AttendanceService) GetMyToday(userID uint) (*models.AttendanceRecord, error) {
	emp, err := s.empRepo.FindByUserID(userID)
	if err != nil {
		return nil, errors.New("employee profile not found")
	}

	today := time.Now().Format("2006-01-02")
	filter := dto.AttendanceFilter{
		EmployeeID: &emp.ID,
		StartDate:  today,
		EndDate:    today,
		Page:       1,
		Size:       1,
	}
	records, _, err := s.attendanceRepo.List(filter)
	if err != nil || len(records) == 0 {
		return nil, errors.New("no attendance record found for today")
	}
	return &records[0], nil
}

func (s *AttendanceService) GetOfficeLocations() ([]models.OfficeLocation, error) {
	return s.attendanceRepo.GetOfficeLocations()
}

func (s *AttendanceService) CreateOfficeLocation(req dto.CreateOfficeLocationReq) (*models.OfficeLocation, error) {
	loc := &models.OfficeLocation{
		Name:         req.Name,
		Latitude:     req.Latitude,
		Longitude:    req.Longitude,
		RadiusMeters: req.RadiusMeters,
	}
	if err := s.attendanceRepo.CreateOfficeLocation(loc); err != nil {
		return nil, fmt.Errorf("failed to create office location: %w", err)
	}
	return loc, nil
}

func (s *AttendanceService) AddApprovedWiFi(req dto.AddApprovedWiFiReq) (*models.ApprovedWiFi, error) {
	wifi := &models.ApprovedWiFi{
		SSID:             req.SSID,
		BSSID:            req.BSSID,
		OfficeLocationID: req.OfficeLocationID,
	}
	if err := s.attendanceRepo.AddApprovedWiFi(wifi); err != nil {
		return nil, fmt.Errorf("failed to add approved WiFi: %w", err)
	}
	return wifi, nil
}

func (s *AttendanceService) DeleteApprovedWiFi(id uint) error {
	return s.attendanceRepo.DeleteApprovedWiFi(id)
}
