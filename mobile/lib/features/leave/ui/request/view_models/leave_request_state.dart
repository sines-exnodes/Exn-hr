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
  });

  final LeaveRequestStatus status;
  final LeaveRequest? request;
  final String? errorMessage;
  final String selectedType;
  final String? startDate;
  final String? endDate;

  LeaveRequestState copyWith({
    LeaveRequestStatus? status,
    LeaveRequest? request,
    String? errorMessage,
    String? selectedType,
    String? startDate,
    String? endDate,
  }) {
    return LeaveRequestState(
      status: status ?? this.status,
      request: request ?? this.request,
      errorMessage: errorMessage ?? this.errorMessage,
      selectedType: selectedType ?? this.selectedType,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
    );
  }

  @override
  List<Object?> get props => [status, request, errorMessage, selectedType, startDate, endDate];
}
