import 'package:exn_hr/features/attendance/domain/usecases/check_in_usecase.dart';
import 'package:exn_hr/features/attendance/domain/usecases/get_attendance_history_usecase.dart';
import 'package:exn_hr/features/main_home/ui/home/view_models/home_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class HomeCubit extends Cubit<HomeState> {
  HomeCubit({
    required GetAttendanceHistoryUseCase getAttendanceHistoryUseCase,
    required CheckInUseCase checkInUseCase,
  })  : _getAttendanceHistoryUseCase = getAttendanceHistoryUseCase,
        _checkInUseCase = checkInUseCase,
        super(const HomeState());

  final GetAttendanceHistoryUseCase _getAttendanceHistoryUseCase;
  final CheckInUseCase _checkInUseCase;

  Future<void> loadHomeData({String userName = '', String userRole = ''}) async {
    emit(state.copyWith(
      status: HomeStatus.loading,
      userName: userName,
      userRole: userRole,
    ));

    // Load today's attendance status
    final result = await _getAttendanceHistoryUseCase(page: 1, size: 1);
    if (isClosed) return;

    result.fold(
      (error) => emit(state.copyWith(status: HomeStatus.failure, errorMessage: error.message)),
      (history) {
        final todayRecord = history.isNotEmpty ? history.first : null;
        emit(state.copyWith(
          status: HomeStatus.success,
          isCheckedIn: todayRecord?.checkOutTime == null && todayRecord?.checkInTime != null,
          checkInTime: todayRecord?.checkInTime,
          todayHours: todayRecord?.totalHours ?? '0h 0m',
        ));
      },
    );
  }
}
