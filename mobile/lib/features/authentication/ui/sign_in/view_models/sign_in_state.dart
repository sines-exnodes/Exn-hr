import 'package:equatable/equatable.dart';
import 'package:exn_hr/features/authentication/domain/entities/user.dart';

enum SignInStatus { initial, loading, success, failure }

class SignInState extends Equatable {
  const SignInState({
    this.status = SignInStatus.initial,
    this.user,
    this.errorMessage,
  });

  final SignInStatus status;
  final User? user;
  final String? errorMessage;

  SignInState copyWith({
    SignInStatus? status,
    User? user,
    String? errorMessage,
  }) {
    return SignInState(
      status: status ?? this.status,
      user: user ?? this.user,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, user, errorMessage];
}
