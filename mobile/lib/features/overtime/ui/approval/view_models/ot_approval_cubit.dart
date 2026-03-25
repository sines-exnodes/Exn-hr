import 'package:exn_hr/features/overtime/domain/entities/ot_request.dart';
import 'package:exn_hr/features/overtime/domain/usecases/approve_overtime_usecase.dart';
import 'package:exn_hr/features/overtime/domain/usecases/get_ot_list_usecase.dart';
import 'package:exn_hr/features/overtime/ui/approval/view_models/ot_approval_state.dart';
import 'package:exn_hr/features/profile/domain/usecases/get_profile_usecase.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class OtApprovalCubit extends Cubit<OtApprovalState> {
  OtApprovalCubit({
    required GetProfileUseCase getProfileUseCase,
    required GetOtListUseCase getOtListUseCase,
    required ApproveOvertimeUseCase approveOvertimeUseCase,
  })  : _getProfileUseCase = getProfileUseCase,
        _getOtListUseCase = getOtListUseCase,
        _approveOvertimeUseCase = approveOvertimeUseCase,
        super(const OtApprovalState()) {
    loadPendingRequests();
  }

  final GetProfileUseCase _getProfileUseCase;
  final GetOtListUseCase _getOtListUseCase;
  final ApproveOvertimeUseCase _approveOvertimeUseCase;

  /// Đơn cần bước leader (chưa duyệt leader).
  static bool _needsLeader(OtRequest r) =>
      r.leaderStatus.toLowerCase() == 'pending';

  /// Đơn đã qua leader, chờ CEO.
  static bool _needsCeo(OtRequest r) =>
      r.leaderStatus.toLowerCase() == 'approved' &&
      r.ceoStatus.toLowerCase() == 'pending';

  static List<OtRequest> _filterForRole(String role, List<OtRequest> pending) {
    final r = role.toLowerCase();
    final needL = pending.where(_needsLeader).toList();
    final needC = pending.where(_needsCeo).toList();
    if (r == 'admin') {
      return [...needL, ...needC];
    }
    if (r == 'leader') {
      return needL;
    }
    if (r == 'ceo') {
      return needC;
    }
    return [];
  }

  bool _useLeaderApi(OtRequest item) => _needsLeader(item);

  Future<void> loadPendingRequests({bool silent = false}) async {
    if (!silent) {
      emit(state.copyWith(
        status: OtApprovalStatus.loading,
        errorMessage: null,
        clearActionLoading: true,
      ));
    }

    final profileRes = await _getProfileUseCase();
    var role = '';
    String? profileErr;
    profileRes.fold((e) => profileErr = e.message, (p) => role = p.role);
    if (profileErr != null) {
      if (isClosed) return;
      emit(state.copyWith(
        status: OtApprovalStatus.failure,
        errorMessage: profileErr,
        clearActionLoading: true,
      ));
      return;
    }

    final listRes =
        await _getOtListUseCase(page: 1, size: 100, status: 'pending');
    if (isClosed) return;

    listRes.fold(
      (error) => emit(state.copyWith(
        status: OtApprovalStatus.failure,
        errorMessage: error.message,
        clearActionLoading: true,
      )),
      (pending) {
        final filtered = _filterForRole(role, pending);
        emit(state.copyWith(
          status: OtApprovalStatus.success,
          requests: filtered,
          clearActionLoading: true,
        ));
      },
    );
  }

  Future<void> approve(int id) async {
    final idx = state.requests.indexWhere((e) => e.id == id);
    if (idx < 0) return;
    final item = state.requests[idx];

    emit(state.copyWith(actionLoadingId: id, errorMessage: null));
    final useLeader = _useLeaderApi(item);
    final result = useLeader
        ? await _approveOvertimeUseCase.leaderApprove(id, status: 'approved')
        : await _approveOvertimeUseCase.ceoApprove(id, status: 'approved');
    if (isClosed) return;
    result.fold(
      (error) => emit(state.copyWith(
        status: OtApprovalStatus.failure,
        errorMessage: error.message,
        clearActionLoading: true,
      )),
      (_) => loadPendingRequests(silent: true),
    );
  }

  Future<void> reject(int id, {String? comment}) async {
    final idx = state.requests.indexWhere((e) => e.id == id);
    if (idx < 0) return;
    final item = state.requests[idx];

    emit(state.copyWith(actionLoadingId: id, errorMessage: null));
    final useLeader = _useLeaderApi(item);
    final result = useLeader
        ? await _approveOvertimeUseCase.leaderApprove(
            id,
            status: 'rejected',
            comment: comment,
          )
        : await _approveOvertimeUseCase.ceoApprove(
            id,
            status: 'rejected',
            comment: comment,
          );
    if (isClosed) return;
    result.fold(
      (error) => emit(state.copyWith(
        status: OtApprovalStatus.failure,
        errorMessage: error.message,
        clearActionLoading: true,
      )),
      (_) => loadPendingRequests(silent: true),
    );
  }
}
