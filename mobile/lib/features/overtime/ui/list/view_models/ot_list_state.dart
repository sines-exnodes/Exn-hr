import 'package:equatable/equatable.dart';
import 'package:exn_hr/features/overtime/domain/entities/ot_request.dart';

enum OtListStatus { initial, loading, success, failure }

class OtListState extends Equatable {
  const OtListState({
    this.status = OtListStatus.initial,
    this.requests = const [],
    this.errorMessage,
  });

  final OtListStatus status;
  final List<OtRequest> requests;
  final String? errorMessage;

  OtListState copyWith({
    OtListStatus? status,
    List<OtRequest>? requests,
    String? errorMessage,
  }) {
    return OtListState(
      status: status ?? this.status,
      requests: requests ?? this.requests,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, requests, errorMessage];
}
