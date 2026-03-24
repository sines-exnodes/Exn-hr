import 'package:equatable/equatable.dart';

class OtRequest extends Equatable {
  const OtRequest({
    required this.id,
    required this.employeeId,
    required this.date,
    required this.startTime,
    required this.endTime,
    required this.hours,
    required this.reason,
    required this.leaderStatus,
    required this.ceoStatus,
    required this.overallStatus,
    this.employeeName,
  });

  final int id;
  final int employeeId;
  final String date;
  final String startTime;
  final String endTime;
  final double hours;
  final String reason;
  final String leaderStatus;
  final String ceoStatus;
  final String overallStatus;
  final String? employeeName;

  @override
  List<Object?> get props => [id, date, startTime, endTime, overallStatus];
}
