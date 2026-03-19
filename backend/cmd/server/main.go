package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/exn-hr/backend/internal/config"
	"github.com/exn-hr/backend/internal/handlers"
	"github.com/exn-hr/backend/internal/middleware"
	"github.com/exn-hr/backend/internal/models"
	"github.com/exn-hr/backend/internal/repositories"
	"github.com/exn-hr/backend/internal/services"
	"github.com/exn-hr/backend/pkg/utils"
	"gorm.io/gorm"
)

func main() {
	// Load config
	cfg := config.Load()

	// Connect database
	db, err := config.ConnectDB(cfg)
	if err != nil {
		log.Fatal("Database connection failed:", err)
	}

	// Auto-migrate all models
	db.AutoMigrate(
		&models.User{},
		&models.Employee{},
		&models.Department{},
		&models.Team{},
		&models.AttendanceRecord{},
		&models.OfficeLocation{},
		&models.ApprovedWiFi{},
		&models.LeaveRequest{},
		&models.LeaveBalance{},
		&models.OvertimeRequest{},
		&models.Allowance{},
		&models.EmployeeAllowance{},
		&models.Bonus{},
		&models.SalaryAdvance{},
		&models.SalaryRecord{},
		&models.Notification{},
	)

	// Seed default admin
	seedAdmin(db)

	// Init layers: Repository → Service → Handler
	userRepo := repositories.NewUserRepository(db)
	authService := services.NewAuthService(userRepo, cfg)
	authHandler := handlers.NewAuthHandler(authService)

	// Setup Gin
	gin.SetMode(cfg.GinMode)
	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "exn-hr-api"})
	})

	// API v1 routes
	api := r.Group("/api/v1")
	{
		// Public routes
		api.POST("/auth/login", authHandler.Login)

		// Protected routes (require JWT)
		protected := api.Group("")
		protected.Use(middleware.AuthRequired(cfg.JWTSecret))
		{
			protected.GET("/auth/me", authHandler.Me)

			// TODO Sprint 2: Organization & Employee routes
			// TODO Sprint 3: Attendance routes
			// TODO Sprint 4: Leave routes
			// TODO Sprint 5: OT routes
			// TODO Sprint 6: Salary routes
			// TODO Sprint 7: Report routes
		}
	}

	// Start server
	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Exn-Hr API server starting on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}

// seedAdmin creates a default admin account if none exists
func seedAdmin(db *gorm.DB) {
	var count int64
	db.Model(&models.User{}).Where("role = ?", models.RoleAdmin).Count(&count)
	if count > 0 {
		return
	}

	hash, _ := utils.HashPassword("admin123")
	admin := models.User{
		Email:        "admin@exn.vn",
		PasswordHash: hash,
		Role:         models.RoleAdmin,
		IsActive:     true,
	}
	db.Create(&admin)
	log.Println("Default admin created: admin@exn.vn / admin123")
}
