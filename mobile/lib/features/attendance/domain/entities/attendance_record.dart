import 'package:equatable/equatable.dart';

class AttendanceRecord extends Equatable {
  const AttendanceRecord({
    required this.id,
    required this.date,
    this.checkInTime,
    this.checkOutTime,
    this.totalHours,
    this.location,
    this.verificationMethod,
  });

  final String id;
  final String date;
  final String? checkInTime;
  final String? checkOutTime;
  final String? totalHours;
  final String? location;
  final String? verificationMethod;

  @override
  List<Object?> get props => [id, date, checkInTime, checkOutTime, totalHours];
}
