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
	testCfg        *config.Config
	userRepo       *repositories.UserRepository
	empRepo        *repositories.EmployeeRepository
	deptRepo       *repositories.DepartmentRepository
	attendanceRepo *repositories.AttendanceRepository
	leaveRepo      *repositories.LeaveRepository
	otRepo         *repositories.OvertimeRepository
	salaryRepo     *repositories.SalaryRepository
	notifRepo      *repositories.NotificationRepository

	authSvc       *services.AuthService
	empSvc        *services.EmployeeService
	deptSvc       *services.DepartmentService
	attendanceSvc *services.AttendanceService
	leaveSvc      *services.LeaveService
	otSvc         *services.OvertimeService
	salarySvc     *services.SalaryService
	notifSvc      *services.NotificationService
)

func TestMain(m *testing.M) {
	setupTestDB()
	code := m.Run()
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

	defaultDSN := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		testCfg.DBHost, testCfg.DBPort, testCfg.DBUser, testCfg.DBPassword, "exn_hr", testCfg.DBSSLMode,
	)
	defaultDB, err := gorm.Open(postgres.Open(defaultDSN), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to default database:", err)
	}

	sqlDB, _ := defaultDB.DB()
	sqlDB.Exec("DROP DATABASE IF EXISTS exn_hr_test")
	sqlDB.Exec("CREATE DATABASE exn_hr_test")
	sqlDB.Close()

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

	testDB.AutoMigrate(
		&models.User{},
		&models.Department{},
		&models.Employee{},
		&models.Dependent{},
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
	attendanceRepo = repositories.NewAttendanceRepository(testDB)
	leaveRepo = repositories.NewLeaveRepository(testDB)
	otRepo = repositories.NewOvertimeRepository(testDB)
	salaryRepo = repositories.NewSalaryRepository(testDB)
	notifRepo = repositories.NewNotificationRepository(testDB)

	// Init services
	notifSvc = services.NewNotificationService(notifRepo)
	authSvc = services.NewAuthService(userRepo, testCfg)
	deptSvc = services.NewDepartmentService(deptRepo)
	empSvc = services.NewEmployeeService(empRepo, userRepo, notifSvc)
	attendanceSvc = services.NewAttendanceService(attendanceRepo, empRepo, notifSvc, nil)
	leaveSvc = services.NewLeaveService(leaveRepo, empRepo, notifSvc, userRepo, nil)
	otSvc = services.NewOvertimeService(otRepo, empRepo, notifSvc, userRepo, nil)
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
		"approved_wi_fis", "office_locations", "dependents", "employees",
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
		BasicSalary:     20000000,
		InsuranceSalary: 10000000,
	}
	testDB.Create(emp)

	return user.ID, emp.ID
}

// seedEmployee creates a test employee with user account
func seedEmployee(t *testing.T, email, role string, deptID *uint) (userID uint, employeeID uint) {
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
		DepartmentID:    deptID,
		BasicSalary:     15000000,
		InsuranceSalary: 8000000,
	}
	testDB.Create(emp)

	return user.ID, emp.ID
}

// seedDepartment creates a department and returns its ID
func seedDepartment(t *testing.T) uint {
	t.Helper()
	dept := &models.Department{
		Name:        "Engineering",
		Description: "Engineering Department",
	}
	testDB.Create(dept)
	return dept.ID
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

// seedDepartmentWithLeaderAndEmployee is a common test setup: creates dept, leader, and employee with manager_id pointing to leader
func seedDepartmentWithLeaderAndEmployee(t *testing.T) (leaderUserID uint, empUserID uint, deptID uint) {
	t.Helper()
	deptID = seedDepartment(t)
	leaderUserID, leaderEmpID := seedEmployee(t, "leader@test.com", models.RoleLeader, &deptID)

	// Create employee with manager pointing to leader
	hash, _ := utils.HashPassword("password123")
	user := &models.User{
		Email:        "emp@test.com",
		PasswordHash: hash,
		Role:         models.RoleEmployee,
		IsActive:     true,
	}
	testDB.Create(user)
	emp := &models.Employee{
		UserID:          user.ID,
		FullName:        "Employee emp@test.com",
		DepartmentID:    &deptID,
		ManagerID:       &leaderEmpID,
		BasicSalary:     15000000,
		InsuranceSalary: 8000000,
	}
	testDB.Create(emp)
	empUserID = user.ID

	return leaderUserID, empUserID, deptID
}

func getTestEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
