import 'package:exn_hr/features/overtime/domain/usecases/create_ot_request_usecase.dart';
import 'package:exn_hr/features/overtime/ui/request/view_models/ot_request_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class OtRequestCubit extends Cubit<OtRequestState> {
  OtRequestCubit({required CreateOtRequestUseCase createOtRequestUseCase})
      : _createOtRequestUseCase = createOtRequestUseCase,
        super(const OtRequestState());

  final CreateOtRequestUseCase _createOtRequestUseCase;

  void setDate(String date) => emit(state.copyWith(date: date));
  void setStartTime(String time) => emit(state.copyWith(startTime: time));
  void setEndTime(String time) => emit(state.copyWith(endTime: time));

  Future<void> submit({required String reason}) async {
    if (state.date == null || state.startTime == null || state.endTime == null) return;

    emit(state.copyWith(status: OtRequestStatus.loading));
    final result = await _createOtRequestUseCase(
      date: state.date!,
      startTime: state.startTime!,
      endTime: state.endTime!,
      reason: reason,
    );
    if (isClosed) return;
    result.fold(
      (error) => emit(state.copyWith(
        status: OtRequestStatus.failure,
        errorMessage: error.message,
      )),
      (request) => emit(state.copyWith(
        status: OtRequestStatus.success,
        request: request,
      )),
    );
  }
}
