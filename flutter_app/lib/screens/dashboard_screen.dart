import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../models/user_model.dart';
import 'grievances_screen.dart';
import 'qr_scanner_screen.dart';
import 'profile_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthService>(
      builder: (context, authService, child) {
        final user = authService.user!;
        
        return Scaffold(
          appBar: AppBar(
            title: Text(_getAppBarTitle(user.role)),
            actions: [
              IconButton(
                icon: const Icon(Icons.qr_code_scanner),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const QRScannerScreen()),
                  );
                },
              ),
            ],
          ),
          body: _buildBody(user),
          bottomNavigationBar: BottomNavigationBar(
            currentIndex: _currentIndex,
            onTap: (index) => setState(() => _currentIndex = index),
            type: BottomNavigationBarType.fixed,
            items: _getBottomNavItems(user.role),
          ),
        );
      },
    );
  }

  Widget _buildBody(User user) {
    switch (_currentIndex) {
      case 0:
        return _buildDashboard(user);
      case 1:
        return const GrievancesScreen();
      case 2:
        return const Center(child: Text('Analytics'));
      case 3:
        return const ProfileScreen();
      default:
        return _buildDashboard(user);
    }
  }

  Widget _buildDashboard(User user) {
    return SingleChildScrollView(
      padding: EdgeInsets.all(16.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Welcome Card
          Container(
            width: double.infinity,
            padding: EdgeInsets.all(20.w),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1E40AF), Color(0xFF7C3AED)],
              ),
              borderRadius: BorderRadius.circular(16.r),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Welcome, ${user.name}',
                  style: TextStyle(
                    fontSize: 24.sp,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                SizedBox(height: 8.h),
                Text(
                  _getRoleDescription(user.role),
                  style: TextStyle(
                    fontSize: 16.sp,
                    color: Colors.white70,
                  ),
                ),
              ],
            ),
          ),
          SizedBox(height: 24.h),

          // Quick Actions
          Text(
            'Quick Actions',
            style: TextStyle(
              fontSize: 20.sp,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 16.h),
          
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            crossAxisSpacing: 16.w,
            mainAxisSpacing: 16.h,
            children: _getQuickActions(user.role),
          ),
          
          SizedBox(height: 24.h),

          // Stats Cards
          Text(
            'Overview',
            style: TextStyle(
              fontSize: 20.sp,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 16.h),
          
          Row(
            children: [
              Expanded(
                child: _buildStatCard('Total Grievances', '1,247', Icons.assignment, Colors.blue),
              ),
              SizedBox(width: 16.w),
              Expanded(
                child: _buildStatCard('Resolved', '1,089', Icons.check_circle, Colors.green),
              ),
            ],
          ),
          SizedBox(height: 16.h),
          Row(
            children: [
              Expanded(
                child: _buildStatCard('Pending', '158', Icons.pending, Colors.orange),
              ),
              SizedBox(width: 16.w),
              Expanded(
                child: _buildStatCard('This Month', '89', Icons.calendar_today, Colors.purple),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12.r),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24.sp),
          SizedBox(height: 8.h),
          Text(
            value,
            style: TextStyle(
              fontSize: 24.sp,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            title,
            style: TextStyle(
              fontSize: 12.sp,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _getQuickActions(UserRole role) {
    final actions = <Widget>[
      _buildActionCard('View Grievances', Icons.list, () {
        setState(() => _currentIndex = 1);
      }),
      _buildActionCard('Scan QR Code', Icons.qr_code_scanner, () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const QRScannerScreen()),
        );
      }),
    ];

    if (role == UserRole.ADMIN || role == UserRole.BACK_OFFICER) {
      actions.add(_buildActionCard('Add Grievance', Icons.add, () {}));
      actions.add(_buildActionCard('Reports', Icons.analytics, () {}));
    }

    return actions;
  }

  Widget _buildActionCard(String title, IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(16.w),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12.r),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 32.sp, color: const Color(0xFF1E40AF)),
            SizedBox(height: 8.h),
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14.sp,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getAppBarTitle(UserRole role) {
    switch (role) {
      case UserRole.MINISTER:
        return 'Minister Dashboard';
      case UserRole.PERSONAL_ASSISTANT:
        return 'PA Dashboard';
      case UserRole.FIELD_TEAM:
        return 'Field Dashboard';
      case UserRole.BACK_OFFICER:
        return 'Back Office';
      case UserRole.ADMIN:
        return 'Admin Dashboard';
      default:
        return 'Dashboard';
    }
  }

  String _getRoleDescription(UserRole role) {
    switch (role) {
      case UserRole.MINISTER:
        return 'Executive Overview & Decision Making';
      case UserRole.PERSONAL_ASSISTANT:
        return 'Administrative Support & Coordination';
      case UserRole.FIELD_TEAM:
        return 'Ground Operations & Implementation';
      case UserRole.BACK_OFFICER:
        return 'Data Management & Processing';
      case UserRole.ADMIN:
        return 'System Administration & Control';
      default:
        return 'Citizen Services Portal';
    }
  }

  List<BottomNavigationBarItem> _getBottomNavItems(UserRole role) {
    return [
      const BottomNavigationBarItem(
        icon: Icon(Icons.dashboard),
        label: 'Dashboard',
      ),
      const BottomNavigationBarItem(
        icon: Icon(Icons.assignment),
        label: 'Grievances',
      ),
      const BottomNavigationBarItem(
        icon: Icon(Icons.analytics),
        label: 'Analytics',
      ),
      const BottomNavigationBarItem(
        icon: Icon(Icons.person),
        label: 'Profile',
      ),
    ];
  }
}