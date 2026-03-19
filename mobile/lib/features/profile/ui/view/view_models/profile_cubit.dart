import 'package:exn_hr/features/profile/domain/usecases/get_profile_usecase.dart';
import 'package:exn_hr/features/profile/ui/view/view_models/profile_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ProfileCubit extends Cubit<ProfileState> {
  ProfileCubit({required GetProfileUseCase getProfileUseCase})
      : _getProfileUseCase = getProfileUseCase,
        super(const ProfileState()) {
    loadProfile();
  }

  final GetProfileUseCase _getProfileUseCase;

  Future<void> loadProfile() async {
    emit(state.copyWith(status: ProfileStatus.loading));
    final result = await _getProfileUseCase();
    if (isClosed) return;
    result.fold(
      (error) => emit(state.copyWith(
        status: ProfileStatus.failure,
        errorMessage: error.message,
      )),
      (profile) => emit(state.copyWith(
        status: ProfileStatus.success,
        profile: profile,
      )),
    );
  }
}
