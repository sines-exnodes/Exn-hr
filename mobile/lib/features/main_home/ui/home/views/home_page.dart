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

class _HomePageState extends State<HomePage> {
  int _currentNavIndex = 0;

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
        body: SafeArea(child: _buildHomeContent()),
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
                SizedBox(height: 20.w),
                _buildGreeting(state),
                SizedBox(height: 24.w),
                CheckInCard(state: state),
                SizedBox(height: 28.w),
                const QuickActions(),
                SizedBox(height: 28.w),
                const RecentActivity(),
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
    final greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              greeting,
              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
            ),
            Text(
              state.userName.isEmpty ? 'Employee' : state.userName,
              style: AppTextStyles.h3,
            ),
          ],
        ),
        Row(
          children: [
            IconButton(
              onPressed: () => context.push(AppRoutes.notifications),
              icon: Icon(
                Icons.notifications_outlined,
                color: AppColors.textPrimary,
                size: 24.sp,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
