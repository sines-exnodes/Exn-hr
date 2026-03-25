import 'package:equatable/equatable.dart';
import 'package:exn_hr/features/leave/domain/entities/leave_request.dart';

enum LeaveApprovalStatus { initial, loading, success, failure }

class LeaveApprovalState extends Equatable {
  const LeaveApprovalState({
    this.status = LeaveApprovalStatus.initial,
    this.requests = const [],
    this.errorMessage,
    this.actionLoadingId,
  });

  final LeaveApprovalStatus status;
  final List<LeaveRequest> requests;
  final String? errorMessage;
  /// Đang gọi API duyệt / từ chối cho đơn này.
  final int? actionLoadingId;

  LeaveApprovalState copyWith({
    LeaveApprovalStatus? status,
    List<LeaveRequest>? requests,
    String? errorMessage,
    int? actionLoadingId,
    bool clearActionLoading = false,
  }) {
    return LeaveApprovalState(
      status: status ?? this.status,
      requests: requests ?? this.requests,
      errorMessage: errorMessage ?? this.errorMessage,
      actionLoadingId: clearActionLoading ? null : (actionLoadingId ?? this.actionLoadingId),
    );
  }

  @override
  List<Object?> get props => [status, requests, errorMessage, actionLoadingId];
}
