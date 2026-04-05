import 'package:exn_hr/config/di.dart';
import 'package:exn_hr/core/routing/app_router.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/features/main_home/ui/home/view_models/home_cubit.dart';
import 'package:exn_hr/features/main_home/ui/home/view_models/home_state.dart';
import 'package:exn_hr/features/main_home/ui/home/widgets/check_in_card.dart';
import 'package:exn_hr/features/main_home/ui/home/widgets/quick_actions.dart';
import 'package:exn_hr/features/main_home/ui/home/widgets/recent_activity.dart';
import 'package:exn_hr/features/main_home/ui/home/widgets/upcoming_milestones.dart';
import 'package:exn_hr/features/leave/ui/list/views/leave_list_page.dart';
import 'package:exn_hr/features/overtime/ui/list/views/ot_list_page.dart';
import 'package:exn_hr/features/profile/ui/view/views/profile_page.dart';
import 'package:exn_hr/shared/ui/widgets/app_bottom_nav.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> with SingleTickerProviderStateMixin {
  int _currentNavIndex = 0;
  late final AnimationController _entranceCtrl;
  late final Animation<double> _entranceFade;
  late final Animation<Offset> _entranceSlide;

  int _leaveListKey = 0;
  int _otListKey = 0;

  final _navItems = const [
    AppBottomNavItem(
      label: 'Trang chủ',
      icon: Icons.home_outlined,
      activeIcon: Icons.home_rounded,
    ),
    AppBottomNavItem(
      label: 'Nghỉ phép',
      icon: Icons.beach_access_outlined,
      activeIcon: Icons.beach_access_rounded,
    ),
    AppBottomNavItem(
      label: 'Làm thêm',
      icon: Icons.more_time_outlined,
      activeIcon: Icons.more_time_rounded,
    ),
    AppBottomNavItem(
      label: 'Cá nhân',
      icon: Icons.person_outline_rounded,
      activeIcon: Icons.person_rounded,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _entranceCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 880),
    );
    _entranceFade = CurvedAnimation(parent: _entranceCtrl, curve: Curves.easeOutCubic);
    _entranceSlide = Tween<Offset>(
      begin: const Offset(0, 0.028),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _entranceCtrl, curve: Curves.easeOutCubic));
    _entranceCtrl.forward();
  }

  @override
  void dispose() {
    _entranceCtrl.dispose();
    super.dispose();
  }

  void _onNavTap(int index) {
    setState(() => _currentNavIndex = index);
  }

  Future<void> _pushAndRefresh(String route) async {
    final result = await context.push<bool>(route);
    if (result == true && mounted) {
      context.read<HomeCubit>().loadHomeData();
      setState(() {
        if (route == AppRoutes.leaveRequest) _leaveListKey++;
        if (route == AppRoutes.otRequest) _otListKey++;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<HomeCubit>()..loadHomeData(),
      child: Scaffold(
        backgroundColor: AppColors.bgPage,
        body: IndexedStack(
          index: _currentNavIndex,
          children: [
            FadeTransition(
              opacity: _entranceFade,
              child: SlideTransition(
                position: _entranceSlide,
                child: _buildHomeContent(),
              ),
            ),
            LeaveListPage(key: ValueKey('leave_$_leaveListKey')),
            OtListPage(key: ValueKey('ot_$_otListKey')),
            const ProfilePage(),
          ],
        ),
        bottomNavigationBar: AppBottomNav(
          currentIndex: _currentNavIndex,
          onTap: _onNavTap,
          items: _navItems,
        ),
      ),
    );
  }

  Widget _buildHomeContent() {
    return BlocBuilder<HomeCubit, HomeState>(
      builder: (context, state) {
        return RefreshIndicator(
          onRefresh: () => context.read<HomeCubit>().loadHomeData(),
          color: AppColors.primary,
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              // Gradient header
              SliverToBoxAdapter(child: _buildGradientHeader(state)),
              // Content
              SliverPadding(
                padding: EdgeInsets.symmetric(horizontal: 20.w),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    SizedBox(height: 20.w),
                    CheckInCard(state: state),
                    SizedBox(height: 24.w),
                    QuickActions(onActionPush: _pushAndRefresh),
                    SizedBox(height: 24.w),
                    UpcomingMilestones(milestones: state.upcomingMilestones),
                    if (state.upcomingMilestones.isNotEmpty) SizedBox(height: 24.w),
                    RecentActivity(items: state.activities),
                    SizedBox(height: 24.w),
                  ]),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildGradientHeader(HomeState state) {
    final hour = DateTime.now().hour;
    final greeting = hour < 12
        ? 'Chào buổi sáng'
        : hour < 17
            ? 'Chào buổi chiều'
            : 'Chào buổi tối';

    return Container(
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 16.w,
        left: 20.w,
        right: 20.w,
        bottom: 24.w,
      ),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.gradientStart,
            AppColors.gradientEnd,
          ],
        ),
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(28.r),
          bottomRight: Radius.circular(28.r),
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.25),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top row: logo + notification
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 36.w,
                    height: 36.w,
                    decoration: BoxDecoration(
                      color: AppColors.glassWhite,
                      borderRadius: BorderRadius.circular(10.r),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(10.r),
                      child: Image.asset(
                        'assets/images/exn.png',
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),
                  SizedBox(width: 10.w),
                  Text(
                    'EXN HRM',
                    style: AppTextStyles.h4.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      letterSpacing: -0.3,
                    ),
                  ),
                ],
              ),
              GestureDetector(
                onTap: () => context.push(AppRoutes.notifications),
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Container(
                      width: 40.w,
                      height: 40.w,
                      decoration: BoxDecoration(
                        color: AppColors.glassWhite,
                        borderRadius: BorderRadius.circular(12.r),
                        border: Border.all(color: AppColors.glassBorder),
                      ),
                      child: Icon(
                        Icons.notifications_outlined,
                        color: Colors.white,
                        size: 22.sp,
                      ),
                    ),
                    if (state.unreadNotificationCount > 0)
                      Positioned(
                        top: -4.w,
                        right: -4.w,
                        child: Container(
                          width: 18.w,
                          height: 18.w,
                          decoration: const BoxDecoration(
                            color: AppColors.error,
                            shape: BoxShape.circle,
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            state.unreadNotificationCount > 99
                                ? '99+'
                                : '${state.unreadNotificationCount}',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 10.sp,
                              fontWeight: FontWeight.bold,
                              height: 1,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
          SizedBox(height: 20.w),
          // Greeting + avatar
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      greeting,
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: Colors.white.withValues(alpha: 0.8),
                      ),
                    ),
                    SizedBox(height: 4.w),
                    Text(
                      state.userName.isEmpty ? 'Nhân viên' : state.userName,
                      style: AppTextStyles.h2.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              Container(
                width: 52.w,
                height: 52.w,
                decoration: BoxDecoration(
                  color: AppColors.glassWhite,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.glassBorder, width: 2),
                ),
                child: Icon(
                  Icons.person_rounded,
                  color: Colors.white,
                  size: 28.sp,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
