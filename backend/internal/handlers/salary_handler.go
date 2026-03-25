package handlers

import (
	"encoding/csv"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/services"
)

type SalaryHandler struct {
	svc *services.SalaryService
}

func NewSalaryHandler(svc *services.SalaryService) *SalaryHandler {
	return &SalaryHandler{svc: svc}
}

// POST /api/v1/salary/run-payroll — Admin/HR runs payroll for a month
func (h *SalaryHandler) RunPayroll(c *gin.Context) {
	var req dto.RunPayrollReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid request: "+err.Error()))
		return
	}
	results, err := h.svc.RunPayroll(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(results, "Payroll calculated"))
}

// GET /api/v1/salary  — list salary records (admin/hr)
func (h *SalaryHandler) List(c *gin.Context) {
	var filter dto.SalaryFilter
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid query params: "+err.Error()))
		return
	}
	records, total, err := h.svc.ListSalaryRecords(filter.Month, filter.Year, filter.Page, filter.Size)
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

// GET /api/v1/salary/export
func (h *SalaryHandler) ExportCSV(c *gin.Context) {
	var filter dto.SalaryFilter
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid query params: "+err.Error()))
		return
	}
	filter.Page = 1
	filter.Size = 10000

	records, _, err := h.svc.ListSalaryRecords(filter.Month, filter.Year, filter.Page, filter.Size)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Err(err.Error()))
		return
	}

	filename := "payroll_export.csv"
	if filter.Month > 0 && filter.Year > 0 {
		filename = "payroll_" + strconv.Itoa(filter.Month) + "_" + strconv.Itoa(filter.Year) + ".csv"
	}
	c.Header("Content-Type", "text/csv; charset=utf-8")
	c.Header("Content-Disposition", "attachment; filename=\""+filename+"\"")
	c.Header("Cache-Control", "no-cache")

	w := csv.NewWriter(c.Writer)
	defer w.Flush()

	_ = w.Write([]string{"ID", "EmployeeID", "EmployeeName", "Month", "Year", "BasicSalary", "TotalAllowances", "TotalOTPay", "TotalBonus", "TotalDeductions", "SalaryAdvance", "NetSalary", "Status", "UpdatedAt"})
	for _, r := range records {
		empName := ""
		if r.Employee != nil {
			empName = r.Employee.FullName
		}
		_ = w.Write([]string{
			strconv.FormatUint(uint64(r.ID), 10),
			strconv.FormatUint(uint64(r.EmployeeID), 10),
			empName,
			strconv.Itoa(r.Month),
			strconv.Itoa(r.Year),
			strconv.FormatFloat(r.BasicSalary, 'f', 0, 64),
			strconv.FormatFloat(r.TotalAllowances, 'f', 0, 64),
			strconv.FormatFloat(r.TotalOTPay, 'f', 0, 64),
			strconv.FormatFloat(r.TotalBonus, 'f', 0, 64),
			strconv.FormatFloat(r.TotalDeductions, 'f', 0, 64),
			strconv.FormatFloat(r.SalaryAdvance, 'f', 0, 64),
			strconv.FormatFloat(r.NetSalary, 'f', 0, 64),
			r.Status,
			r.UpdatedAt.Format(time.RFC3339),
		})
	}
}

// GET /api/v1/salary/me  — employee views own salary for a month
func (h *SalaryHandler) GetMySalary(c *gin.Context) {
	userID := c.GetUint("user_id")
	monthStr := c.Query("month")
	yearStr := c.Query("year")
	month, _ := strconv.Atoi(monthStr)
	year, _ := strconv.Atoi(yearStr)

	// This endpoint is a convenience wrapper; use /salary/employee/:employee_id instead
	_, _, _ = userID, month, year
	c.JSON(http.StatusBadRequest, dto.Err("use /salary/employee/:employee_id?month=X&year=Y"))
}

// GET /api/v1/salary/employee/:employee_id
func (h *SalaryHandler) GetByEmployee(c *gin.Context) {
	empID, err := strconv.ParseUint(c.Param("employee_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid employee_id"))
		return
	}
	monthStr := c.Query("month")
	yearStr := c.Query("year")
	month, _ := strconv.Atoi(monthStr)
	year, _ := strconv.Atoi(yearStr)

	record, err := h.svc.GetSalaryRecord(uint(empID), month, year)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(record, "OK"))
}

// POST /api/v1/salary/:id/confirm  — Admin confirms salary record
func (h *SalaryHandler) Confirm(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	if err := h.svc.ConfirmSalaryRecord(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(nil, "Salary record confirmed"))
}

// --- Allowance Types ---

// GET /api/v1/salary/allowance-types
func (h *SalaryHandler) ListAllowanceTypes(c *gin.Context) {
	types, err := h.svc.ListAllowanceTypes()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(types, "OK"))
}

// POST /api/v1/salary/allowance-types
func (h *SalaryHandler) CreateAllowanceType(c *gin.Context) {
	var req dto.AllowanceTypeReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid request: "+err.Error()))
		return
	}
	t, err := h.svc.CreateAllowanceType(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusCreated, dto.OK(t, "Allowance type created"))
}

// DELETE /api/v1/salary/allowance-types/:id
func (h *SalaryHandler) DeleteAllowanceType(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	if err := h.svc.DeleteAllowanceType(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(nil, "Allowance type deleted"))
}

// PUT /api/v1/salary/allowance-types/:id
func (h *SalaryHandler) UpdateAllowanceType(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	var req dto.AllowanceTypeReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid request: "+err.Error()))
		return
	}
	updated, err := h.svc.UpdateAllowanceType(uint(id), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(updated, "Allowance type updated"))
}

// --- Bonuses ---

// POST /api/v1/salary/bonuses
func (h *SalaryHandler) AddBonus(c *gin.Context) {
	var req dto.AddBonusReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid request: "+err.Error()))
		return
	}
	bonus, err := h.svc.AddBonus(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusCreated, dto.OK(bonus, "Bonus added"))
}

// --- Salary Advances ---

// POST /api/v1/salary/advances
func (h *SalaryHandler) AddSalaryAdvance(c *gin.Context) {
	var req dto.AddSalaryAdvanceReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid request: "+err.Error()))
		return
	}
	advance, err := h.svc.AddSalaryAdvance(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusCreated, dto.OK(advance, "Salary advance recorded"))
}
