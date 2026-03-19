package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/services"
)

type TeamHandler struct {
	svc *services.TeamService
}

func NewTeamHandler(svc *services.TeamService) *TeamHandler {
	return &TeamHandler{svc: svc}
}

// GET /api/v1/teams
func (h *TeamHandler) List(c *gin.Context) {
	teams, err := h.svc.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(teams, "OK"))
}

// GET /api/v1/teams/:id
func (h *TeamHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	team, err := h.svc.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(team, "OK"))
}

// POST /api/v1/teams
func (h *TeamHandler) Create(c *gin.Context) {
	var req dto.CreateTeamReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid request: "+err.Error()))
		return
	}
	team, err := h.svc.Create(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusCreated, dto.OK(team, "Team created"))
}

// PUT /api/v1/teams/:id
func (h *TeamHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	var req dto.UpdateTeamReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid request: "+err.Error()))
		return
	}
	team, err := h.svc.Update(uint(id), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(team, "Team updated"))
}

// DELETE /api/v1/teams/:id
func (h *TeamHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	if err := h.svc.Delete(uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(nil, "Team deleted"))
}
