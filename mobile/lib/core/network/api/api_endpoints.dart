class ApiEndpoints {
  const ApiEndpoints._();

  static const String baseUrl = 'https://exn-hr.onrender.com/api/v1';

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

  // Projects
  static const String myProjects = '/projects/me';
  static const String upcomingMilestones = '/milestones/upcoming';
  static String projectById(int id) => '/projects/$id';
  static String projectMembers(int id) => '/projects/$id/members';
  static String projectMilestones(int id) => '/projects/$id/milestones';

  // Announcements
  static const String myAnnouncements = '/announcements/me';
  static String announcementById(int id) => '/announcements/$id';
  static String pollVote(int pollId) => '/polls/$pollId/vote';
  static String pollResults(int pollId) => '/polls/$pollId/results';

  // Auth — Forgot Password
  static const String forgotPassword = '/auth/forgot-password';
}
