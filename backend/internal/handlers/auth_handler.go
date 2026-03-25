package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/exn-hr/backend/internal/dto"
	"github.com/exn-hr/backend/internal/services"
)

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// POST /api/v1/auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("Invalid request: "+err.Error()))
		return
	}

	resp, err := h.authService.Login(req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, dto.Err(err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.OK(resp, "Login successful"))
}

// POST /api/v1/auth/forgot-password
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var req dto.ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("Invalid request: "+err.Error()))
		return
	}

	if err := h.authService.ForgotPassword(req); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Err("failed to process forgot password request"))
		return
	}

	c.JSON(http.StatusOK, dto.OK(nil, "If the email exists, a reset link has been sent"))
}

// GET /api/v1/auth/me
func (h *AuthHandler) Me(c *gin.Context) {
	userID, _ := c.Get("user_id")
	email, _ := c.Get("email")
	role, _ := c.Get("role")

	c.JSON(http.StatusOK, dto.OK(gin.H{
		"user_id": userID,
		"email":   email,
		"role":    role,
	}, "OK"))
}
