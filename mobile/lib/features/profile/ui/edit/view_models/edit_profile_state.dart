import 'package:equatable/equatable.dart';
import 'package:exn_hr/features/profile/domain/entities/profile.dart';

enum EditProfileStatus { initial, loading, success, failure }

class EditProfileState extends Equatable {
  const EditProfileState({
    this.status = EditProfileStatus.initial,
    this.profile,
    this.errorMessage,
  });

  final EditProfileStatus status;
  final Profile? profile;
  final String? errorMessage;

  EditProfileState copyWith({
    EditProfileStatus? status,
    Profile? profile,
    String? errorMessage,
  }) {
    return EditProfileState(
      status: status ?? this.status,
      profile: profile ?? this.profile,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, profile, errorMessage];
}
