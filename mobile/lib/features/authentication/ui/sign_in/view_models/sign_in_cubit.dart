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
      (user) async {
        // Token is already stored by the repository interceptor
        // We need to get it from the response — for now store user id and role
        await _secureStorage.saveUserId(user.id);
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
