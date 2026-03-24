import 'package:exn_hr/features/attendance/domain/usecases/check_in_usecase.dart';
import 'package:exn_hr/features/attendance/domain/usecases/get_attendance_history_usecase.dart';
import 'package:exn_hr/features/main_home/ui/home/view_models/home_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class HomeCubit extends Cubit<HomeState> {
  HomeCubit({
    required GetAttendanceHistoryUseCase getAttendanceHistoryUseCase,
    // checkInUseCase retained for DI wiring; home screen triggers check-in
    // via CheckInCubit directly, not through HomeCubit
    required CheckInUseCase checkInUseCase,
  })  : _getAttendanceHistoryUseCase = getAttendanceHistoryUseCase,
        super(const HomeState());

  final GetAttendanceHistoryUseCase _getAttendanceHistoryUseCase;

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
        // Calculate hours from checkInTime/checkOutTime difference
        String todayHours = '0h 0m';
        if (todayRecord?.checkInTime != null && todayRecord?.checkOutTime != null) {
          try {
            final inDt = DateTime.parse(todayRecord!.checkInTime!);
            final outDt = DateTime.parse(todayRecord.checkOutTime!);
            final diff = outDt.difference(inDt);
            todayHours = '${diff.inHours}h ${diff.inMinutes.remainder(60)}m';
          } catch (_) {
            todayHours = '0h 0m';
          }
        }
        emit(state.copyWith(
          status: HomeStatus.success,
          isCheckedIn: todayRecord?.checkOutTime == null && todayRecord?.checkInTime != null,
          checkInTime: todayRecord?.checkInTime,
          todayHours: todayHours,
        ));
      },
    );
  }
}
