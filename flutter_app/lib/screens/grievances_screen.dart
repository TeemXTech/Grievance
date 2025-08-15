import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../models/user_model.dart';
import '../widgets/grievance_card.dart';
import 'add_grievance_screen.dart';

class GrievancesScreen extends StatefulWidget {
  const GrievancesScreen({super.key});

  @override
  State<GrievancesScreen> createState() => _GrievancesScreenState();
}

class _GrievancesScreenState extends State<GrievancesScreen> {
  String _selectedFilter = 'All';
  final List<String> _filters = ['All', 'Pending', 'In Progress', 'Resolved'];
  
  // Mock data - replace with API call
  final List<Grievance> _grievances = [
    Grievance(
      id: '1',
      trackingNumber: 'GRI-I-23-08012025',
      title: 'Road Repair Needed',
      description: 'Main road has multiple potholes causing accidents',
      category: 'Infrastructure',
      status: GrievanceStatus.PENDING,
      priority: Priority.HIGH,
      citizenName: 'Rajesh Kumar',
      citizenPhone: '+91-9876543210',
      location: 'Manthanani Village',
      createdAt: DateTime.now().subtract(const Duration(days: 2)),
      assignedTo: 'Field Officer Ramesh',
    ),
    Grievance(
      id: '2',
      trackingNumber: 'GRI-H-45-07012025',
      title: 'Water Supply Issue',
      description: 'Irregular water supply for past 2 weeks',
      category: 'Water',
      status: GrievanceStatus.IN_PROGRESS,
      priority: Priority.MEDIUM,
      citizenName: 'Sita Devi',
      citizenPhone: '+91-9876543211',
      location: 'Ramagundam',
      createdAt: DateTime.now().subtract(const Duration(days: 5)),
      assignedTo: 'PA Srinivas',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final filteredGrievances = _getFilteredGrievances();
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Grievances'),
        automaticallyImplyLeading: false,
      ),
      body: Column(
        children: [
          // Filter Chips
          Container(
            height: 60.h,
            padding: EdgeInsets.symmetric(horizontal: 16.w),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: _filters.length,
              itemBuilder: (context, index) {
                final filter = _filters[index];
                final isSelected = _selectedFilter == filter;
                
                return Padding(
                  padding: EdgeInsets.only(right: 8.w),
                  child: FilterChip(
                    label: Text(filter),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() {
                        _selectedFilter = filter;
                      });
                    },
                    backgroundColor: Colors.grey[200],
                    selectedColor: const Color(0xFF1E40AF).withOpacity(0.2),
                    checkmarkColor: const Color(0xFF1E40AF),
                  ),
                );
              },
            ),
          ),
          
          // Grievances List
          Expanded(
            child: filteredGrievances.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.assignment_outlined,
                          size: 64.sp,
                          color: Colors.grey[400],
                        ),
                        SizedBox(height: 16.h),
                        Text(
                          'No grievances found',
                          style: TextStyle(
                            fontSize: 18.sp,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: EdgeInsets.all(16.w),
                    itemCount: filteredGrievances.length,
                    itemBuilder: (context, index) {
                      return Padding(
                        padding: EdgeInsets.only(bottom: 16.h),
                        child: GrievanceCard(
                          grievance: filteredGrievances[index],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const AddGrievanceScreen(),
            ),
          );
        },
        backgroundColor: const Color(0xFF1E40AF),
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  List<Grievance> _getFilteredGrievances() {
    if (_selectedFilter == 'All') {
      return _grievances;
    }
    
    GrievanceStatus? status;
    switch (_selectedFilter) {
      case 'Pending':
        status = GrievanceStatus.PENDING;
        break;
      case 'In Progress':
        status = GrievanceStatus.IN_PROGRESS;
        break;
      case 'Resolved':
        status = GrievanceStatus.RESOLVED;
        break;
    }
    
    return _grievances.where((g) => g.status == status).toList();
  }
}