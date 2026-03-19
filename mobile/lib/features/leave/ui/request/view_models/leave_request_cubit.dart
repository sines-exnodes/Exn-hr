import 'package:exn_hr/features/leave/domain/usecases/create_leave_request_usecase.dart';
import 'package:exn_hr/features/leave/ui/request/view_models/leave_request_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class LeaveRequestCubit extends Cubit<LeaveRequestState> {
  LeaveRequestCubit({required CreateLeaveRequestUseCase createLeaveRequestUseCase})
      : _createLeaveRequestUseCase = createLeaveRequestUseCase,
        super(const LeaveRequestState());

  final CreateLeaveRequestUseCase _createLeaveRequestUseCase;

  void setType(String type) => emit(state.copyWith(selectedType: type));
  void setStartDate(String date) => emit(state.copyWith(startDate: date));
  void setEndDate(String date) => emit(state.copyWith(endDate: date));

  Future<void> submit({required String reason}) async {
    if (state.startDate == null || state.endDate == null) return;

    emit(state.copyWith(status: LeaveRequestStatus.loading));
    final result = await _createLeaveRequestUseCase(
      type: state.selectedType,
      startDate: state.startDate!,
      endDate: state.endDate!,
      reason: reason,
    );
    if (isClosed) return;
    result.fold(
      (error) => emit(state.copyWith(
        status: LeaveRequestStatus.failure,
        errorMessage: error.message,
      )),
      (request) => emit(state.copyWith(
        status: LeaveRequestStatus.success,
        request: request,
      )),
    );
  }
}
