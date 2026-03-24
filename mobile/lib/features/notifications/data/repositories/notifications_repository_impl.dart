import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import 'package:exn_hr/core/network/api/api_client.dart';
import 'package:exn_hr/core/network/api/api_endpoints.dart';
import 'package:exn_hr/features/notifications/data/mappers/notification_mapper.dart';
import 'package:exn_hr/features/notifications/data/models/notification_model.dart';
import 'package:exn_hr/features/notifications/domain/entities/app_notification.dart';
import 'package:exn_hr/features/notifications/domain/repositories/notifications_repository.dart';
import 'package:exn_hr/shared/domain/entities/api_error.dart';

class NotificationsRepositoryImpl implements NotificationsRepository {
  NotificationsRepositoryImpl({required ApiClient apiClient}) : _apiClient = apiClient;
  final ApiClient _apiClient;

  @override
  Future<Either<ApiError, List<AppNotification>>> getNotifications({int page = 1, int size = 20, String? type, bool? isRead}) async {
    try {
      final response = await _apiClient.get(ApiEndpoints.notifications, queryParameters: {'page': page, 'size': size, if (type != null) 'type': type, if (isRead != null) 'is_read': isRead});
      final items = ((response.data as Map<String, dynamic>)['data'] as List<dynamic>? ?? []).map((e) => NotificationModel.fromJson(e as Map<String, dynamic>).toEntity()).toList();
      return Right(items);
    } on DioException catch (e) { return Left(ApiError.fromDioError(e)); } catch (e) { return Left(ApiError.unknown()); }
  }

  @override
  Future<Either<ApiError, int>> getUnreadCount() async {
    try {
      final response = await _apiClient.get(ApiEndpoints.notificationsUnreadCount);
      final data = (response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
      return Right(data['count'] as int);
    } on DioException catch (e) { return Left(ApiError.fromDioError(e)); } catch (e) { return Left(ApiError.unknown()); }
  }

  @override
  Future<Either<ApiError, void>> markAsRead(int id) async {
    try {
      await _apiClient.patch(ApiEndpoints.notificationMarkRead(id));
      return const Right(null);
    } on DioException catch (e) { return Left(ApiError.fromDioError(e)); } catch (e) { return Left(ApiError.unknown()); }
  }

  @override
  Future<Either<ApiError, void>> markAllAsRead() async {
    try {
      await _apiClient.patch(ApiEndpoints.notificationsReadAll);
      return const Right(null);
    } on DioException catch (e) { return Left(ApiError.fromDioError(e)); } catch (e) { return Left(ApiError.unknown()); }
  }
}
