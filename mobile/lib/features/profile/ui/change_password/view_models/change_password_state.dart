import 'package:equatable/equatable.dart';

enum ChangePasswordStatus { initial, loading, success, failure }

class ChangePasswordState extends Equatable {
  const ChangePasswordState({
    this.status = ChangePasswordStatus.initial,
    this.errorMessage,
  });

  final ChangePasswordStatus status;
  final String? errorMessage;

  ChangePasswordState copyWith({
    ChangePasswordStatus? status,
    String? errorMessage,
  }) {
    return ChangePasswordState(
      status: status ?? this.status,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, errorMessage];
}
