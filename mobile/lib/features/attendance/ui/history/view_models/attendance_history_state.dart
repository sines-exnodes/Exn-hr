import 'package:equatable/equatable.dart';
import 'package:exn_hr/features/attendance/domain/entities/attendance_record.dart';

enum AttendanceHistoryStatus { initial, loading, success, failure }

class AttendanceHistoryState extends Equatable {
  const AttendanceHistoryState({
    this.status = AttendanceHistoryStatus.initial,
    this.records = const [],
    this.errorMessage,
    this.currentPage = 1,
    this.hasMore = true,
    this.isPaginating = false,
  });

  final AttendanceHistoryStatus status;
  final List<AttendanceRecord> records;
  final String? errorMessage;
  final int currentPage;
  final bool hasMore;
  final bool isPaginating;

  AttendanceHistoryState copyWith({
    AttendanceHistoryStatus? status,
    List<AttendanceRecord>? records,
    String? errorMessage,
    int? currentPage,
    bool? hasMore,
    bool? isPaginating,
  }) {
    return AttendanceHistoryState(
      status: status ?? this.status,
      records: records ?? this.records,
      errorMessage: errorMessage ?? this.errorMessage,
      currentPage: currentPage ?? this.currentPage,
      hasMore: hasMore ?? this.hasMore,
      isPaginating: isPaginating ?? this.isPaginating,
    );
  }

  @override
  List<Object?> get props => [status, records, errorMessage, currentPage, hasMore, isPaginating];
}
