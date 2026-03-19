package services_test

import (
	"fmt"
	"log"
	"os"
	"testing"

	"github.com/exn-hr/backend/internal/config"
	"github.com/exn-hr/backend/internal/models"
	"github.com/exn-hr/backend/internal/repositories"
	"github.com/exn-hr/backend/internal/services"
	"github.com/exn-hr/backend/pkg/utils"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// testDB holds the shared test database connection
var testDB *gorm.DB

// Service instances for tests
var (
	testCfg       *config.Config
	userRepo      *repositories.UserRepository
	empRepo       *repositories.EmployeeRepository
	deptRepo      *repositories.DepartmentRepository
	teamRepo      *repositories.TeamRepository
	attendanceRepo *repositories.AttendanceRepository
	leaveRepo     *repositories.LeaveRepository
	otRepo        *repositories.OvertimeRepository
	salaryRepo    *repositories.SalaryRepository
	notifRepo     *repositories.NotificationRepository

	authSvc       *services.AuthService
	empSvc        *services.EmployeeService
	deptSvc       *services.DepartmentService
	teamSvc       *services.TeamService
	attendanceSvc *services.AttendanceService
	leaveSvc      *services.LeaveService
	otSvc         *services.OvertimeService
	salarySvc     *services.SalaryService
	notifSvc      *services.NotificationService
)

func TestMain(m *testing.M) {
	// Setup test database
	setupTestDB()

	// Run tests
	code := m.Run()

	// Cleanup
	cleanupTestDB()

	os.Exit(code)
}

func setupTestDB() {
	testCfg = &config.Config{
		Port:           "8080",
		GinMode:        "test",
		DBHost:         getTestEnv("DB_HOST", "localhost"),
		DBPort:         getTestEnv("DB_PORT", "5432"),
		DBUser:         getTestEnv("DB_USER", "exnhr"),
		DBPassword:     getTestEnv("DB_PASSWORD", "exnhr_secret"),
		DBName:         "exn_hr_test",
		DBSSLMode:      getTestEnv("DB_SSLMODE", "disable"),
		JWTSecret:      "test-jwt-secret",
		JWTExpiryHours: "24",
	}

	// Connect to default DB to create test DB
	defaultDSN := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		testCfg.DBHost, testCfg.DBPort, testCfg.DBUser, testCfg.DBPassword, "exn_hr", testCfg.DBSSLMode,
	)
	defaultDB, err := gorm.Open(postgres.Open(defaultDSN), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to default database:", err)
	}

	// Drop and recreate test DB
	sqlDB, _ := defaultDB.DB()
	sqlDB.Exec("DROP DATABASE IF EXISTS exn_hr_test")
	sqlDB.Exec("CREATE DATABASE exn_hr_test")
	sqlDB.Close()

	// Connect to test DB
	testDSN := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		testCfg.DBHost, testCfg.DBPort, testCfg.DBUser, testCfg.DBPassword, testCfg.DBName, testCfg.DBSSLMode,
	)
	testDB, err = gorm.Open(postgres.Open(testDSN), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		log.Fatal("Failed to connect to test database:", err)
	}

	// Migrate
	testDB.AutoMigrate(
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

	// Init repositories
	userRepo = repositories.NewUserRepository(testDB)
	empRepo = repositories.NewEmployeeRepository(testDB)
	deptRepo = repositories.NewDepartmentRepository(testDB)
	teamRepo = repositories.NewTeamRepository(testDB)
	attendanceRepo = repositories.NewAttendanceRepository(testDB)
	leaveRepo = repositories.NewLeaveRepository(testDB)
	otRepo = repositories.NewOvertimeRepository(testDB)
	salaryRepo = repositories.NewSalaryRepository(testDB)
	notifRepo = repositories.NewNotificationRepository(testDB)

	// Init services
	notifSvc = services.NewNotificationService(notifRepo)
	authSvc = services.NewAuthService(userRepo, testCfg)
	deptSvc = services.NewDepartmentService(deptRepo)
	teamSvc = services.NewTeamService(teamRepo, deptRepo)
	empSvc = services.NewEmployeeService(empRepo, userRepo, notifSvc)
	attendanceSvc = services.NewAttendanceService(attendanceRepo, empRepo, notifSvc)
	leaveSvc = services.NewLeaveService(leaveRepo, empRepo, notifSvc, userRepo)
	otSvc = services.NewOvertimeService(otRepo, empRepo, notifSvc, userRepo)
	salarySvc = services.NewSalaryService(salaryRepo, empRepo, otRepo, notifSvc)
}

