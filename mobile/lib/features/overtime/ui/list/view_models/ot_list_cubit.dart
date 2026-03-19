import 'package:exn_hr/features/overtime/domain/usecases/get_ot_list_usecase.dart';
import 'package:exn_hr/features/overtime/ui/list/view_models/ot_list_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class OtListCubit extends Cubit<OtListState> {
  OtListCubit({required GetOtListUseCase getOtListUseCase})
      : _getOtListUseCase = getOtListUseCase,
        super(const OtListState()) {
    loadList();
  }

  final GetOtListUseCase _getOtListUseCase;

  Future<void> loadList() async {
    emit(state.copyWith(status: OtListStatus.loading));
    final result = await _getOtListUseCase();
    if (isClosed) return;
    result.fold(
      (error) => emit(state.copyWith(
        status: OtListStatus.failure,
        errorMessage: error.message,
      )),
      (requests) => emit(state.copyWith(
        status: OtListStatus.success,
        requests: requests,
      )),
    );
  }
}
