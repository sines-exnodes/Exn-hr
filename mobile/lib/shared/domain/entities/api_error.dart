import 'package:equatable/equatable.dart';

class ApiError extends Equatable {
  const ApiError({
    required this.message,
    this.code,
    this.statusCode,
  });

  final String message;
  final String? code;
  final int? statusCode;

  factory ApiError.fromDioError(dynamic error) {
    if (error?.response != null) {
      final data = error.response?.data;
      if (data is Map<String, dynamic>) {
        return ApiError(
          message: data['error'] as String? ?? 'An error occurred',
          code: data['code'] as String?,
          statusCode: error.response?.statusCode as int?,
        );
      }
      return ApiError(
        message: 'Request failed',
        statusCode: error.response?.statusCode as int?,
      );
    }
    return const ApiError(message: 'Network error. Please check your connection.');
  }

  factory ApiError.unknown() {
    return const ApiError(message: 'An unexpected error occurred');
  }

  @override
  List<Object?> get props => [message, code, statusCode];
}
