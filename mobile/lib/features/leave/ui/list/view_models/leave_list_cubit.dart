import 'package:exn_hr/features/leave/domain/usecases/get_leave_list_usecase.dart';
import 'package:exn_hr/features/leave/ui/list/view_models/leave_list_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class LeaveListCubit extends Cubit<LeaveListState> {
  LeaveListCubit({required GetLeaveListUseCase getLeaveListUseCase})
      : _getLeaveListUseCase = getLeaveListUseCase,
        super(const LeaveListState()) {
    loadList();
  }

  final GetLeaveListUseCase _getLeaveListUseCase;

  static const int _pageSize = 20;

  void updateStatusFilter(String filter) {
    emit(state.copyWith(statusFilter: filter));
  }

  /// Initial load or pull-to-refresh (resets pagination).
  Future<void> loadList({String? status}) async {
    emit(state.copyWith(
      status: LeaveListStatus.loading,
      requests: const [],
      currentPage: 1,
      hasMore: true,
      isPaginating: false,
    ));
    final results = await Future.wait([
      _getLeaveListUseCase(page: 1, size: _pageSize, status: status),
      _getLeaveListUseCase.getBalance(),
    ]);
    if (isClosed) return;
    final listResult = results[0] as dynamic;
    final balanceResult = results[1] as dynamic;
    listResult.fold(
      (error) => emit(state.copyWith(
        status: LeaveListStatus.failure,
        errorMessage: error.message,
      )),
      (requests) {
        var newState = state.copyWith(
          status: LeaveListStatus.success,
          requests: requests,
          currentPage: 1,
          hasMore: (requests as List).length >= _pageSize,
        );
        balanceResult.fold(
          (_) {},
          (balance) { newState = newState.copyWith(balance: balance); },
        );
        emit(newState);
      },
    );
  }

  /// Load the next page and append.
  Future<void> loadNextPage() async {
    if (!state.hasMore || state.isPaginating) return;
    emit(state.copyWith(isPaginating: true));
    final nextPage = state.currentPage + 1;
    final result = await _getLeaveListUseCase(page: nextPage, size: _pageSize);
    if (isClosed) return;
    result.fold(
      (error) => emit(state.copyWith(isPaginating: false)),
      (newRequests) {
        final combined = [...state.requests, ...newRequests];
        emit(state.copyWith(
          requests: combined,
          currentPage: nextPage,
          hasMore: newRequests.length >= _pageSize,
          isPaginating: false,
        ));
      },
    );
  }
}
