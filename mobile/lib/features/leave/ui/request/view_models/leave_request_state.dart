import 'package:equatable/equatable.dart';
import 'package:exn_hr/features/leave/domain/entities/leave_request.dart';

enum LeaveRequestStatus { initial, loading, success, failure }

class LeaveRequestState extends Equatable {
  const LeaveRequestState({
    this.status = LeaveRequestStatus.initial,
    this.request,
    this.errorMessage,
    this.selectedType = 'paid',
    this.startDate,
    this.endDate,
    this.isHalfDay = false,
    this.halfDayPeriod,
  });

  final LeaveRequestStatus status;
  final LeaveRequest? request;
  final String? errorMessage;
  final String selectedType;
  final String? startDate;
  final String? endDate;
  final bool isHalfDay;
  final String? halfDayPeriod;

  LeaveRequestState copyWith({
    LeaveRequestStatus? status,
    LeaveRequest? request,
    String? errorMessage,
    String? selectedType,
    String? startDate,
    String? endDate,
    bool? isHalfDay,
    String? halfDayPeriod,
  }) {
    return LeaveRequestState(
      status: status ?? this.status,
      request: request ?? this.request,
      errorMessage: errorMessage ?? this.errorMessage,
      selectedType: selectedType ?? this.selectedType,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      isHalfDay: isHalfDay ?? this.isHalfDay,
      halfDayPeriod: halfDayPeriod ?? this.halfDayPeriod,
    );
  }

  @override
  List<Object?> get props => [status, request, errorMessage, selectedType, startDate, endDate, isHalfDay, halfDayPeriod];
}
