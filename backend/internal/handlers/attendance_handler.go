package handlers

import (
	"encoding/csv"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/services"
)

type AttendanceHandler struct {
	svc *services.AttendanceService
}

func NewAttendanceHandler(svc *services.AttendanceService) *AttendanceHandler {
	return &AttendanceHandler{svc: svc}
}

// POST /api/v1/attendance/check-in
func (h *AttendanceHandler) CheckIn(c *gin.Context) {
	userID := c.GetUint("user_id")
	var req dto.CheckInReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid request: "+err.Error()))
		return
	}
	record, err := h.svc.CheckIn(userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusCreated, dto.OK(record, "Checked in successfully"))
}

// POST /api/v1/attendance/check-out
func (h *AttendanceHandler) CheckOut(c *gin.Context) {
	userID := c.GetUint("user_id")
	var req dto.CheckOutReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid request: "+err.Error()))
		return
	}
	record, err := h.svc.CheckOut(userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(record, "Checked out successfully"))
}

// GET /api/v1/attendance/today
func (h *AttendanceHandler) GetMyToday(c *gin.Context) {
	userID := c.GetUint("user_id")
	record, err := h.svc.GetMyToday(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(record, "OK"))
}

// GET /api/v1/attendance
func (h *AttendanceHandler) List(c *gin.Context) {
	var filter dto.AttendanceFilter
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid query params: "+err.Error()))
		return
	}
	records, total, err := h.svc.List(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.PaginatedResponse{
		Success: true,
		Data:    records,
		Total:   total,
		Page:    filter.Page,
		Size:    filter.Size,
	})
}

// GET /api/v1/attendance/export
func (h *AttendanceHandler) ExportCSV(c *gin.Context) {
	var filter dto.AttendanceFilter
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid query params: "+err.Error()))
		return
	}
	filter.Page = 1
	filter.Size = 10000
	records, _, err := h.svc.List(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Err(err.Error()))
		return
	}

	filename := fmt.Sprintf("attendance_%s.csv", time.Now().Format("20060102_150405"))
	c.Header("Content-Type", "text/csv; charset=utf-8")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%q", filename))
	c.Header("Cache-Control", "no-cache")

	w := csv.NewWriter(c.Writer)
	defer w.Flush()

	_ = w.Write([]string{"ID", "EmployeeID", "EmployeeName", "CheckIn", "CheckOut", "Status", "GPSLat", "GPSLng", "WiFiSSID"})
	for _, r := range records {
		checkOut := ""
		if r.CheckOutTime != nil {
			checkOut = r.CheckOutTime.Format(time.RFC3339)
		}
		empName := ""
		if r.Employee != nil {
			empName = r.Employee.FullName
		}
		_ = w.Write([]string{
			strconv.FormatUint(uint64(r.ID), 10),
			strconv.FormatUint(uint64(r.EmployeeID), 10),
			empName,
			r.CheckInTime.Format(time.RFC3339),
			checkOut,
			r.Status,
			strconv.FormatFloat(r.GPSLat, 'f', 6, 64),
			strconv.FormatFloat(r.GPSLng, 'f', 6, 64),
			r.WiFiSSID,
		})
	}
}

// GET /api/v1/attendance/office-locations
func (h *AttendanceHandler) GetOfficeLocations(c *gin.Context) {
	locations, err := h.svc.GetOfficeLocations()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(locations, "OK"))
}

// POST /api/v1/attendance/office-locations
func (h *AttendanceHandler) CreateOfficeLocation(c *gin.Context) {
	var req dto.CreateOfficeLocationReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid request: "+err.Error()))
		return
	}
	loc, err := h.svc.CreateOfficeLocation(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusCreated, dto.OK(loc, "Office location created"))
}

// POST /api/v1/attendance/approved-wifi
func (h *AttendanceHandler) AddApprovedWiFi(c *gin.Context) {
	var req dto.AddApprovedWiFiReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid request: "+err.Error()))
		return
	}
	wifi, err := h.svc.AddApprovedWiFi(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusCreated, dto.OK(wifi, "Approved WiFi added"))
}

// DELETE /api/v1/attendance/approved-wifi/:id
func (h *AttendanceHandler) DeleteApprovedWiFi(c *gin.Context) {
	var id uint
	if _, err := fmt.Sscanf(c.Param("id"), "%d", &id); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	if err := h.svc.DeleteApprovedWiFi(id); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(nil, "Approved WiFi removed"))
}
