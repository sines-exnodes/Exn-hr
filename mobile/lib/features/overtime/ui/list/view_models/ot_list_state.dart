import 'package:equatable/equatable.dart';
import 'package:exn_hr/features/overtime/domain/entities/ot_request.dart';

enum OtListStatus { initial, loading, success, failure }

class OtListState extends Equatable {
  const OtListState({
    this.status = OtListStatus.initial,
    this.requests = const [],
    this.errorMessage,
    this.statusFilter = '',
    this.currentPage = 1,
    this.hasMore = true,
    this.isPaginating = false,
  });

  final OtListStatus status;
  final List<OtRequest> requests;
  final String? errorMessage;
  final String statusFilter;
  final int currentPage;
  final bool hasMore;
  final bool isPaginating;

  List<OtRequest> get filteredRequests {
    if (statusFilter.isEmpty) return requests;
    return requests
        .where((r) => r.overallStatus.toLowerCase() == statusFilter.toLowerCase())
        .toList();
  }

  double get totalOtHoursThisMonth {
    final now = DateTime.now();
    final prefix =
        '${now.year}-${now.month.toString().padLeft(2, '0')}';
    return requests
        .where((r) => r.date.startsWith(prefix))
        .fold(0.0, (sum, r) => sum + r.hours);
  }

  OtListState copyWith({
    OtListStatus? status,
    List<OtRequest>? requests,
    String? errorMessage,
    String? statusFilter,
    int? currentPage,
    bool? hasMore,
    bool? isPaginating,
  }) {
    return OtListState(
      status: status ?? this.status,
      requests: requests ?? this.requests,
      errorMessage: errorMessage ?? this.errorMessage,
      statusFilter: statusFilter ?? this.statusFilter,
      currentPage: currentPage ?? this.currentPage,
      hasMore: hasMore ?? this.hasMore,
      isPaginating: isPaginating ?? this.isPaginating,
    );
  }

  @override
  List<Object?> get props => [status, requests, errorMessage, statusFilter, currentPage, hasMore, isPaginating];
}
