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
		&models.Department{},
		&models.Team{},
		&models.Employee{},
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

	// --- Repositories ---
	userRepo := repositories.NewUserRepository(db)
	deptRepo := repositories.NewDepartmentRepository(db)
	teamRepo := repositories.NewTeamRepository(db)
	empRepo := repositories.NewEmployeeRepository(db)
	attendanceRepo := repositories.NewAttendanceRepository(db)
	leaveRepo := repositories.NewLeaveRepository(db)
	otRepo := repositories.NewOvertimeRepository(db)
	salaryRepo := repositories.NewSalaryRepository(db)
	notifRepo := repositories.NewNotificationRepository(db)

	// --- Services (notification first — others depend on it) ---
	notifSvc := services.NewNotificationService(notifRepo)

	authService := services.NewAuthService(userRepo, cfg)
	deptSvc := services.NewDepartmentService(deptRepo)
	teamSvc := services.NewTeamService(teamRepo, deptRepo)
	empSvc := services.NewEmployeeService(empRepo, userRepo, notifSvc)
	attendanceSvc := services.NewAttendanceService(attendanceRepo, empRepo, notifSvc)
	leaveSvc := services.NewLeaveService(leaveRepo, empRepo, notifSvc, userRepo)
	otSvc := services.NewOvertimeService(otRepo, empRepo, notifSvc, userRepo)
	salarySvc := services.NewSalaryService(salaryRepo, empRepo, otRepo, notifSvc)

	// --- Handlers ---
	authHandler := handlers.NewAuthHandler(authService)
	deptHandler := handlers.NewDepartmentHandler(deptSvc)
	teamHandler := handlers.NewTeamHandler(teamSvc)
	empHandler := handlers.NewEmployeeHandler(empSvc)
	attendanceHandler := handlers.NewAttendanceHandler(attendanceSvc)
	leaveHandler := handlers.NewLeaveHandler(leaveSvc)
	otHandler := handlers.NewOvertimeHandler(otSvc)
	salaryHandler := handlers.NewSalaryHandler(salarySvc)
	notifHandler := handlers.NewNotificationHandler(notifSvc)

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
		// ---- Public routes ----
		api.POST("/auth/login", authHandler.Login)
		api.POST("/auth/forgot-password", authHandler.ForgotPassword)

		// ---- Protected routes (require JWT) ----
		protected := api.Group("")
		protected.Use(middleware.AuthRequired(cfg.JWTSecret))
		{
			// Auth
			protected.GET("/auth/me", authHandler.Me)
			protected.POST("/auth/change-password", empHandler.ChangePassword)

			// --- Employees (self) ---
			protected.GET("/employees/me", empHandler.GetMe)

			// --- Departments — Admin/HR only ---
			depts := protected.Group("/departments")
			depts.Use(middleware.RoleRequired(models.RoleAdmin, models.RoleHR, models.RoleCEO))
			{
				depts.GET("", deptHandler.List)
				depts.GET("/:id", deptHandler.GetByID)
				depts.POST("", middleware.RoleRequired(models.RoleAdmin), deptHandler.Create)
				depts.PUT("/:id", middleware.RoleRequired(models.RoleAdmin), deptHandler.Update)
				depts.DELETE("/:id", middleware.RoleRequired(models.RoleAdmin), deptHandler.Delete)
			}

			// --- Teams — Admin/HR/CEO ---
			teams := protected.Group("/teams")
			teams.Use(middleware.RoleRequired(models.RoleAdmin, models.RoleHR, models.RoleCEO, models.RoleLeader))
			{
				teams.GET("", teamHandler.List)
				teams.GET("/:id", teamHandler.GetByID)
				teams.POST("", middleware.RoleRequired(models.RoleAdmin, models.RoleHR), teamHandler.Create)
				teams.PUT("/:id", middleware.RoleRequired(models.RoleAdmin, models.RoleHR), teamHandler.Update)
				teams.DELETE("/:id", middleware.RoleRequired(models.RoleAdmin), teamHandler.Delete)
			}

			// --- Employees management — Admin/HR ---
			employees := protected.Group("/employees")
			{
				// Everyone can list with filters (they will see filtered results based on their role in service)
				employees.GET("", middleware.RoleRequired(models.RoleAdmin, models.RoleHR, models.RoleCEO, models.RoleLeader), empHandler.List)
				employees.GET("/:id", empHandler.GetByID)
				employees.POST("", middleware.RoleRequired(models.RoleAdmin, models.RoleHR), empHandler.Create)
				employees.PUT("/:id", middleware.RoleRequired(models.RoleAdmin, models.RoleHR), empHandler.Update)

				// Allowances per employee
				employees.GET("/:id/allowances", middleware.RoleRequired(models.RoleAdmin, models.RoleHR), empHandler.GetAllowances)
				employees.POST("/:id/allowances", middleware.RoleRequired(models.RoleAdmin, models.RoleHR), empHandler.SetAllowance)
				employees.DELETE("/:id/allowances/:allowance_id", middleware.RoleRequired(models.RoleAdmin, models.RoleHR), empHandler.DeleteAllowance)
			}

			// --- Attendance ---
			attendance := protected.Group("/attendance")
			{
				// All authenticated employees can check in/out
				attendance.POST("/check-in", attendanceHandler.CheckIn)
				attendance.POST("/check-out", attendanceHandler.CheckOut)
				attendance.GET("/today", attendanceHandler.GetMyToday)

				// List — Admin/HR/CEO/Leader can view all; employee sees own
				attendance.GET("", middleware.RoleRequired(models.RoleAdmin, models.RoleHR, models.RoleCEO, models.RoleLeader), attendanceHandler.List)
				attendance.GET("/export", middleware.RoleRequired(models.RoleAdmin, models.RoleHR, models.RoleCEO, models.RoleLeader), attendanceHandler.ExportCSV)

				// Office location config — Admin only
				attendance.GET("/office-locations", attendanceHandler.GetOfficeLocations)
				attendance.POST("/office-locations", middleware.RoleRequired(models.RoleAdmin), attendanceHandler.CreateOfficeLocation)
				attendance.POST("/approved-wifi", middleware.RoleRequired(models.RoleAdmin), attendanceHandler.AddApprovedWiFi)
				attendance.DELETE("/approved-wifi/:id", middleware.RoleRequired(models.RoleAdmin), attendanceHandler.DeleteApprovedWiFi)
			}

			// --- Leave ---
			leave := protected.Group("/leave")
			{
				leave.POST("", leaveHandler.Create)
				leave.GET("", leaveHandler.List)
				leave.GET("/balance", leaveHandler.GetBalance)
				leave.GET("/:id", leaveHandler.GetByID)
				leave.DELETE("/:id", leaveHandler.Cancel)
				leave.POST("/:id/leader-approve", middleware.RoleRequired(models.RoleLeader, models.RoleAdmin), leaveHandler.LeaderApprove)
				leave.POST("/:id/hr-approve", middleware.RoleRequired(models.RoleHR, models.RoleAdmin), leaveHandler.HRApprove)
			}

			// --- Overtime ---
			overtime := protected.Group("/overtime")
			{
				overtime.POST("", otHandler.Create)
				overtime.GET("", otHandler.List)
				overtime.GET("/:id", otHandler.GetByID)
				overtime.DELETE("/:id", otHandler.Cancel)
				overtime.POST("/:id/leader-approve", middleware.RoleRequired(models.RoleLeader, models.RoleAdmin), otHandler.LeaderApprove)
				overtime.POST("/:id/ceo-approve", middleware.RoleRequired(models.RoleCEO, models.RoleAdmin), otHandler.CEOApprove)
			}

			// --- Salary ---
			salary := protected.Group("/salary")
			salary.Use(middleware.RoleRequired(models.RoleAdmin, models.RoleHR, models.RoleCEO))
			{
				salary.POST("/run-payroll", middleware.RoleRequired(models.RoleAdmin, models.RoleHR), salaryHandler.RunPayroll)
				salary.GET("", salaryHandler.List)
				salary.GET("/export", salaryHandler.ExportCSV)
				salary.GET("/me", salaryHandler.GetMySalary)
				salary.GET("/employee/:employee_id", salaryHandler.GetByEmployee)

				// Allowance types
				salary.GET("/allowance-types", salaryHandler.ListAllowanceTypes)
				salary.POST("/allowance-types", middleware.RoleRequired(models.RoleAdmin), salaryHandler.CreateAllowanceType)
				salary.PUT("/allowance-types/:id", middleware.RoleRequired(models.RoleAdmin), salaryHandler.UpdateAllowanceType)
				salary.DELETE("/allowance-types/:id", middleware.RoleRequired(models.RoleAdmin), salaryHandler.DeleteAllowanceType)

				// Bonuses
				salary.POST("/bonuses", middleware.RoleRequired(models.RoleAdmin, models.RoleHR), salaryHandler.AddBonus)

				// Salary advances
				salary.POST("/advances", middleware.RoleRequired(models.RoleAdmin, models.RoleHR), salaryHandler.AddSalaryAdvance)
			}

			// --- Salary Records (separate group to avoid Gin wildcard conflicts) ---
			salaryRecord := protected.Group("/salary-records")
			salaryRecord.Use(middleware.RoleRequired(models.RoleAdmin, models.RoleHR, models.RoleCEO))
			{
				salaryRecord.GET("/:id", salaryHandler.GetByID)
				salaryRecord.POST("/:id/confirm", middleware.RoleRequired(models.RoleAdmin), salaryHandler.Confirm)
			}

			// --- Notifications — all authenticated users ---
			notifs := protected.Group("/notifications")
			{
				notifs.GET("", notifHandler.List)
				notifs.GET("/unread-count", notifHandler.UnreadCount)
				notifs.PATCH("/:id/read", notifHandler.MarkRead)
				notifs.PATCH("/read-all", notifHandler.MarkAllRead)
			}
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
	if err := db.Create(&admin).Error; err != nil {
		log.Println("Failed to seed admin:", err)
		return
	}
	// Create employee profile for admin
	empProfile := models.Employee{
		UserID:   admin.ID,
		FullName: "System Admin",
		Position: "Administrator",
	}
	db.Create(&empProfile)
	log.Println("Default admin created: admin@exn.vn / admin123")
}
