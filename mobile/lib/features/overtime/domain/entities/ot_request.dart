import 'package:equatable/equatable.dart';

class OtRequest extends Equatable {
  const OtRequest({
    required this.id,
    required this.employeeId,
    required this.date,
    required this.startTime,
    required this.endTime,
    required this.hours,
    required this.otType,
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
  final String otType;
  final String reason;
  final String leaderStatus;
  final String ceoStatus;
  final String overallStatus;
  final String? employeeName;

  String get otTypeLabel {
    switch (otType) {
      case 'weekend':
        return 'Cuối tuần (x2.0)';
      case 'holiday':
        return 'Ngày lễ (x3.0)';
      default:
        return 'Ngày thường (x1.5)';
    }
  }

  @override
  List<Object?> get props => [id, date, startTime, endTime, otType, overallStatus];
}
