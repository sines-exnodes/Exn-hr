package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/services"
)

type EmployeeHandler struct {
	svc *services.EmployeeService
}

func NewEmployeeHandler(svc *services.EmployeeService) *EmployeeHandler {
	return &EmployeeHandler{svc: svc}
}

// GET /api/v1/employees
func (h *EmployeeHandler) List(c *gin.Context) {
	var filter dto.EmployeeFilter
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid query params: "+err.Error()))
		return
	}
	employees, total, err := h.svc.List(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.PaginatedResponse{
		Success: true,
		Data:    employees,
		Total:   total,
		Page:    filter.Page,
		Size:    filter.Size,
	})
}

// GET /api/v1/employees/:id
func (h *EmployeeHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	emp, err := h.svc.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(emp, "OK"))
}

// GET /api/v1/employees/me
func (h *EmployeeHandler) GetMe(c *gin.Context) {
	userID := c.GetUint("user_id")
	emp, err := h.svc.GetByUserID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(emp, "OK"))
}

// POST /api/v1/employees
func (h *EmployeeHandler) Create(c *gin.Context) {
	var req dto.CreateEmployeeReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid request: "+err.Error()))
		return
	}
	emp, err := h.svc.Create(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusCreated, dto.OK(emp, "Employee created"))
}

// PUT /api/v1/employees/:id
func (h *EmployeeHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	var req dto.UpdateEmployeeReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid request: "+err.Error()))
		return
	}
	emp, err := h.svc.Update(uint(id), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(emp, "Employee updated"))
}

// POST /api/v1/auth/change-password
func (h *EmployeeHandler) ChangePassword(c *gin.Context) {
	userID := c.GetUint("user_id")
	var req dto.ChangePasswordReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid request: "+err.Error()))
		return
	}
	if err := h.svc.ChangePassword(userID, req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(nil, "Password changed successfully"))
}

// GET /api/v1/employees/:id/allowances
func (h *EmployeeHandler) GetAllowances(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	allowances, err := h.svc.GetAllowances(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(allowances, "OK"))
}

// POST /api/v1/employees/:id/allowances
func (h *EmployeeHandler) SetAllowance(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	var req dto.SetEmployeeAllowanceReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid request: "+err.Error()))
		return
	}
	if err := h.svc.SetAllowance(uint(id), req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(nil, "Allowance set"))
}

// DELETE /api/v1/employees/:id/allowances/:allowance_id
func (h *EmployeeHandler) DeleteAllowance(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	allowanceID, err := strconv.ParseUint(c.Param("allowance_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid allowance_id"))
		return
	}
	if err := h.svc.DeleteAllowance(uint(id), uint(allowanceID)); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(nil, "Allowance removed"))
}
