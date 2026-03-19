import 'package:equatable/equatable.dart';
import 'package:exn_hr/features/leave/domain/entities/leave_request.dart';

enum LeaveListStatus { initial, loading, success, failure }

class LeaveListState extends Equatable {
  const LeaveListState({
    this.status = LeaveListStatus.initial,
    this.requests = const [],
    this.errorMessage,
  });

  final LeaveListStatus status;
  final List<LeaveRequest> requests;
  final String? errorMessage;

  LeaveListState copyWith({
    LeaveListStatus? status,
    List<LeaveRequest>? requests,
    String? errorMessage,
  }) {
    return LeaveListState(
      status: status ?? this.status,
      requests: requests ?? this.requests,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, requests, errorMessage];
}
