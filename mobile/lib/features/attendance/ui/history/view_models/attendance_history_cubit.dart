import 'package:exn_hr/features/attendance/domain/usecases/get_attendance_history_usecase.dart';
import 'package:exn_hr/features/attendance/ui/history/view_models/attendance_history_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class AttendanceHistoryCubit extends Cubit<AttendanceHistoryState> {
  AttendanceHistoryCubit({
    required GetAttendanceHistoryUseCase getAttendanceHistoryUseCase,
  })  : _getAttendanceHistoryUseCase = getAttendanceHistoryUseCase,
        super(const AttendanceHistoryState()) {
    loadHistory();
  }

  final GetAttendanceHistoryUseCase _getAttendanceHistoryUseCase;

  static const int _pageSize = 20;

  /// Initial load or pull-to-refresh (resets pagination).
  Future<void> loadHistory() async {
    emit(state.copyWith(
      status: AttendanceHistoryStatus.loading,
      records: const [],
      currentPage: 1,
      hasMore: true,
      isPaginating: false,
    ));
    final result = await _getAttendanceHistoryUseCase(page: 1, size: _pageSize);
    if (isClosed) return;
    result.fold(
      (error) => emit(state.copyWith(
        status: AttendanceHistoryStatus.failure,
        errorMessage: error.message,
      )),
      (records) => emit(state.copyWith(
        status: AttendanceHistoryStatus.success,
        records: records,
        currentPage: 1,
        hasMore: records.length >= _pageSize,
      )),
    );
  }

  /// Load the next page and append.
  Future<void> loadNextPage() async {
    if (!state.hasMore || state.isPaginating) return;
    emit(state.copyWith(isPaginating: true));
    final nextPage = state.currentPage + 1;
    final result = await _getAttendanceHistoryUseCase(page: nextPage, size: _pageSize);
    if (isClosed) return;
    result.fold(
      (error) => emit(state.copyWith(isPaginating: false)),
      (newRecords) {
        final combined = [...state.records, ...newRecords];
        emit(state.copyWith(
          records: combined,
          currentPage: nextPage,
          hasMore: newRecords.length >= _pageSize,
          isPaginating: false,
        ));
      },
    );
  }
}