func cleanupTestDB() {
	if testDB != nil {
		sqlDB, _ := testDB.DB()
		sqlDB.Close()
	}
}

// cleanTables truncates all tables for test isolation
func cleanTables(t *testing.T) {
	t.Helper()
	tables := []string{
		"notifications", "salary_records", "salary_advances", "bonus",
		"employee_allowances", "allowances", "overtime_requests",
		"leave_balances", "leave_requests", "attendance_records",
		"approved_wi_fis", "office_locations", "employees", "teams",
		"departments", "users",
	}
	for _, table := range tables {
		testDB.Exec(fmt.Sprintf("TRUNCATE TABLE %s CASCADE", table))
	}
}

// seedAdmin creates a test admin user and returns userID
func seedAdmin(t *testing.T) (userID uint, employeeID uint) {
	t.Helper()
	hash, _ := utils.HashPassword("admin123")
	user := &models.User{
		Email:        "admin@test.com",
		PasswordHash: hash,
		Role:         models.RoleAdmin,
		IsActive:     true,
	}
	testDB.Create(user)

	emp := &models.Employee{
		UserID:          user.ID,
		FullName:        "Test Admin",
		Position:        "Administrator",
		BasicSalary:     20000000,
		InsuranceSalary: 10000000,
	}
	testDB.Create(emp)

	return user.ID, emp.ID
}

// seedEmployee creates a test employee with user account
func seedEmployee(t *testing.T, email, role string, teamID *uint) (userID uint, employeeID uint) {
	t.Helper()
	hash, _ := utils.HashPassword("password123")
	user := &models.User{
		Email:        email,
		PasswordHash: hash,
		Role:         role,
		IsActive:     true,
	}
	testDB.Create(user)

	emp := &models.Employee{
		UserID:          user.ID,
		FullName:        "Employee " + email,
		Position:        "Staff",
		TeamID:          teamID,
		BasicSalary:     15000000,
		InsuranceSalary: 8000000,
	}
	testDB.Create(emp)

	return user.ID, emp.ID
}

// seedDepartmentAndTeam creates a department and team, returns their IDs
func seedDepartmentAndTeam(t *testing.T, leaderID *uint) (deptID uint, teamID uint) {
	t.Helper()
	dept := &models.Department{
		Name:        "Engineering",
		Description: "Engineering Department",
	}
	testDB.Create(dept)

	team := &models.Team{
		Name:         "Backend Team",
		DepartmentID: dept.ID,
		LeaderID:     leaderID,
	}
	testDB.Create(team)

	return dept.ID, team.ID
}

// seedOfficeLocation creates a test office location with approved WiFi
func seedOfficeLocation(t *testing.T) uint {
	t.Helper()
	loc := &models.OfficeLocation{
		Name:         "HQ Office",
		Latitude:     10.762622,
		Longitude:    106.660172,
		RadiusMeters: 200,
	}
	testDB.Create(loc)

	wifi := &models.ApprovedWiFi{
		SSID:             "EXN-Office",
		BSSID:            "AA:BB:CC:DD:EE:FF",
		OfficeLocationID: loc.ID,
	}
	testDB.Create(wifi)

	return loc.ID
}

func getTestEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
