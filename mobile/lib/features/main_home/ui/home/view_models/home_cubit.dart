import 'package:exn_hr/features/attendance/domain/entities/attendance_record.dart';
import 'package:exn_hr/features/attendance/domain/usecases/get_attendance_history_usecase.dart';
import 'package:exn_hr/features/leave/domain/entities/leave_request.dart';
import 'package:exn_hr/features/leave/domain/usecases/get_leave_list_usecase.dart';
import 'package:exn_hr/features/main_home/ui/home/models/home_activity_preview.dart';
import 'package:exn_hr/features/main_home/ui/home/view_models/home_state.dart';
import 'package:exn_hr/features/overtime/domain/entities/ot_request.dart';
import 'package:exn_hr/features/overtime/domain/usecases/get_ot_list_usecase.dart';
import 'package:exn_hr/features/profile/domain/usecases/get_profile_usecase.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

class HomeCubit extends Cubit<HomeState> {
  HomeCubit({
    required GetAttendanceHistoryUseCase getAttendanceHistoryUseCase,
    required GetProfileUseCase getProfileUseCase,
    required GetLeaveListUseCase getLeaveListUseCase,
    required GetOtListUseCase getOtListUseCase,
  })  : _getAttendanceHistoryUseCase = getAttendanceHistoryUseCase,
        _getProfileUseCase = getProfileUseCase,
        _getLeaveListUseCase = getLeaveListUseCase,
        _getOtListUseCase = getOtListUseCase,
        super(const HomeState());

  final GetAttendanceHistoryUseCase _getAttendanceHistoryUseCase;
  final GetProfileUseCase _getProfileUseCase;
  final GetLeaveListUseCase _getLeaveListUseCase;
  final GetOtListUseCase _getOtListUseCase;

  Future<void> loadHomeData() async {
    emit(state.copyWith(
      status: HomeStatus.loading,
      errorMessage: null,
      setAttendanceWarning: true,
      attendanceWarning: null,
    ));

    final todayStr = DateFormat('yyyy-MM-dd').format(DateTime.now());

    var userName = '';
    final profileRes = await _getProfileUseCase();
    profileRes.fold((_) {}, (p) => userName = p.fullName);

    String? attWarn;
    AttendanceRecord? todayRecord;
    final attRes = await _getAttendanceHistoryUseCase(
      page: 1,
      size: 20,
      startDate: todayStr,
      endDate: todayStr,
    );
    attRes.fold((e) => attWarn = e.message, (list) {
      AttendanceRecord? match;
      for (final r in list) {
        final t = r.checkInTime;
        if (t != null && t.startsWith(todayStr)) {
          match = r;
          break;
        }
      }
      todayRecord = match ?? (list.isNotEmpty ? list.first : null);
    });

    final leaveRes = await _getLeaveListUseCase(page: 1, size: 8);
    final otRes = await _getOtListUseCase(page: 1, size: 8);
    final leaves = leaveRes.fold((_) => <LeaveRequest>[], (l) => l);
    final ots = otRes.fold((_) => <OtRequest>[], (o) => o);
    final activities = _buildActivityPreviews(leaves, ots);

    var todayHours = '0h 0m';
    if (todayRecord?.checkInTime != null && todayRecord?.checkOutTime != null) {
      try {
        final inDt = DateTime.parse(todayRecord!.checkInTime!);
        final outDt = DateTime.parse(todayRecord.checkOutTime!);
        final diff = outDt.difference(inDt);
        todayHours = '${diff.inHours}h ${diff.inMinutes.remainder(60)}m';
      } catch (_) {}
    }

    final isCheckedIn =
        todayRecord?.checkOutTime == null && todayRecord?.checkInTime != null;

    if (isClosed) return;
    emit(state.copyWith(
      status: HomeStatus.success,
      userName: userName,
      isCheckedIn: isCheckedIn,
      checkInTime: _formatCheckInDisplay(todayRecord?.checkInTime),
      todayHours: todayHours,
      activities: activities,
      setAttendanceWarning: true,
      attendanceWarning: attWarn,
    ));
  }

  String _formatCheckInDisplay(String? iso) {
    if (iso == null || iso.isEmpty) return '--:--';
    try {
      final d = DateTime.parse(iso);
      return DateFormat('HH:mm').format(d.toLocal());
    } catch (_) {
      return '--:--';
    }
  }

  List<HomeActivityPreview> _buildActivityPreviews(
    List<LeaveRequest> leaves,
    List<OtRequest> ots,
  ) {
    final combined = <({String sort, HomeActivityPreview p})>[];
    for (final r in leaves) {
      combined.add((
        sort: r.startDate,
        p: HomeActivityPreview(
          title: 'Nghỉ phép',
          subtitle: '${r.type} · ${r.overallStatus}',
          timeLabel: r.startDate,
          icon: Icons.beach_access_rounded,
          color: const Color(0xFF8B5CF6),
        ),
      ));
    }
    for (final o in ots) {
      combined.add((
        sort: o.date,
        p: HomeActivityPreview(
          title: 'Làm thêm (OT)',
          subtitle: '${o.hours}h · ${o.overallStatus}',
          timeLabel: o.date,
          icon: Icons.more_time_rounded,
          color: const Color(0xFFF59E0B),
        ),
      ));
    }
    combined.sort((a, b) => b.sort.compareTo(a.sort));
    return combined.take(6).map((e) => e.p).toList();
  }
}
