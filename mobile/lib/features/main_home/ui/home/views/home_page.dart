import 'package:exn_hr/config/di.dart';
import 'package:exn_hr/core/routing/app_router.dart';
import 'package:exn_hr/core/themes/app_colors.dart';
import 'package:exn_hr/core/themes/app_text_styles.dart';
import 'package:exn_hr/features/main_home/ui/home/view_models/home_cubit.dart';
import 'package:exn_hr/features/main_home/ui/home/view_models/home_state.dart';
import 'package:exn_hr/features/main_home/ui/home/widgets/check_in_card.dart';
import 'package:exn_hr/features/main_home/ui/home/widgets/quick_actions.dart';
import 'package:exn_hr/features/main_home/ui/home/widgets/recent_activity.dart';
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
  late final Animation<double> _logoScale;

  final _navItems = const [
    AppBottomNavItem(
      label: 'Home',
      icon: Icons.home_outlined,
      activeIcon: Icons.home_rounded,
    ),
    AppBottomNavItem(
      label: 'Leave',
      icon: Icons.beach_access_outlined,
      activeIcon: Icons.beach_access_rounded,
    ),
    AppBottomNavItem(
      label: 'Overtime',
      icon: Icons.more_time_outlined,
      activeIcon: Icons.more_time_rounded,
    ),
    AppBottomNavItem(
      label: 'Profile',
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
    _logoScale = Tween<double>(begin: 0.9, end: 1).animate(
      CurvedAnimation(parent: _entranceCtrl, curve: Curves.easeOutBack),
    );
    _entranceCtrl.forward();
  }

  @override
  void dispose() {
    _entranceCtrl.dispose();
    super.dispose();
  }

  void _onNavTap(int index) {
    setState(() => _currentNavIndex = index);
    switch (index) {
      case 1:
        context.push(AppRoutes.leaveList);
        break;
      case 2:
        context.push(AppRoutes.otList);
        break;
      case 3:
        context.push(AppRoutes.profile);
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => getIt<HomeCubit>()..loadHomeData(),
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: FadeTransition(
            opacity: _entranceFade,
            child: SlideTransition(
              position: _entranceSlide,
              child: _buildHomeContent(),
            ),
          ),
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
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: EdgeInsets.symmetric(horizontal: 20.w),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(height: 16.w),
                ScaleTransition(
                  scale: _logoScale,
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Image.asset(
                        'assets/images/exn.png',
                        height: 48.w,
                        fit: BoxFit.contain,
                      ),
                      SizedBox(width: 12.w),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'EXN HRM',
                              style: AppTextStyles.h4.copyWith(
                                fontWeight: FontWeight.w700,
                                letterSpacing: -0.3,
                              ),
                            ),
                            Text(
                              'Quản lý nhân sự',
                              style: AppTextStyles.caption
                                  .copyWith(color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 20.w),
                _buildGreeting(state),
                SizedBox(height: 24.w),
                CheckInCard(state: state),
                SizedBox(height: 28.w),
                const QuickActions(),
                SizedBox(height: 28.w),
                RecentActivity(items: state.activities),
                SizedBox(height: 24.w),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildGreeting(HomeState state) {
    final hour = DateTime.now().hour;
    final greeting = hour < 12
        ? 'Chào buổi sáng'
        : hour < 17
            ? 'Chào buổi chiều'
            : 'Chào buổi tối';

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                greeting,
                style:
                    AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
              ),
              Text(
                state.userName.isEmpty ? 'Nhân viên' : state.userName,
                style: AppTextStyles.h3,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
        IconButton(
          onPressed: () => context.push(AppRoutes.notifications),
          icon: Icon(
            Icons.notifications_outlined,
            color: AppColors.textPrimary,
            size: 24.sp,
          ),
        ),
      ],
    );
  }
}
