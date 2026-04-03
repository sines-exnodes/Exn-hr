import 'package:exn_hr/features/profile/domain/entities/profile.dart';
import 'package:exn_hr/features/profile/domain/usecases/update_profile_usecase.dart';
import 'package:exn_hr/features/profile/ui/edit/view_models/edit_profile_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class EditProfileCubit extends Cubit<EditProfileState> {
  EditProfileCubit({
    required UpdateProfileUseCase updateProfileUseCase,
    required Profile profile,
  })  : _updateProfileUseCase = updateProfileUseCase,
        super(EditProfileState(profile: profile));

  final UpdateProfileUseCase _updateProfileUseCase;

  Future<void> save({
    required String phone,
    required String permanentAddress,
    required String currentAddress,
    required String dob,
    required String gender,
    required String bankAccount,
    required String bankName,
    required String bankHolderName,
  }) async {
    final profile = state.profile;
    if (profile == null) return;

    emit(state.copyWith(status: EditProfileStatus.loading));

    final data = <String, dynamic>{};
    if (phone != (profile.phone ?? '')) data['phone'] = phone;
    if (permanentAddress != (profile.permanentAddress ?? '')) {
      data['permanent_address'] = permanentAddress;
    }
    if (currentAddress != (profile.currentAddress ?? '')) {
      data['current_address'] = currentAddress;
    }
    if (dob != (profile.dob ?? '')) data['dob'] = dob;
    if (gender != (profile.gender ?? '')) data['gender'] = gender;
    if (bankAccount != (profile.bankAccount ?? '')) data['bank_account'] = bankAccount;
    if (bankName != (profile.bankName ?? '')) data['bank_name'] = bankName;
    if (bankHolderName != (profile.bankHolderName ?? '')) data['bank_holder_name'] = bankHolderName;

    if (data.isEmpty) {
      emit(state.copyWith(status: EditProfileStatus.success));
      return;
    }

    final result = await _updateProfileUseCase(data: data);
    if (isClosed) return;
    result.fold(
      (error) => emit(state.copyWith(
        status: EditProfileStatus.failure,
        errorMessage: error.message,
      )),
      (updated) => emit(state.copyWith(
        status: EditProfileStatus.success,
        profile: updated,
      )),
    );
  }
}
