import 'package:equatable/equatable.dart';

class LeaveRequest extends Equatable {
  const LeaveRequest({
    required this.id,
    required this.type,
    required this.startDate,
    required this.endDate,
    required this.totalDays,
    required this.reason,
    required this.status,
    this.leaderApproval,
    this.hrApproval,
    this.createdAt,
    this.employeeId,
    this.employeeName,
  });

  final String id;
  final String type;
  final String startDate;
  final String endDate;
  final int totalDays;
  final String reason;
  final String status; // pending | approved | rejected
  final String? leaderApproval;
  final String? hrApproval;
  final String? createdAt;
  final String? employeeId;
  final String? employeeName;

  @override
  List<Object?> get props => [id, type, startDate, endDate, status];
}
