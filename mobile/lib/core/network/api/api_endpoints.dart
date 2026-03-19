class ApiEndpoints {
  const ApiEndpoints._();

  static const String baseUrl = 'http://10.0.2.2:8080/api/v1';

  // Auth
  static const String signIn = '/auth/login';
  static const String signOut = '/auth/logout';
  static const String changePassword = '/auth/change-password';

  // Profile
  static const String profile = '/profile';

  // Attendance
  static const String checkIn = '/attendance/check-in';
  static const String checkOut = '/attendance/check-out';
  static const String attendanceHistory = '/attendance/history';

  // Leave
  static const String leaveRequests = '/leave/requests';
  static String leaveRequestById(String id) => '/leave/requests/$id';
  static String approveLeave(String id) => '/leave/requests/$id/approve';
  static String rejectLeave(String id) => '/leave/requests/$id/reject';

  // Overtime
  static const String otRequests = '/overtime/requests';
  static String otRequestById(String id) => '/overtime/requests/$id';

  // Salary
  static const String payslips = '/salary/payslips';
  static String payslipById(String id) => '/salary/payslips/$id';

  // Notifications
  static const String notifications = '/notifications';
  static String markNotificationRead(String id) => '/notifications/$id/read';
}
