class UserModel {
  const UserModel({
    required this.id,
    required this.email,
    required this.role,
    required this.isActive,
  });

  final int id;
  final String email;
  final String role;
  final bool isActive;

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as int,
      email: json['email'] as String,
      role: json['role'] as String? ?? 'employee',
      isActive: json['is_active'] as bool? ?? true,
    );
  }
}
