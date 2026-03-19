package handlers

import (
	"fmt"
	"net/http"

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
