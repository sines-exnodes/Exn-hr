import 'package:exn_hr/features/profile/domain/entities/profile.dart';
import 'package:exn_hr/features/profile/domain/repositories/profile_repository.dart';
import 'package:exn_hr/features/profile/domain/usecases/update_profile_usecase.dart';
import 'package:exn_hr/features/profile/ui/edit/view_models/edit_profile_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class EditProfileCubit extends Cubit<EditProfileState> {
  EditProfileCubit({
    required UpdateProfileUseCase updateProfileUseCase,
    required ProfileRepository profileRepository,
    required Profile profile,
  })  : _updateProfileUseCase = updateProfileUseCase,
        _profileRepository = profileRepository,
        super(EditProfileState(profile: profile));

  final UpdateProfileUseCase _updateProfileUseCase;
  final ProfileRepository _profileRepository;

  Future<String?> uploadFile(String filePath, String folder) async {
    final result = await _profileRepository.uploadFile(filePath: filePath, folder: folder);
    return result.fold((_) => null, (url) => url);
  }

  Future<void> save({
    required String phone,
    required String permanentAddress,
    required String currentAddress,
    required String dob,
    required String gender,
    required String bankAccount,
    required String bankName,
    required String bankHolderName,
    String? avatarLocalPath,
    String? idFrontLocalPath,
    String? idBackLocalPath,
  }) async {
    final profile = state.profile;
    if (profile == null) return;

    emit(state.copyWith(status: EditProfileStatus.loading));

    // Upload pending files first
    String? avatarUrl;
    String? idFrontUrl;
    String? idBackUrl;
    if (avatarLocalPath != null) {
      avatarUrl = await uploadFile(avatarLocalPath, 'avatars');
      if (avatarUrl == null) {
        emit(state.copyWith(status: EditProfileStatus.failure, errorMessage: 'Tải ảnh đại diện thất bại'));
        return;
      }
    }
    if (idFrontLocalPath != null) {
      idFrontUrl = await uploadFile(idFrontLocalPath, 'cccd');
      if (idFrontUrl == null) {
        emit(state.copyWith(status: EditProfileStatus.failure, errorMessage: 'Tải ảnh CCCD mặt trước thất bại'));
        return;
      }
    }
    if (idBackLocalPath != null) {
      idBackUrl = await uploadFile(idBackLocalPath, 'cccd');
      if (idBackUrl == null) {
        emit(state.copyWith(status: EditProfileStatus.failure, errorMessage: 'Tải ảnh CCCD mặt sau thất bại'));
        return;
      }
    }

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
    if (avatarUrl != null) data['avatar_url'] = avatarUrl;
    if (idFrontUrl != null) data['id_front_image'] = idFrontUrl;
    if (idBackUrl != null) data['id_back_image'] = idBackUrl;

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
