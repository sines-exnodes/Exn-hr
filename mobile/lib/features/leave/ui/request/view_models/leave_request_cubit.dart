import 'package:exn_hr/features/leave/domain/usecases/create_leave_request_usecase.dart';
import 'package:exn_hr/features/leave/domain/usecases/get_leave_list_usecase.dart';
import 'package:exn_hr/features/leave/ui/request/view_models/leave_request_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class LeaveRequestCubit extends Cubit<LeaveRequestState> {
  LeaveRequestCubit({
    required CreateLeaveRequestUseCase createLeaveRequestUseCase,
    required GetLeaveListUseCase getLeaveListUseCase,
  })  : _createLeaveRequestUseCase = createLeaveRequestUseCase,
        super(const LeaveRequestState());

  final CreateLeaveRequestUseCase _createLeaveRequestUseCase;

  void setType(String type) => emit(state.copyWith(selectedType: type));
  void setStartDate(String date) => emit(state.copyWith(startDate: date));
  void setEndDate(String date) => emit(state.copyWith(endDate: date));

  void toggleHalfDay() {
    final newValue = !state.isHalfDay;
    if (newValue) {
      // When half-day toggled on: endDate = startDate
      emit(state.copyWith(
        isHalfDay: true,
        halfDayPeriod: state.halfDayPeriod ?? 'morning',
        endDate: state.startDate,
      ));
    } else {
      emit(LeaveRequestState(
        status: state.status,
        request: state.request,
        errorMessage: state.errorMessage,
        selectedType: state.selectedType,
        startDate: state.startDate,
        endDate: state.endDate,
        isHalfDay: false,
      ));
    }
  }

  void setHalfDayPeriod(String period) =>
      emit(state.copyWith(halfDayPeriod: period));

  Future<void> submit({required String reason}) async {
    if (state.startDate == null) return;
    if (!state.isHalfDay && state.endDate == null) return;

    // Calculate number of days between start and end dates
    final double days;
    final String endDate;
    if (state.isHalfDay) {
      days = 0.5;
      endDate = state.startDate!;
    } else {
      final start = DateTime.tryParse(state.startDate!) ?? DateTime.now();
      final end = DateTime.tryParse(state.endDate!) ?? DateTime.now();
      days = end.difference(start).inDays + 1.0;
      endDate = state.endDate!;
    }

    emit(state.copyWith(status: LeaveRequestStatus.loading));
    final result = await _createLeaveRequestUseCase(
      type: state.selectedType,
      startDate: state.startDate!,
      endDate: endDate,
      days: days,
      reason: reason,
      isHalfDay: state.isHalfDay,
      halfDayPeriod: state.isHalfDay ? state.halfDayPeriod : null,
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
