import 'package:exn_hr/features/profile/data/models/profile_model.dart';
import 'package:exn_hr/features/profile/domain/entities/profile.dart';

extension ProfileMapper on ProfileModel {
  Profile toEntity() {
    return Profile(
      id: id,
      email: email,
      fullName: fullName ?? '',
      role: role ?? 'employee',
      phone: phone,
      department: department,
      teamId: teamId,
      teamName: teamName,
      avatarUrl: avatarUrl,
      dateOfBirth: dateOfBirth,
      joinDate: joinDate,
      address: address,
    );
  }
}
