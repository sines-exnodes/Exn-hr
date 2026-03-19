import 'package:equatable/equatable.dart';
import 'package:exn_hr/features/attendance/domain/entities/attendance_record.dart';

enum AttendanceHistoryStatus { initial, loading, success, failure }

class AttendanceHistoryState extends Equatable {
  const AttendanceHistoryState({
    this.status = AttendanceHistoryStatus.initial,
    this.records = const [],
    this.errorMessage,
  });

  final AttendanceHistoryStatus status;
  final List<AttendanceRecord> records;
  final String? errorMessage;

  AttendanceHistoryState copyWith({
    AttendanceHistoryStatus? status,
    List<AttendanceRecord>? records,
    String? errorMessage,
  }) {
    return AttendanceHistoryState(
      status: status ?? this.status,
      records: records ?? this.records,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, records, errorMessage];
}
