import 'package:exn_hr/features/profile/domain/usecases/change_password_usecase.dart';
import 'package:exn_hr/features/profile/ui/change_password/view_models/change_password_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ChangePasswordCubit extends Cubit<ChangePasswordState> {
  ChangePasswordCubit({required ChangePasswordUseCase changePasswordUseCase})
      : _changePasswordUseCase = changePasswordUseCase,
        super(const ChangePasswordState());

  final ChangePasswordUseCase _changePasswordUseCase;

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    emit(state.copyWith(status: ChangePasswordStatus.loading));
    final result = await _changePasswordUseCase(
      currentPassword: currentPassword,
      newPassword: newPassword,
    );
    if (isClosed) return;
    result.fold(
      (error) => emit(state.copyWith(
        status: ChangePasswordStatus.failure,
        errorMessage: error.message,
      )),
      (_) => emit(state.copyWith(status: ChangePasswordStatus.success)),
    );
  }
}
