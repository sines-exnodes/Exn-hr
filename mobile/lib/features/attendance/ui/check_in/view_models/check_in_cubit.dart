import 'package:exn_hr/features/attendance/domain/usecases/check_in_usecase.dart';
import 'package:exn_hr/features/attendance/ui/check_in/view_models/check_in_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class CheckInCubit extends Cubit<CheckInState> {
  CheckInCubit({required CheckInUseCase checkInUseCase})
      : _checkInUseCase = checkInUseCase,
        super(const CheckInState());

  final CheckInUseCase _checkInUseCase;

  Future<void> detectLocation() async {
    emit(state.copyWith(locationStatus: LocationStatus.detecting));
    // In a real app, use geolocator package for GPS
    // For now, simulate detection
    await Future.delayed(const Duration(seconds: 1));
    if (isClosed) return;
    emit(state.copyWith(
      locationStatus: LocationStatus.granted,
      latitude: 10.7769,
      longitude: 106.7009,
      wifiSsid: 'Office-WiFi',
    ));
  }

  Future<void> checkIn() async {
    emit(state.copyWith(status: CheckInStatus.loading));
    final result = await _checkInUseCase(
      latitude: state.latitude,
      longitude: state.longitude,
      wifiSsid: state.wifiSsid,
    );
    if (isClosed) return;
    result.fold(
      (error) => emit(state.copyWith(
        status: CheckInStatus.failure,
        errorMessage: error.message,
      )),
      (record) => emit(state.copyWith(
        status: CheckInStatus.success,
        isCheckedIn: true,
        record: record,
      )),
    );
  }
}
