class AttendanceModel {
  const AttendanceModel({
    required this.id,
    required this.employeeId,
    this.checkInTime,
    this.checkOutTime,
    this.gpsLat,
    this.gpsLng,
    this.wifiSsid,
    this.status,
  });

  final int id;
  final int employeeId;
  final String? checkInTime;
  final String? checkOutTime;
  final double? gpsLat;
  final double? gpsLng;
  final String? wifiSsid;
  final String? status;

  factory AttendanceModel.fromJson(Map<String, dynamic> json) {
    return AttendanceModel(
      id: json['id'] as int,
      employeeId: json['employee_id'] as int,
      checkInTime: json['check_in_time'] as String?,
      checkOutTime: json['check_out_time'] as String?,
      gpsLat: (json['gps_lat'] as num?)?.toDouble(),
      gpsLng: (json['gps_lng'] as num?)?.toDouble(),
      wifiSsid: json['wifi_ssid'] as String?,
      status: json['status'] as String?,
    );
  }
}
