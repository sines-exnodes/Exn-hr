import 'package:exn_hr/core/network/api/api_client.dart';
import 'package:exn_hr/core/storage/secure_storage.dart';
import 'package:exn_hr/features/authentication/data/repositories/auth_repository_impl.dart';
import 'package:exn_hr/features/authentication/domain/repositories/auth_repository.dart';
import 'package:exn_hr/features/authentication/domain/usecases/sign_in_usecase.dart';
import 'package:exn_hr/features/authentication/ui/sign_in/view_models/sign_in_cubit.dart';
import 'package:exn_hr/features/attendance/data/repositories/attendance_repository_impl.dart';
import 'package:exn_hr/features/attendance/domain/repositories/attendance_repository.dart';
import 'package:exn_hr/features/attendance/domain/usecases/check_in_usecase.dart';
import 'package:exn_hr/features/attendance/domain/usecases/get_attendance_history_usecase.dart';
import 'package:exn_hr/features/attendance/ui/check_in/view_models/check_in_cubit.dart';
import 'package:exn_hr/features/attendance/ui/history/view_models/attendance_history_cubit.dart';
import 'package:exn_hr/features/leave/data/repositories/leave_repository_impl.dart';
import 'package:exn_hr/features/leave/domain/repositories/leave_repository.dart';
import 'package:exn_hr/features/leave/domain/usecases/create_leave_request_usecase.dart';
import 'package:exn_hr/features/leave/domain/usecases/get_leave_list_usecase.dart';
import 'package:exn_hr/features/leave/domain/usecases/approve_leave_usecase.dart';
import 'package:exn_hr/features/leave/ui/request/view_models/leave_request_cubit.dart';
import 'package:exn_hr/features/leave/ui/list/view_models/leave_list_cubit.dart';
import 'package:exn_hr/features/leave/ui/approval/view_models/leave_approval_cubit.dart';
import 'package:exn_hr/features/overtime/data/repositories/overtime_repository_impl.dart';
import 'package:exn_hr/features/overtime/domain/repositories/overtime_repository.dart';
import 'package:exn_hr/features/overtime/domain/usecases/approve_overtime_usecase.dart';
import 'package:exn_hr/features/overtime/domain/usecases/create_ot_request_usecase.dart';
import 'package:exn_hr/features/overtime/domain/usecases/get_ot_list_usecase.dart';
import 'package:exn_hr/features/overtime/ui/request/view_models/ot_request_cubit.dart';
import 'package:exn_hr/features/overtime/ui/approval/view_models/ot_approval_cubit.dart';
import 'package:exn_hr/features/overtime/ui/list/view_models/ot_list_cubit.dart';
import 'package:exn_hr/features/salary/data/repositories/salary_repository_impl.dart';
import 'package:exn_hr/features/salary/domain/repositories/salary_repository.dart';
import 'package:exn_hr/features/salary/domain/usecases/get_payslip_usecase.dart';
import 'package:exn_hr/features/salary/ui/payslip/view_models/payslip_cubit.dart';
import 'package:exn_hr/features/profile/data/repositories/profile_repository_impl.dart';
import 'package:exn_hr/features/profile/domain/repositories/profile_repository.dart';
import 'package:exn_hr/features/profile/domain/usecases/get_profile_usecase.dart';
import 'package:exn_hr/features/profile/domain/usecases/change_password_usecase.dart';
import 'package:exn_hr/features/profile/domain/usecases/update_profile_usecase.dart';
import 'package:exn_hr/features/profile/ui/view/view_models/profile_cubit.dart';
import 'package:exn_hr/features/profile/ui/change_password/view_models/change_password_cubit.dart';
import 'package:exn_hr/features/notifications/data/repositories/notifications_repository_impl.dart';
import 'package:exn_hr/features/notifications/domain/repositories/notifications_repository.dart';
import 'package:exn_hr/features/notifications/domain/usecases/get_notifications_usecase.dart';
import 'package:exn_hr/features/notifications/domain/usecases/mark_notification_read_usecase.dart';
import 'package:exn_hr/features/notifications/ui/list/view_models/notifications_cubit.dart';
import 'package:exn_hr/features/projects/data/repositories/project_repository_impl.dart';
import 'package:exn_hr/features/projects/domain/repositories/project_repository.dart';
import 'package:exn_hr/features/projects/domain/usecases/get_my_projects_usecase.dart';
import 'package:exn_hr/features/projects/domain/usecases/get_project_detail_usecase.dart';
import 'package:exn_hr/features/projects/domain/usecases/get_upcoming_milestones_usecase.dart';
import 'package:exn_hr/features/projects/domain/usecases/toggle_milestone_item_usecase.dart';
import 'package:exn_hr/features/projects/ui/list/view_models/projects_cubit.dart';
import 'package:exn_hr/features/projects/ui/detail/view_models/project_detail_cubit.dart';
import 'package:exn_hr/features/announcements/data/repositories/announcements_repository_impl.dart';
import 'package:exn_hr/features/announcements/domain/repositories/announcements_repository.dart';
import 'package:exn_hr/features/announcements/domain/usecases/get_my_announcements_usecase.dart';
import 'package:exn_hr/features/announcements/domain/usecases/vote_poll_usecase.dart';
import 'package:exn_hr/features/announcements/domain/usecases/get_poll_results_usecase.dart';
import 'package:exn_hr/features/announcements/ui/list/view_models/announcements_cubit.dart';
import 'package:exn_hr/features/main_home/ui/home/view_models/home_cubit.dart';
import 'package:get_it/get_it.dart';

