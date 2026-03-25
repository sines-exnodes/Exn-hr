import 'package:exn_hr/features/leave/domain/usecases/approve_leave_usecase.dart';
import 'package:exn_hr/features/leave/domain/usecases/get_leave_list_usecase.dart';
import 'package:exn_hr/features/leave/ui/approval/view_models/leave_approval_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class LeaveApprovalCubit extends Cubit<LeaveApprovalState> {
  LeaveApprovalCubit({
    required GetLeaveListUseCase getLeaveListUseCase,
    required ApproveLeaveUseCase approveLeaveUseCase,
  })  : _getLeaveListUseCase = getLeaveListUseCase,
        _approveLeaveUseCase = approveLeaveUseCase,
        super(const LeaveApprovalState()) {
    loadPendingRequests();
  }

  final GetLeaveListUseCase _getLeaveListUseCase;
  final ApproveLeaveUseCase _approveLeaveUseCase;

  Future<void> loadPendingRequests({bool silent = false}) async {
    if (!silent) {
      emit(state.copyWith(
        status: LeaveApprovalStatus.loading,
        errorMessage: null,
        clearActionLoading: true,
      ));
    }
    final result = await _getLeaveListUseCase(status: 'pending');
    if (isClosed) return;
    result.fold(
      (error) => emit(state.copyWith(
        status: LeaveApprovalStatus.failure,
        errorMessage: error.message,
        clearActionLoading: true,
      )),
      (requests) => emit(state.copyWith(
        status: LeaveApprovalStatus.success,
        requests: requests,
        clearActionLoading: true,
      )),
    );
  }

  Future<void> approve(int id) async {
    emit(state.copyWith(actionLoadingId: id, errorMessage: null));
    final result = await _approveLeaveUseCase(id, status: 'approved');
    if (isClosed) return;
    result.fold(
      (error) => emit(state.copyWith(
        status: LeaveApprovalStatus.failure,
        errorMessage: error.message,
        clearActionLoading: true,
      )),
      (_) => loadPendingRequests(silent: true),
    );
  }

  Future<void> reject(int id, {String? comment}) async {
    emit(state.copyWith(actionLoadingId: id, errorMessage: null));
    final result =
        await _approveLeaveUseCase(id, status: 'rejected', comment: comment);
    if (isClosed) return;
    result.fold(
      (error) => emit(state.copyWith(
        status: LeaveApprovalStatus.failure,
        errorMessage: error.message,
        clearActionLoading: true,
      )),
      (_) => loadPendingRequests(silent: true),
    );
  }
}
