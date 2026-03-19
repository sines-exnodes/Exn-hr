package services_test

import (
	"testing"

	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/models"
)

func TestCheckIn_Success(t *testing.T) {
	cleanTables(t)
	userID, _ := seedEmployee(t, "checkin@test.com", models.RoleEmployee, nil)
	seedOfficeLocation(t)

	record, err := attendanceSvc.CheckIn(userID, dto.CheckInReq{
		Latitude:  10.762622,
		Longitude: 106.660172,
	})

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if record == nil {
		t.Fatal("expected record, got nil")
	}
	if record.Status != "checked_in" {
		t.Errorf("expected status 'checked_in', got '%s'", record.Status)
	}
}

func TestCheckIn_WithApprovedWiFi(t *testing.T) {
	cleanTables(t)
	userID, _ := seedEmployee(t, "wifi@test.com", models.RoleEmployee, nil)
	seedOfficeLocation(t)

	// Check in with WiFi (far GPS but matching WiFi)
	record, err := attendanceSvc.CheckIn(userID, dto.CheckInReq{
		Latitude:  0,
		Longitude: 0,
		WiFiSSID:  "EXN-Office",
	})

	if err != nil {
		t.Fatalf("expected no error with approved WiFi, got %v", err)
	}
	if record.WiFiSSID != "EXN-Office" {
		t.Errorf("expected WiFi SSID 'EXN-Office', got '%s'", record.WiFiSSID)
	}
}

func TestCheckIn_InvalidLocation(t *testing.T) {
	cleanTables(t)
	userID, _ := seedEmployee(t, "badloc@test.com", models.RoleEmployee, nil)
	seedOfficeLocation(t)

	// Check in from far away location without matching WiFi
	_, err := attendanceSvc.CheckIn(userID, dto.CheckInReq{
		Latitude:  0,
		Longitude: 0,
	})

	if err == nil {
		t.Fatal("expected error for invalid location, got nil")
	}
	if err.Error() != "location is not within an approved office area or WiFi network" {
		t.Errorf("unexpected error: %s", err.Error())
	}
}

func TestCheckIn_AlreadyCheckedIn(t *testing.T) {
	cleanTables(t)
	userID, _ := seedEmployee(t, "double@test.com", models.RoleEmployee, nil)
	seedOfficeLocation(t)

	// First check-in
	_, err := attendanceSvc.CheckIn(userID, dto.CheckInReq{
		Latitude:  10.762622,
		Longitude: 106.660172,
	})
	if err != nil {
		t.Fatalf("first check-in failed: %v", err)
	}

	// Second check-in should fail
	_, err = attendanceSvc.CheckIn(userID, dto.CheckInReq{
		Latitude:  10.762622,
		Longitude: 106.660172,
	})
	if err == nil {
		t.Fatal("expected error for duplicate check-in, got nil")
	}
}

func TestCheckOut_Success(t *testing.T) {
	cleanTables(t)
	userID, _ := seedEmployee(t, "checkout@test.com", models.RoleEmployee, nil)
	seedOfficeLocation(t)

	// Check in first
	_, _ = attendanceSvc.CheckIn(userID, dto.CheckInReq{
		Latitude:  10.762622,
		Longitude: 106.660172,
	})

	// Check out
	record, err := attendanceSvc.CheckOut(userID, dto.CheckOutReq{
		Latitude:  10.762622,
		Longitude: 106.660172,
	})

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if record.Status != "checked_out" {
		t.Errorf("expected status 'checked_out', got '%s'", record.Status)
	}
	if record.CheckOutTime == nil {
		t.Error("expected CheckOutTime to be set")
	}
}

func TestCheckOut_NoActiveCheckIn(t *testing.T) {
	cleanTables(t)
	userID, _ := seedEmployee(t, "noci@test.com", models.RoleEmployee, nil)
	seedOfficeLocation(t)

	_, err := attendanceSvc.CheckOut(userID, dto.CheckOutReq{
		Latitude:  10.762622,
		Longitude: 106.660172,
	})

	if err == nil {
		t.Fatal("expected error for no active check-in, got nil")
	}
}

func TestGetOfficeLocations(t *testing.T) {
	cleanTables(t)
	seedOfficeLocation(t)

	locations, err := attendanceSvc.GetOfficeLocations()
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(locations) != 1 {
		t.Errorf("expected 1 location, got %d", len(locations))
	}
	if locations[0].Name != "HQ Office" {
		t.Errorf("expected 'HQ Office', got '%s'", locations[0].Name)
	}
}

func TestCreateOfficeLocation(t *testing.T) {
	cleanTables(t)

	loc, err := attendanceSvc.CreateOfficeLocation(dto.CreateOfficeLocationReq{
		Name:         "Branch Office",
		Latitude:     21.027763,
		Longitude:    105.834160,
		RadiusMeters: 150,
	})

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if loc.Name != "Branch Office" {
		t.Errorf("expected 'Branch Office', got '%s'", loc.Name)
	}
}

func TestAddApprovedWiFi(t *testing.T) {
	cleanTables(t)
	locID := seedOfficeLocation(t)

	wifi, err := attendanceSvc.AddApprovedWiFi(dto.AddApprovedWiFiReq{
		SSID:             "EXN-Guest",
		BSSID:            "11:22:33:44:55:66",
		OfficeLocationID: locID,
	})

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if wifi.SSID != "EXN-Guest" {
		t.Errorf("expected SSID 'EXN-Guest', got '%s'", wifi.SSID)
	}
}

func TestDeleteApprovedWiFi(t *testing.T) {
	cleanTables(t)
	seedOfficeLocation(t)

	// Get the WiFi that was seeded
	var wifi models.ApprovedWiFi
	testDB.First(&wifi)

	err := attendanceSvc.DeleteApprovedWiFi(wifi.ID)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func TestAttendanceList(t *testing.T) {
	cleanTables(t)
	userID, _ := seedEmployee(t, "list@test.com", models.RoleEmployee, nil)
	seedOfficeLocation(t)

	// Create a check-in
	attendanceSvc.CheckIn(userID, dto.CheckInReq{
		Latitude:  10.762622,
		Longitude: 106.660172,
	})

	records, total, err := attendanceSvc.List(dto.AttendanceFilter{
		Page: 1,
		Size: 10,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if total != 1 {
		t.Errorf("expected 1 record, got %d", total)
	}
	if len(records) != 1 {
		t.Errorf("expected 1 record in list, got %d", len(records))
	}
}
