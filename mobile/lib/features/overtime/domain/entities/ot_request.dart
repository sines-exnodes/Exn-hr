import 'package:equatable/equatable.dart';

class OtRequest extends Equatable {
  const OtRequest({
    required this.id,
    required this.date,
    required this.startTime,
    required this.endTime,
    required this.totalHours,
    required this.reason,
    required this.status,
    this.leaderApproval,
    this.ceoApproval,
    this.createdAt,
    this.employeeId,
    this.employeeName,
  });

  final String id;
  final String date;
  final String startTime;
  final String endTime;
  final double totalHours;
  final String reason;
  final String status;
  final String? leaderApproval;
  final String? ceoApproval;
  final String? createdAt;
  final String? employeeId;
  final String? employeeName;

  @override
  List<Object?> get props => [id, date, startTime, endTime, status];
}
