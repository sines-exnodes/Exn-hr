import 'package:equatable/equatable.dart';
import 'package:exn_hr/features/leave/domain/entities/leave_request.dart';

enum LeaveListStatus { initial, loading, success, failure }

class LeaveListState extends Equatable {
  const LeaveListState({
    this.status = LeaveListStatus.initial,
    this.requests = const [],
    this.errorMessage,
    this.balance,
    this.statusFilter = '',
    this.currentPage = 1,
    this.hasMore = true,
    this.isPaginating = false,
  });

  final LeaveListStatus status;
  final List<LeaveRequest> requests;
  final String? errorMessage;
  final LeaveBalance? balance;
  final String statusFilter;
  final int currentPage;
  final bool hasMore;
  final bool isPaginating;

  List<LeaveRequest> get filteredRequests {
    if (statusFilter.isEmpty) return requests;
    return requests
        .where((r) => r.overallStatus.toLowerCase() == statusFilter.toLowerCase())
        .toList();
  }

  LeaveListState copyWith({
    LeaveListStatus? status,
    List<LeaveRequest>? requests,
    String? errorMessage,
    LeaveBalance? balance,
    String? statusFilter,
    int? currentPage,
    bool? hasMore,
    bool? isPaginating,
  }) {
    return LeaveListState(
      status: status ?? this.status,
      requests: requests ?? this.requests,
      errorMessage: errorMessage ?? this.errorMessage,
      balance: balance ?? this.balance,
      statusFilter: statusFilter ?? this.statusFilter,
      currentPage: currentPage ?? this.currentPage,
      hasMore: hasMore ?? this.hasMore,
      isPaginating: isPaginating ?? this.isPaginating,
    );
  }

  @override
  List<Object?> get props => [status, requests, errorMessage, balance, statusFilter, currentPage, hasMore, isPaginating];
}
