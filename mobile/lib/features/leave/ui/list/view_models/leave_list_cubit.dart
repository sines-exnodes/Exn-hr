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

  Future<void> loadList({String? status}) async {
    emit(state.copyWith(status: LeaveListStatus.loading));
    final result = await _getLeaveListUseCase(status: status);
    if (isClosed) return;
    result.fold(
      (error) => emit(state.copyWith(
        status: LeaveListStatus.failure,
        errorMessage: error.message,
      )),
      (requests) => emit(state.copyWith(
        status: LeaveListStatus.success,
        requests: requests,
      )),
    );
  }
}
