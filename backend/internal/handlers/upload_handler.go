package handlers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/gin-gonic/gin"
	"github.com/exn-hr/backend/internal/config"
	"github.com/exn-hr/backend/internal/dto"
)

type UploadHandler struct {
	cld *cloudinary.Cloudinary
}

func NewUploadHandler(cfg *config.Config) *UploadHandler {
	cld, err := cloudinary.NewFromParams(
		cfg.CloudinaryCloudName,
		cfg.CloudinaryAPIKey,
		cfg.CloudinaryAPISecret,
	)
	if err != nil {
		panic("failed to initialize Cloudinary: " + err.Error())
	}
	return &UploadHandler{cld: cld}
}

// POST /api/v1/upload — upload a single file to Cloudinary
func (h *UploadHandler) Upload(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Err("file is required"))
		return
	}

	// Max 5MB
	if file.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, dto.Err("file size must be less than 5MB"))
		return
	}

	f, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Err("failed to open file"))
		return
	}
	defer f.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	folder := c.DefaultQuery("folder", "exn-hr")
	publicID := fmt.Sprintf("%s/%d", folder, time.Now().UnixMilli())

	result, err := h.cld.Upload.Upload(ctx, f, uploader.UploadParams{
		PublicID: publicID,
		Folder:   folder,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Err("failed to upload file: "+err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.OK(gin.H{
		"url":       result.SecureURL,
		"public_id": result.PublicID,
	}, "File uploaded"))
}
