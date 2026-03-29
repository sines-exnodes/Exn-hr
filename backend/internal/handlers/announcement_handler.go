package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/models"
	"github.com/exn-hr/backend/internal/services"
)

type AnnouncementHandler struct {
	svc *services.AnnouncementService
}

func NewAnnouncementHandler(svc *services.AnnouncementService) *AnnouncementHandler {
	return &AnnouncementHandler{svc: svc}
}

// POST /api/v1/announcements
func (h *AnnouncementHandler) Create(c *gin.Context) {
	userID := c.GetUint("user_id")
	var req dto.CreateAnnouncementReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid request: "+err.Error()))
		return
	}
	announcement, err := h.svc.Create(userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusCreated, dto.OK(announcement, "Announcement created"))
}

// GET /api/v1/announcements  (Admin/HR/CEO — all announcements)
func (h *AnnouncementHandler) List(c *gin.Context) {
	var filter dto.AnnouncementFilter
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid query params: "+err.Error()))
		return
	}
	announcements, total, err := h.svc.List(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.PaginatedResponse{
		Success: true,
		Data:    announcements,
		Total:   total,
		Page:    filter.Page,
		Size:    filter.Size,
	})
}

// GET /api/v1/announcements/me  (All authenticated — filtered by visibility)
func (h *AnnouncementHandler) ListForMe(c *gin.Context) {
	userID := c.GetUint("user_id")
	pageStr := c.DefaultQuery("page", "1")
	sizeStr := c.DefaultQuery("size", "20")

	page, _ := strconv.Atoi(pageStr)
	size, _ := strconv.Atoi(sizeStr)

	announcements, total, err := h.svc.ListForMe(userID, page, size)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.PaginatedResponse{
		Success: true,
		Data:    announcements,
		Total:   total,
		Page:    page,
		Size:    size,
	})
}

// GET /api/v1/announcements/:id
func (h *AnnouncementHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	announcement, err := h.svc.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(announcement, "OK"))
}

// PUT /api/v1/announcements/:id
func (h *AnnouncementHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	var req dto.UpdateAnnouncementReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid request: "+err.Error()))
		return
	}
	announcement, err := h.svc.Update(uint(id), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(announcement, "Announcement updated"))
}

// DELETE /api/v1/announcements/:id
func (h *AnnouncementHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid id"))
		return
	}
	if err := h.svc.Delete(uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(nil, "Announcement deleted"))
}

// POST /api/v1/polls/:id/vote
func (h *AnnouncementHandler) Vote(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid poll id"))
		return
	}
	var req dto.SubmitVoteReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid request: "+err.Error()))
		return
	}
	if err := h.svc.Vote(uint(id), userID, req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(nil, "Vote recorded"))
}

// GET /api/v1/polls/:id/results
func (h *AnnouncementHandler) GetPollResults(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("invalid poll id"))
		return
	}

	userRole := c.GetString("role")
	isAdminOrHR := userRole == models.RoleAdmin || userRole == models.RoleHR

	results, err := h.svc.GetPollResults(uint(id), userID, isAdminOrHR)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err(err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.OK(results, "OK"))
}
