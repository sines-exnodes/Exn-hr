import 'package:equatable/equatable.dart';

class LeaveRequest extends Equatable {
  const LeaveRequest({
    required this.id,
    required this.employeeId,
    required this.type,
    required this.startDate,
    required this.endDate,
    required this.days,
    required this.reason,
    required this.leaderStatus,
    required this.hrStatus,
    required this.overallStatus,
    this.employeeName,
  });

  final int id;
  final int employeeId;
  final String type;
  final String startDate;
  final String endDate;
  final double days;
  final String reason;
  final String leaderStatus;
  final String hrStatus;
  final String overallStatus;
  final String? employeeName;

  @override
  List<Object?> get props => [id, type, startDate, endDate, overallStatus];
}

class LeaveBalance extends Equatable {
  const LeaveBalance({
    required this.totalDays,
    required this.usedDays,
    required this.remainingDays,
  });

  final int totalDays;
  final double usedDays;
  final double remainingDays;

  @override
  List<Object?> get props => [totalDays, usedDays, remainingDays];
}
