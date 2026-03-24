import 'package:exn_hr/core/storage/secure_storage.dart';
import 'package:exn_hr/features/authentication/domain/usecases/sign_in_usecase.dart';
import 'package:exn_hr/features/authentication/ui/sign_in/view_models/sign_in_state.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class SignInCubit extends Cubit<SignInState> {
  SignInCubit({
    required SignInUseCase signInUseCase,
    required SecureStorage secureStorage,
  })  : _signInUseCase = signInUseCase,
        _secureStorage = secureStorage,
        super(const SignInState());

  final SignInUseCase _signInUseCase;
  final SecureStorage _secureStorage;

  Future<void> signIn({required String email, required String password}) async {
    emit(state.copyWith(status: SignInStatus.loading));

    final result = await _signInUseCase(email: email, password: password);

    if (isClosed) return;

    result.fold(
      (error) => emit(state.copyWith(
        status: SignInStatus.failure,
        errorMessage: error.message,
      )),
      (tuple) async {
        final token = tuple.$1;
        final user = tuple.$2;
        await _secureStorage.saveAccessToken(token);
        await _secureStorage.saveUserId(user.id.toString());
        await _secureStorage.saveUserRole(user.role);
        if (!isClosed) {
          emit(state.copyWith(status: SignInStatus.success, user: user));
        }
      },
    );
  }

  void reset() {
    emit(const SignInState());
  }
}
