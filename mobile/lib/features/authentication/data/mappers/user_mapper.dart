import 'package:exn_hr/features/authentication/data/models/user_model.dart';
import 'package:exn_hr/features/authentication/domain/entities/user.dart';

extension UserMapper on UserModel {
  User toEntity() {
    return User(id: id, email: email, role: role, isActive: isActive);
  }
}
