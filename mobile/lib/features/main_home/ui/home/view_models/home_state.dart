import 'package:equatable/equatable.dart';

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
  });

  final HomeStatus status;
  final bool isCheckedIn;
  final String? checkInTime;
  final String todayHours;
  final String? errorMessage;
  final String userName;
  final String userRole;

  HomeState copyWith({
    HomeStatus? status,
    bool? isCheckedIn,
    String? checkInTime,
    String? todayHours,
    String? errorMessage,
    String? userName,
    String? userRole,
  }) {
    return HomeState(
      status: status ?? this.status,
      isCheckedIn: isCheckedIn ?? this.isCheckedIn,
      checkInTime: checkInTime ?? this.checkInTime,
      todayHours: todayHours ?? this.todayHours,
      errorMessage: errorMessage ?? this.errorMessage,
      userName: userName ?? this.userName,
      userRole: userRole ?? this.userRole,
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
      ];
}
