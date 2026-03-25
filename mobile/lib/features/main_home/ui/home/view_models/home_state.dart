import 'package:equatable/equatable.dart';
import 'package:exn_hr/features/main_home/ui/home/models/home_activity_preview.dart';

enum HomeStatus { initial, loading, success, failure }

class HomeState extends Equatable {
  const HomeState({
    this.status = HomeStatus.initial,
    this.isCheckedIn = false,
    this.checkInTime,
    this.todayHours = '0h 0m',
    this.errorMessage,
    this.userName = '',
    this.userRole = '',
    this.activities = const [],
    this.attendanceWarning,
  });

  final HomeStatus status;
  final bool isCheckedIn;
  final String? checkInTime;
  final String todayHours;
  final String? errorMessage;
  final String userName;
  final String userRole;
  final List<HomeActivityPreview> activities;
  /// Lỗi tải chấm công hôm nay (không chặn phần còn lại của home).
  final String? attendanceWarning;

  HomeState copyWith({
    HomeStatus? status,
    bool? isCheckedIn,
    String? checkInTime,
    String? todayHours,
    String? errorMessage,
    String? userName,
    String? userRole,
    List<HomeActivityPreview>? activities,
    String? attendanceWarning,
    bool setAttendanceWarning = false,
  }) {
    return HomeState(
      status: status ?? this.status,
      isCheckedIn: isCheckedIn ?? this.isCheckedIn,
      checkInTime: checkInTime ?? this.checkInTime,
      todayHours: todayHours ?? this.todayHours,
      errorMessage: errorMessage ?? this.errorMessage,
      userName: userName ?? this.userName,
      userRole: userRole ?? this.userRole,
      activities: activities ?? this.activities,
      attendanceWarning:
          setAttendanceWarning ? attendanceWarning : this.attendanceWarning,
    );
  }

  @override
  List<Object?> get props => [
        status,
        isCheckedIn,
        checkInTime,
        todayHours,
        errorMessage,
        userName,
        userRole,
        activities,
        attendanceWarning,
      ];
}
