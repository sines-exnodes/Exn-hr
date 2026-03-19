import 'package:equatable/equatable.dart';
import 'package:exn_hr/features/overtime/domain/entities/ot_request.dart';

enum OtRequestStatus { initial, loading, success, failure }

class OtRequestState extends Equatable {
  const OtRequestState({
    this.status = OtRequestStatus.initial,
    this.request,
    this.errorMessage,
    this.date,
    this.startTime,
    this.endTime,
  });

  final OtRequestStatus status;
  final OtRequest? request;
  final String? errorMessage;
  final String? date;
  final String? startTime;
  final String? endTime;

  OtRequestState copyWith({
    OtRequestStatus? status,
    OtRequest? request,
    String? errorMessage,
    String? date,
    String? startTime,
    String? endTime,
  }) {
    return OtRequestState(
      status: status ?? this.status,
      request: request ?? this.request,
      errorMessage: errorMessage ?? this.errorMessage,
      date: date ?? this.date,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
    );
  }

  @override
  List<Object?> get props => [status, request, errorMessage, date, startTime, endTime];
}
