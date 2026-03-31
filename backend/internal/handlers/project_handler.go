package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/services"
)

type ProjectHandler struct {
	svc *services.ProjectService
}

func NewProjectHandler(svc *services.ProjectService) *ProjectHandler {
	return &ProjectHandler{svc: svc}
}

// POST /api/v1/projects
func (h *ProjectHandler) Create(c *gin.Context) {
	var req dto.CreateProjectReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid request: "+err.Error()))
		return
	}
	project, err := h.svc.CreateProject(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusCreated, dto.OK(project, "Project created"))
}

// GET /api/v1/projects
func (h *ProjectHandler) List(c *gin.Context) {
	projects, err := h.svc.ListProjects()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(projects, "OK"))
}

// GET /api/v1/projects/:id
func (h *ProjectHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	project, err := h.svc.GetProject(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(project, "OK"))
}

// PUT /api/v1/projects/:id
func (h *ProjectHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	var req dto.UpdateProjectReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid request: "+err.Error()))
		return
	}
	project, err := h.svc.UpdateProject(uint(id), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(project, "Project updated"))
}

// DELETE /api/v1/projects/:id
func (h *ProjectHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	if err := h.svc.DeleteProject(uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(nil, "Project deleted"))
}

// GET /api/v1/projects/:id/members
func (h *ProjectHandler) ListMembers(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	members, err := h.svc.GetProjectMembers(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(members, "OK"))
}

// POST /api/v1/projects/:id/members
func (h *ProjectHandler) AddMember(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	var req dto.AssignMemberReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid request: "+err.Error()))
		return
	}
	assignment, err := h.svc.AddMember(uint(id), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusCreated, dto.OK(assignment, "Member added"))
}

// PUT /api/v1/projects/:id/members/:employee_id
func (h *ProjectHandler) UpdateMember(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	empID, err := strconv.ParseUint(c.Param("employee_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid employee_id"))
		return
	}
	var req dto.UpdateAssignmentReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid request: "+err.Error()))
		return
	}
	if err := h.svc.UpdateMember(uint(id), uint(empID), req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(nil, "Assignment updated"))
}

// DELETE /api/v1/projects/:id/members/:employee_id
func (h *ProjectHandler) RemoveMember(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	empID, err := strconv.ParseUint(c.Param("employee_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid employee_id"))
		return
	}
	if err := h.svc.RemoveMember(uint(id), uint(empID)); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(nil, "Member removed"))
}

// GET /api/v1/workload/overview
func (h *ProjectHandler) WorkloadOverview(c *gin.Context) {
	overview, err := h.svc.GetWorkloadOverview()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(overview, "OK"))
}

// GET /api/v1/workload/matrix
func (h *ProjectHandler) WorkloadMatrix(c *gin.Context) {
	matrix, err := h.svc.GetWorkloadMatrix()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(matrix, "OK"))
}

// GET /api/v1/workload/employee/:employee_id
func (h *ProjectHandler) EmployeeWorkload(c *gin.Context) {
	empID, err := strconv.ParseUint(c.Param("employee_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid employee_id"))
		return
	}
	workload, err := h.svc.GetEmployeeWorkload(uint(empID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(workload, "OK"))
}

// ---- Milestone handlers ----

// GET /api/v1/projects/:id/milestones
func (h *ProjectHandler) ListMilestones(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	milestones, err := h.svc.ListMilestones(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(milestones, "OK"))
}

// POST /api/v1/projects/:id/milestones
func (h *ProjectHandler) CreateMilestone(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	var req dto.CreateMilestoneReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid request: "+err.Error()))
		return
	}
	milestone, err := h.svc.CreateMilestone(uint(id), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusCreated, dto.OK(milestone, "Milestone created"))
}

// PUT /api/v1/milestones/:id
func (h *ProjectHandler) UpdateMilestone(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	var req dto.UpdateMilestoneReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid request: "+err.Error()))
		return
	}
	milestone, err := h.svc.UpdateMilestone(uint(id), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(milestone, "Milestone updated"))
}

// DELETE /api/v1/milestones/:id
func (h *ProjectHandler) DeleteMilestone(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	if err := h.svc.DeleteMilestone(uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(nil, "Milestone deleted"))
}
