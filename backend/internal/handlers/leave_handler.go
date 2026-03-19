package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/services"
)

type LeaveHandler struct {
	svc *services.LeaveService
}

func NewLeaveHandler(svc *services.LeaveService) *LeaveHandler {
	return &LeaveHandler{svc: svc}
}

// POST /api/v1/leave
func (h *LeaveHandler) Create(c *gin.Context) {
	userID := c.GetUint("user_id")
	var req dto.CreateLeaveReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid request: "+err.Error()))
		return
	}
	leaveReq, err := h.svc.Create(userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusCreated, dto.OK(leaveReq, "Leave request submitted"))
}

// GET /api/v1/leave
func (h *LeaveHandler) List(c *gin.Context) {
	var filter dto.LeaveFilter
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid query params: "+err.Error()))
		return
	}
	requests, total, err := h.svc.List(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.PaginatedResponse{
		Success: true,
		Data:    requests,
		Total:   total,
		Page:    filter.Page,
		Size:    filter.Size,
	})
}

// GET /api/v1/leave/:id
func (h *LeaveHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	leaveReq, err := h.svc.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(leaveReq, "OK"))
}

// DELETE /api/v1/leave/:id  — employee cancels own request
func (h *LeaveHandler) Cancel(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	if err := h.svc.Cancel(userID, uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(nil, "Leave request cancelled"))
}

// POST /api/v1/leave/:id/leader-approve  — leader first-stage approval
func (h *LeaveHandler) LeaderApprove(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	var req dto.ApproveLeaveReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid request: "+err.Error()))
		return
	}
	leaveReq, err := h.svc.ApproveByLeader(userID, uint(id), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(leaveReq, "Leave request updated"))
}

// POST /api/v1/leave/:id/hr-approve  — HR final approval
func (h *LeaveHandler) HRApprove(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	var req dto.ApproveLeaveReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid request: "+err.Error()))
		return
	}
	leaveReq, err := h.svc.ApproveByHR(userID, uint(id), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(leaveReq, "Leave request updated"))
}

// GET /api/v1/leave/balance
func (h *LeaveHandler) GetBalance(c *gin.Context) {
	userID := c.GetUint("user_id")
	yearStr := c.Query("year")
	var year int
	if yearStr != "" {
		y, err := strconv.Atoi(yearStr)
		if err == nil {
			year = y
		}
	}
	balance, err := h.svc.GetBalance(userID, year)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(balance, "OK"))
}
