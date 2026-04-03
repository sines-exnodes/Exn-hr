package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/exn-hr/backend/internal/config"
	"github.com/exn-hr/backend/internal/handlers"
	"github.com/exn-hr/backend/internal/middleware"
	"github.com/exn-hr/backend/internal/models"
	"github.com/exn-hr/backend/internal/repositories"
	"github.com/exn-hr/backend/internal/services"
	"github.com/exn-hr/backend/internal/sse"
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

	// Run database migrations
	runMigrations(cfg)

	// Seed default admin
	seedAdmin(db)

	// --- SSE Hub ---
	sseHub := sse.NewHub()

	// --- Repositories ---
	userRepo := repositories.NewUserRepository(db)
	deptRepo := repositories.NewDepartmentRepository(db)
	empRepo := repositories.NewEmployeeRepository(db)
	attendanceRepo := repositories.NewAttendanceRepository(db)
	leaveRepo := repositories.NewLeaveRepository(db)
	otRepo := repositories.NewOvertimeRepository(db)
	salaryRepo := repositories.NewSalaryRepository(db)
	notifRepo := repositories.NewNotificationRepository(db)
	projectRepo := repositories.NewProjectRepository(db)
	announcementRepo := repositories.NewAnnouncementRepository(db)

	// --- Services (notification first — others depend on it) ---
	notifSvc := services.NewNotificationService(notifRepo)

	authService := services.NewAuthService(userRepo, cfg)
	deptSvc := services.NewDepartmentService(deptRepo)
	empSvc := services.NewEmployeeService(empRepo, userRepo, notifSvc)
	attendanceSvc := services.NewAttendanceService(attendanceRepo, empRepo, notifSvc, sseHub)
	leaveSvc := services.NewLeaveService(leaveRepo, empRepo, notifSvc, userRepo, sseHub)
	otSvc := services.NewOvertimeService(otRepo, empRepo, notifSvc, userRepo, sseHub)
	salarySvc := services.NewSalaryService(salaryRepo, empRepo, otRepo, notifSvc)
	projectSvc := services.NewProjectService(projectRepo, empRepo)
	announcementSvc := services.NewAnnouncementService(announcementRepo, projectRepo, empRepo, userRepo, notifSvc)

	// --- Handlers ---
	authHandler := handlers.NewAuthHandler(authService)
	deptHandler := handlers.NewDepartmentHandler(deptSvc)
	empHandler := handlers.NewEmployeeHandler(empSvc)
	uploadHandler := handlers.NewUploadHandler(cfg)
	attendanceHandler := handlers.NewAttendanceHandler(attendanceSvc)
	leaveHandler := handlers.NewLeaveHandler(leaveSvc)
	otHandler := handlers.NewOvertimeHandler(otSvc)
	salaryHandler := handlers.NewSalaryHandler(salarySvc)
	notifHandler := handlers.NewNotificationHandler(notifSvc)
	projectHandler := handlers.NewProjectHandler(projectSvc)
	announcementHandler := handlers.NewAnnouncementHandler(announcementSvc)
	sseHandler := handlers.NewSSEHandler(sseHub)

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
			// SSE — real-time event stream
			protected.GET("/events", sseHandler.Stream)

			// Auth
			protected.GET("/auth/me", authHandler.Me)
			protected.POST("/auth/change-password", empHandler.ChangePassword)

			// --- Employees (self) ---
			protected.GET("/employees/me", empHandler.GetMe)
			protected.PUT("/employees/me", empHandler.UpdateMe)

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

			// --- Upload (Cloudinary) ---
			protected.POST("/upload", uploadHandler.Upload)

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

				// Dependents per employee
				employees.GET("/:id/dependents", empHandler.ListDependents)
				employees.POST("/:id/dependents", middleware.RoleRequired(models.RoleAdmin, models.RoleHR), empHandler.CreateDependent)
				employees.PUT("/:id/dependents/:dep_id", middleware.RoleRequired(models.RoleAdmin, models.RoleHR), empHandler.UpdateDependent)
				employees.DELETE("/:id/dependents/:dep_id", middleware.RoleRequired(models.RoleAdmin, models.RoleHR), empHandler.DeleteDependent)
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

			// --- My Salary (all authenticated users) ---
			protected.GET("/my-salary", salaryHandler.GetMySalary)

			// --- Salary (Admin/HR/CEO only) ---
			salary := protected.Group("/salary")
			salary.Use(middleware.RoleRequired(models.RoleAdmin, models.RoleHR, models.RoleCEO))
			{
				salary.POST("/run-payroll", middleware.RoleRequired(models.RoleAdmin, models.RoleHR), salaryHandler.RunPayroll)
				salary.GET("", salaryHandler.List)
				salary.GET("/export", salaryHandler.ExportCSV)
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

			// --- Projects ---
			// /me must be registered BEFORE /:id to avoid Gin routing conflict
			protected.GET("/projects/me", projectHandler.GetMyProjects)
			projects := protected.Group("/projects")
			{
				projects.GET("", projectHandler.List)
				projects.GET("/:id", projectHandler.GetByID)
				projects.POST("", middleware.RoleRequired(models.RoleAdmin, models.RoleHR, models.RoleCEO), projectHandler.Create)
				projects.PUT("/:id", middleware.RoleRequired(models.RoleAdmin, models.RoleHR, models.RoleCEO), projectHandler.Update)
				projects.DELETE("/:id", middleware.RoleRequired(models.RoleAdmin), projectHandler.Delete)
				projects.GET("/:id/members", projectHandler.ListMembers)
				projects.POST("/:id/members", middleware.RoleRequired(models.RoleAdmin, models.RoleHR, models.RoleCEO, models.RoleLeader), projectHandler.AddMember)
				projects.PUT("/:id/members/:employee_id", middleware.RoleRequired(models.RoleAdmin, models.RoleHR, models.RoleCEO, models.RoleLeader), projectHandler.UpdateMember)
				projects.DELETE("/:id/members/:employee_id", middleware.RoleRequired(models.RoleAdmin, models.RoleHR, models.RoleCEO), projectHandler.RemoveMember)
				projects.GET("/:id/milestones", projectHandler.ListMilestones)
				projects.POST("/:id/milestones", middleware.RoleRequired(models.RoleAdmin, models.RoleHR, models.RoleCEO, models.RoleLeader), projectHandler.CreateMilestone)
			}

			// --- Milestones (separate group to avoid Gin wildcard conflicts) ---
			// /upcoming must be registered BEFORE /:id to avoid Gin routing conflict
			protected.GET("/milestones/upcoming", projectHandler.GetUpcomingMilestones)
			milestones := protected.Group("/milestones")
			{
				milestones.PUT("/:id", middleware.RoleRequired(models.RoleAdmin, models.RoleHR, models.RoleCEO, models.RoleLeader), projectHandler.UpdateMilestone)
				milestones.DELETE("/:id", middleware.RoleRequired(models.RoleAdmin, models.RoleHR, models.RoleCEO, models.RoleLeader), projectHandler.DeleteMilestone)
				milestones.PUT("/:id/items/:item_id/toggle", projectHandler.ToggleMilestoneItem)
			}

			// --- Announcements ---
			// /me must be registered BEFORE /:id to avoid Gin routing conflict
			protected.GET("/announcements/me", announcementHandler.ListForMe)
			announcements := protected.Group("/announcements")
			{
				announcements.POST("", middleware.RoleRequired(models.RoleAdmin, models.RoleHR), announcementHandler.Create)
				announcements.GET("", middleware.RoleRequired(models.RoleAdmin, models.RoleHR, models.RoleCEO), announcementHandler.List)
				announcements.GET("/:id", announcementHandler.GetByID)
				announcements.PUT("/:id", middleware.RoleRequired(models.RoleAdmin, models.RoleHR), announcementHandler.Update)
				announcements.DELETE("/:id", middleware.RoleRequired(models.RoleAdmin, models.RoleHR), announcementHandler.Delete)
			}

			// --- Polls ---
			polls := protected.Group("/polls")
			{
				polls.POST("/:id/vote", announcementHandler.Vote)
				polls.GET("/:id/results", announcementHandler.GetPollResults)
			}

			// --- Workload ---
			workload := protected.Group("/workload")
			workload.Use(middleware.RoleRequired(models.RoleAdmin, models.RoleHR, models.RoleCEO))
			{
				workload.GET("/overview", projectHandler.WorkloadOverview)
				workload.GET("/matrix", projectHandler.WorkloadMatrix)
				workload.GET("/employee/:employee_id", projectHandler.EmployeeWorkload)
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
	}
	db.Create(&empProfile)
	log.Println("Default admin created: admin@exn.vn / admin123")
}

// runMigrations applies all pending migrations from the migrations/ directory
func runMigrations(cfg *config.Config) {
	dbURL := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=%s",
		cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName, cfg.DBSSLMode,
	)

	m, err := migrate.New("file://migrations", dbURL)
	if err != nil {
		log.Fatal("Failed to create migrate instance:", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatal("Migration failed:", err)
	}

	log.Println("Database migrations applied successfully")
}
