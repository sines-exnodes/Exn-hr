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

  Future<void> loadHistory({int page = 1}) async {
    emit(state.copyWith(status: AttendanceHistoryStatus.loading));
    final result = await _getAttendanceHistoryUseCase(page: page, size: 20);
    if (isClosed) return;
    result.fold(
      (error) => emit(state.copyWith(
        status: AttendanceHistoryStatus.failure,
        errorMessage: error.message,
      )),
      (records) => emit(state.copyWith(
        status: AttendanceHistoryStatus.success,
        records: records,
      )),
    );
  }
}