final getIt = GetIt.instance;

Future<void> configureDependencies() async {
  final secureStorage = SecureStorage();
  getIt.registerSingleton<SecureStorage>(secureStorage);

  final apiClient = ApiClient(secureStorage: secureStorage);
  getIt.registerSingleton<ApiClient>(apiClient);

  // Auth
  getIt.registerLazySingleton<AuthRepository>(() => AuthRepositoryImpl(apiClient: getIt<ApiClient>()));
  getIt.registerLazySingleton<SignInUseCase>(() => SignInUseCase(getIt<AuthRepository>()));
  getIt.registerFactory<SignInCubit>(() => SignInCubit(signInUseCase: getIt<SignInUseCase>(), secureStorage: getIt<SecureStorage>()));

  // Attendance
  getIt.registerLazySingleton<AttendanceRepository>(() => AttendanceRepositoryImpl(apiClient: getIt<ApiClient>()));
  getIt.registerLazySingleton<CheckInUseCase>(() => CheckInUseCase(getIt<AttendanceRepository>()));
  getIt.registerLazySingleton<GetAttendanceHistoryUseCase>(() => GetAttendanceHistoryUseCase(getIt<AttendanceRepository>()));
  getIt.registerFactory<CheckInCubit>(() => CheckInCubit(checkInUseCase: getIt<CheckInUseCase>()));
  getIt.registerFactory<AttendanceHistoryCubit>(() => AttendanceHistoryCubit(getAttendanceHistoryUseCase: getIt<GetAttendanceHistoryUseCase>()));

  // Leave
  getIt.registerLazySingleton<LeaveRepository>(() => LeaveRepositoryImpl(apiClient: getIt<ApiClient>()));
  getIt.registerLazySingleton<CreateLeaveRequestUseCase>(() => CreateLeaveRequestUseCase(getIt<LeaveRepository>()));
  getIt.registerLazySingleton<GetLeaveListUseCase>(() => GetLeaveListUseCase(getIt<LeaveRepository>()));
  getIt.registerLazySingleton<ApproveLeaveUseCase>(() => ApproveLeaveUseCase(getIt<LeaveRepository>()));
  getIt.registerFactory<LeaveRequestCubit>(() => LeaveRequestCubit(createLeaveRequestUseCase: getIt<CreateLeaveRequestUseCase>(), getLeaveListUseCase: getIt<GetLeaveListUseCase>()));
  getIt.registerFactory<LeaveListCubit>(() => LeaveListCubit(getLeaveListUseCase: getIt<GetLeaveListUseCase>()));
  getIt.registerFactory<LeaveApprovalCubit>(() => LeaveApprovalCubit(getLeaveListUseCase: getIt<GetLeaveListUseCase>(), approveLeaveUseCase: getIt<ApproveLeaveUseCase>()));

  // Overtime
  getIt.registerLazySingleton<OvertimeRepository>(() => OvertimeRepositoryImpl(apiClient: getIt<ApiClient>()));
  getIt.registerLazySingleton<CreateOtRequestUseCase>(() => CreateOtRequestUseCase(getIt<OvertimeRepository>()));
  getIt.registerLazySingleton<GetOtListUseCase>(() => GetOtListUseCase(getIt<OvertimeRepository>()));
  getIt.registerLazySingleton<ApproveOvertimeUseCase>(() => ApproveOvertimeUseCase(getIt<OvertimeRepository>()));
  getIt.registerFactory<OtRequestCubit>(() => OtRequestCubit(createOtRequestUseCase: getIt<CreateOtRequestUseCase>()));
  getIt.registerFactory<OtListCubit>(() => OtListCubit(getOtListUseCase: getIt<GetOtListUseCase>()));
  getIt.registerFactory<OtApprovalCubit>(() => OtApprovalCubit(
        getProfileUseCase: getIt<GetProfileUseCase>(),
        getOtListUseCase: getIt<GetOtListUseCase>(),
        approveOvertimeUseCase: getIt<ApproveOvertimeUseCase>(),
      ));

  // Salary
  getIt.registerLazySingleton<SalaryRepository>(() => SalaryRepositoryImpl(apiClient: getIt<ApiClient>()));
  getIt.registerLazySingleton<GetPayslipUseCase>(() => GetPayslipUseCase(getIt<SalaryRepository>()));
  getIt.registerFactory<PayslipCubit>(() => PayslipCubit(getPayslipUseCase: getIt<GetPayslipUseCase>()));

  // Profile
  getIt.registerLazySingleton<ProfileRepository>(() => ProfileRepositoryImpl(apiClient: getIt<ApiClient>()));
  getIt.registerLazySingleton<GetProfileUseCase>(() => GetProfileUseCase(getIt<ProfileRepository>()));
  getIt.registerLazySingleton<ChangePasswordUseCase>(() => ChangePasswordUseCase(getIt<ProfileRepository>()));
  getIt.registerLazySingleton<UpdateProfileUseCase>(() => UpdateProfileUseCase(getIt<ProfileRepository>()));
  getIt.registerFactory<ProfileCubit>(() => ProfileCubit(getProfileUseCase: getIt<GetProfileUseCase>()));
  getIt.registerFactory<ChangePasswordCubit>(() => ChangePasswordCubit(changePasswordUseCase: getIt<ChangePasswordUseCase>()));

  // Notifications
  getIt.registerLazySingleton<NotificationsRepository>(() => NotificationsRepositoryImpl(apiClient: getIt<ApiClient>()));
  getIt.registerLazySingleton<GetNotificationsUseCase>(() => GetNotificationsUseCase(getIt<NotificationsRepository>()));
  getIt.registerLazySingleton<MarkNotificationReadUseCase>(() => MarkNotificationReadUseCase(getIt<NotificationsRepository>()));
  getIt.registerFactory<NotificationsCubit>(() => NotificationsCubit(
        getNotificationsUseCase: getIt<GetNotificationsUseCase>(),
        markNotificationReadUseCase: getIt<MarkNotificationReadUseCase>(),
      ));

  // Projects
  getIt.registerLazySingleton<ProjectRepository>(() => ProjectRepositoryImpl(apiClient: getIt<ApiClient>()));
  getIt.registerLazySingleton<GetMyProjectsUseCase>(() => GetMyProjectsUseCase(getIt<ProjectRepository>()));
  getIt.registerLazySingleton<GetProjectDetailUseCase>(() => GetProjectDetailUseCase(getIt<ProjectRepository>()));
  getIt.registerLazySingleton<GetUpcomingMilestonesUseCase>(() => GetUpcomingMilestonesUseCase(getIt<ProjectRepository>()));
  getIt.registerLazySingleton<ToggleMilestoneItemUseCase>(() => ToggleMilestoneItemUseCase(getIt<ProjectRepository>()));
  getIt.registerFactory<ProjectsCubit>(() => ProjectsCubit(getMyProjectsUseCase: getIt<GetMyProjectsUseCase>()));
  getIt.registerFactory<ProjectDetailCubit>(() => ProjectDetailCubit(
        getProjectDetailUseCase: getIt<GetProjectDetailUseCase>(),
        toggleMilestoneItemUseCase: getIt<ToggleMilestoneItemUseCase>(),
      ));

  // Announcements
  getIt.registerLazySingleton<AnnouncementsRepository>(() => AnnouncementsRepositoryImpl(apiClient: getIt<ApiClient>()));
  getIt.registerLazySingleton<GetMyAnnouncementsUseCase>(() => GetMyAnnouncementsUseCase(getIt<AnnouncementsRepository>()));
  getIt.registerLazySingleton<VotePollUseCase>(() => VotePollUseCase(getIt<AnnouncementsRepository>()));
  getIt.registerLazySingleton<GetPollResultsUseCase>(() => GetPollResultsUseCase(getIt<AnnouncementsRepository>()));
  getIt.registerFactory<AnnouncementsCubit>(() => AnnouncementsCubit(
        getMyAnnouncementsUseCase: getIt<GetMyAnnouncementsUseCase>(),
        votePollUseCase: getIt<VotePollUseCase>(),
        getPollResultsUseCase: getIt<GetPollResultsUseCase>(),
      ));

  // Home
  getIt.registerFactory<HomeCubit>(() => HomeCubit(
        getAttendanceHistoryUseCase: getIt<GetAttendanceHistoryUseCase>(),
        getProfileUseCase: getIt<GetProfileUseCase>(),
        getLeaveListUseCase: getIt<GetLeaveListUseCase>(),
        getOtListUseCase: getIt<GetOtListUseCase>(),
        getUpcomingMilestonesUseCase: getIt<GetUpcomingMilestonesUseCase>(),
      ));
}
