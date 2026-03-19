import 'package:exn_hr/core/storage/secure_storage.dart';
import 'package:exn_hr/config/di.dart';
import 'package:exn_hr/features/authentication/ui/sign_in/views/sign_in_page.dart';
import 'package:exn_hr/features/main_home/ui/home/views/home_page.dart';
import 'package:exn_hr/features/attendance/ui/check_in/views/check_in_page.dart';
import 'package:exn_hr/features/attendance/ui/history/views/attendance_history_page.dart';
import 'package:exn_hr/features/leave/ui/request/views/leave_request_page.dart';
import 'package:exn_hr/features/leave/ui/list/views/leave_list_page.dart';
import 'package:exn_hr/features/leave/ui/approval/views/leave_approval_page.dart';
import 'package:exn_hr/features/overtime/ui/request/views/ot_request_page.dart';
import 'package:exn_hr/features/overtime/ui/list/views/ot_list_page.dart';
import 'package:exn_hr/features/salary/ui/payslip/views/payslip_page.dart';
import 'package:exn_hr/features/profile/ui/view/views/profile_page.dart';
import 'package:exn_hr/features/profile/ui/change_password/views/change_password_page.dart';
import 'package:exn_hr/features/notifications/ui/list/views/notifications_page.dart';
import 'package:go_router/go_router.dart';

class AppRoutes {
  const AppRoutes._();

  static const String signIn = '/sign-in';
  static const String home = '/home';
  static const String checkIn = '/attendance/check-in';
  static const String attendanceHistory = '/attendance/history';
  static const String leaveRequest = '/leave/request';
  static const String leaveList = '/leave/list';
  static const String leaveApproval = '/leave/approval';
  static const String otRequest = '/overtime/request';
  static const String otList = '/overtime/list';
  static const String payslip = '/salary/payslip';
  static const String profile = '/profile';
  static const String changePassword = '/profile/change-password';
  static const String notifications = '/notifications';
}

class AppRouter {
  AppRouter._();

  // TODO: Set to false for production
  static const _skipAuth = true;

  static final _secureStorage = getIt<SecureStorage>();

  static final GoRouter router = GoRouter(
    initialLocation: _skipAuth ? AppRoutes.home : AppRoutes.signIn,
    redirect: (context, state) async {
      if (_skipAuth) return null;

      final isAuthenticated = await _secureStorage.isAuthenticated();
      final isOnSignIn = state.matchedLocation == AppRoutes.signIn;

      if (!isAuthenticated && !isOnSignIn) {
        return AppRoutes.signIn;
      }
      if (isAuthenticated && isOnSignIn) {
        return AppRoutes.home;
      }
      return null;
    },
    routes: [
      GoRoute(
        path: AppRoutes.signIn,
        builder: (context, state) => const SignInPage(),
      ),
      GoRoute(
        path: AppRoutes.home,
        builder: (context, state) => const HomePage(),
      ),
      GoRoute(
        path: AppRoutes.checkIn,
        builder: (context, state) => const CheckInPage(),
      ),
      GoRoute(
        path: AppRoutes.attendanceHistory,
        builder: (context, state) => const AttendanceHistoryPage(),
      ),
      GoRoute(
        path: AppRoutes.leaveRequest,
        builder: (context, state) => const LeaveRequestPage(),
      ),
      GoRoute(
        path: AppRoutes.leaveList,
        builder: (context, state) => const LeaveListPage(),
      ),
      GoRoute(
        path: AppRoutes.leaveApproval,
        builder: (context, state) => const LeaveApprovalPage(),
      ),
      GoRoute(
        path: AppRoutes.otRequest,
        builder: (context, state) => const OtRequestPage(),
      ),
      GoRoute(
        path: AppRoutes.otList,
        builder: (context, state) => const OtListPage(),
      ),
      GoRoute(
        path: AppRoutes.payslip,
        builder: (context, state) => const PayslipPage(),
      ),
      GoRoute(
        path: AppRoutes.profile,
        builder: (context, state) => const ProfilePage(),
      ),
      GoRoute(
        path: AppRoutes.changePassword,
        builder: (context, state) => const ChangePasswordPage(),
      ),
      GoRoute(
        path: AppRoutes.notifications,
        builder: (context, state) => const NotificationsPage(),
      ),
    ],
  );
}
