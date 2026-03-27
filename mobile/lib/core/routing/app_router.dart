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
import 'package:exn_hr/features/overtime/ui/approval/views/ot_approval_page.dart';
import 'package:exn_hr/features/overtime/ui/list/views/ot_list_page.dart';
import 'package:exn_hr/features/salary/ui/payslip/views/payslip_page.dart';
import 'package:exn_hr/features/profile/ui/view/views/profile_page.dart';
import 'package:exn_hr/features/profile/ui/change_password/views/change_password_page.dart';
import 'package:exn_hr/features/notifications/ui/list/views/notifications_page.dart';
import 'package:flutter/material.dart';
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
  static const String otApproval = '/overtime/approval';
  static const String payslip = '/salary/payslip';
  static const String profile = '/profile';
  static const String changePassword = '/profile/change-password';
  static const String notifications = '/notifications';
}

/// Builds a [CustomTransitionPage] with a shared fade + slide-up transition
/// for all routes. Duration 300ms, easeOutCubic curve.
CustomTransitionPage<void> _buildPageWithTransition({
  required BuildContext context,
  required GoRouterState state,
  required Widget child,
}) {
  return CustomTransitionPage<void>(
    key: state.pageKey,
    child: child,
    transitionDuration: const Duration(milliseconds: 300),
    reverseTransitionDuration: const Duration(milliseconds: 250),
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      final curved = CurvedAnimation(
        parent: animation,
        curve: Curves.easeOutCubic,
      );
      return FadeTransition(
        opacity: curved,
        child: SlideTransition(
          position: Tween<Offset>(
            begin: const Offset(0, 0.04),
            end: Offset.zero,
          ).animate(curved),
          child: child,
        ),
      );
    },
  );
}

class AppRouter {
  AppRouter._();

  // TODO: Set to false for production
  static const _skipAuth = false;

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
        pageBuilder: (context, state) => _buildPageWithTransition(
          context: context, state: state, child: const SignInPage(),
        ),
      ),
      GoRoute(
        path: AppRoutes.home,
        pageBuilder: (context, state) => _buildPageWithTransition(
          context: context, state: state, child: const HomePage(),
        ),
      ),
      GoRoute(
        path: AppRoutes.checkIn,
        pageBuilder: (context, state) => _buildPageWithTransition(
          context: context, state: state, child: const CheckInPage(),
        ),
      ),
      GoRoute(
        path: AppRoutes.attendanceHistory,
        pageBuilder: (context, state) => _buildPageWithTransition(
          context: context, state: state, child: const AttendanceHistoryPage(),
        ),
      ),
      GoRoute(
        path: AppRoutes.leaveRequest,
        pageBuilder: (context, state) => _buildPageWithTransition(
          context: context, state: state, child: const LeaveRequestPage(),
        ),
      ),
      GoRoute(
        path: AppRoutes.leaveList,
        pageBuilder: (context, state) => _buildPageWithTransition(
          context: context, state: state, child: const LeaveListPage(),
        ),
      ),
      GoRoute(
        path: AppRoutes.leaveApproval,
        pageBuilder: (context, state) => _buildPageWithTransition(
          context: context, state: state, child: const LeaveApprovalPage(),
        ),
      ),
      GoRoute(
        path: AppRoutes.otRequest,
        pageBuilder: (context, state) => _buildPageWithTransition(
          context: context, state: state, child: const OtRequestPage(),
        ),
      ),
      GoRoute(
        path: AppRoutes.otList,
        pageBuilder: (context, state) => _buildPageWithTransition(
          context: context, state: state, child: const OtListPage(),
        ),
      ),
      GoRoute(
        path: AppRoutes.otApproval,
        pageBuilder: (context, state) => _buildPageWithTransition(
          context: context, state: state, child: const OtApprovalPage(),
        ),
      ),
      GoRoute(
        path: AppRoutes.payslip,
        pageBuilder: (context, state) => _buildPageWithTransition(
          context: context, state: state, child: const PayslipPage(),
        ),
      ),
      GoRoute(
        path: AppRoutes.profile,
        pageBuilder: (context, state) => _buildPageWithTransition(
          context: context, state: state, child: const ProfilePage(),
        ),
      ),
      GoRoute(
        path: AppRoutes.changePassword,
        pageBuilder: (context, state) => _buildPageWithTransition(
          context: context, state: state, child: const ChangePasswordPage(),
        ),
      ),
      GoRoute(
        path: AppRoutes.notifications,
        pageBuilder: (context, state) => _buildPageWithTransition(
          context: context, state: state, child: const NotificationsPage(),
        ),
      ),
    ],
  );
}
