import 'package:exn_hr/features/overtime/domain/usecases/get_ot_list_usecase.dart';
import 'package:exn_hr/features/overtime/ui/list/view_models/ot_list_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class OtListCubit extends Cubit<OtListState> {
  OtListCubit({required GetOtListUseCase getOtListUseCase})
      : _getOtListUseCase = getOtListUseCase,
        super(const OtListState()) {
    loadList();
  }

  final GetOtListUseCase _getOtListUseCase;

  static const int _pageSize = 20;

  void updateStatusFilter(String filter) {
    emit(state.copyWith(statusFilter: filter));
  }

  /// Initial load or pull-to-refresh (resets pagination).
  Future<void> loadList() async {
    emit(state.copyWith(
      status: OtListStatus.loading,
      requests: const [],
      currentPage: 1,
      hasMore: true,
      isPaginating: false,
    ));
    final result = await _getOtListUseCase(page: 1, size: _pageSize);
    if (isClosed) return;
    result.fold(
      (error) => emit(state.copyWith(
        status: OtListStatus.failure,
        errorMessage: error.message,
      )),
      (requests) => emit(state.copyWith(
        status: OtListStatus.success,
        requests: requests,
        currentPage: 1,
        hasMore: requests.length >= _pageSize,
      )),
    );
  }

  /// Load the next page and append.
  Future<void> loadNextPage() async {
    if (!state.hasMore || state.isPaginating) return;
    emit(state.copyWith(isPaginating: true));
    final nextPage = state.currentPage + 1;
    final result = await _getOtListUseCase(page: nextPage, size: _pageSize);
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
