import 'package:equatable/equatable.dart';

class User extends Equatable {
  const User({
    required this.id,
    required this.email,
    required this.role,
    required this.isActive,
  });

  final int id;
  final String email;
  final String role;
  final bool isActive;

  @override
  List<Object?> get props => [id, email, role, isActive];
}
