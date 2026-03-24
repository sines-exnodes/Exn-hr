class ApiEndpoints {
  const ApiEndpoints._();

  static const String baseUrl = 'http://10.0.2.2:8080/api/v1';

  // Auth
  static const String login = '/auth/login';
  static const String me = '/auth/me';
  static const String changePassword = '/auth/change-password';

  // Employee / Profile
  static const String myProfile = '/employees/me';

  // Attendance
  static const String checkIn = '/attendance/check-in';
  static const String checkOut = '/attendance/check-out';
  static const String attendanceToday = '/attendance/today';
  static const String attendance = '/attendance';
  static const String officeLocations = '/attendance/office-locations';

  // Leave
  static const String leave = '/leave';
  static const String leaveBalance = '/leave/balance';
  static String leaveById(int id) => '/leave/$id';
  static String leaveLeaderApprove(int id) => '/leave/$id/leader-approve';
  static String leaveHrApprove(int id) => '/leave/$id/hr-approve';

  // Overtime
  static const String overtime = '/overtime';
  static String overtimeById(int id) => '/overtime/$id';
  static String overtimeLeaderApprove(int id) => '/overtime/$id/leader-approve';
  static String overtimeCeoApprove(int id) => '/overtime/$id/ceo-approve';

  // Salary
  static const String salaryMe = '/salary/me';

  // Notifications
  static const String notifications = '/notifications';
  static const String notificationsUnreadCount = '/notifications/unread-count';
  static const String notificationsReadAll = '/notifications/read-all';
  static String notificationMarkRead(int id) => '/notifications/$id/read';
}
