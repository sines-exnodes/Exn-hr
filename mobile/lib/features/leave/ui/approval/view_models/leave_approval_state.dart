import 'package:equatable/equatable.dart';
import 'package:exn_hr/features/leave/domain/entities/leave_request.dart';

enum LeaveApprovalStatus { initial, loading, success, failure, approving }

class LeaveApprovalState extends Equatable {
  const LeaveApprovalState({
    this.status = LeaveApprovalStatus.initial,
    this.requests = const [],
    this.errorMessage,
  });

  final LeaveApprovalStatus status;
  final List<LeaveRequest> requests;
  final String? errorMessage;

  LeaveApprovalState copyWith({
    LeaveApprovalStatus? status,
    List<LeaveRequest>? requests,
    String? errorMessage,
  }) {
    return LeaveApprovalState(
      status: status ?? this.status,
      requests: requests ?? this.requests,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, requests, errorMessage];
}
