import 'package:equatable/equatable.dart';
import 'package:exn_hr/features/overtime/domain/entities/ot_request.dart';

enum OtApprovalStatus { initial, loading, success, failure }

class OtApprovalState extends Equatable {
  const OtApprovalState({
    this.status = OtApprovalStatus.initial,
    this.requests = const [],
    this.errorMessage,
    this.actionLoadingId,
  });

  final OtApprovalStatus status;
  final List<OtRequest> requests;
  final String? errorMessage;
  final int? actionLoadingId;

  OtApprovalState copyWith({
    OtApprovalStatus? status,
    List<OtRequest>? requests,
    String? errorMessage,
    int? actionLoadingId,
    bool clearActionLoading = false,
  }) {
    return OtApprovalState(
      status: status ?? this.status,
      requests: requests ?? this.requests,
      errorMessage: errorMessage ?? this.errorMessage,
      actionLoadingId: clearActionLoading
          ? null
          : (actionLoadingId ?? this.actionLoadingId),
    );
  }

  @override
  List<Object?> get props => [status, requests, errorMessage, actionLoadingId];
}
