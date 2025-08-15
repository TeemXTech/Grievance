import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:intl/intl.dart';
import '../models/user_model.dart';

class GrievanceDetailScreen extends StatefulWidget {
  final String grievanceId;
  final Grievance? grievance;

  const GrievanceDetailScreen({
    super.key,
    required this.grievanceId,
    this.grievance,
  });

  @override
  State<GrievanceDetailScreen> createState() => _GrievanceDetailScreenState();
}

class _GrievanceDetailScreenState extends State<GrievanceDetailScreen> {
  Grievance? _grievance;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _grievance = widget.grievance;
    if (_grievance == null) {
      _loadGrievance();
    } else {
      _isLoading = false;
    }
  }

  Future<void> _loadGrievance() async {
    try {
      // TODO: Implement API call to load grievance by ID
      await Future.delayed(const Duration(seconds: 1)); // Simulate API call
      
      // Mock data for now
      setState(() {
        _grievance = Grievance(
          id: widget.grievanceId,
          trackingNumber: 'GRI-${widget.grievanceId}',
          title: 'Sample Grievance',
          description: 'This is a sample grievance loaded from QR code',
          category: 'Infrastructure',
          status: GrievanceStatus.PENDING,
          priority: Priority.MEDIUM,
          citizenName: 'John Doe',
          citizenPhone: '+91-9876543210',
          location: 'Sample Location',
          createdAt: DateTime.now().subtract(const Duration(days: 1)),
          assignedTo: 'Field Officer',
        );
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load grievance: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Grievance Details'),
        ),
        body: const Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (_grievance == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Grievance Details'),
        ),
        body: const Center(
          child: Text('Grievance not found'),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Grievance Details'),
        backgroundColor: const Color(0xFF1E40AF),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Card
            Container(
              width: double.infinity,
              padding: EdgeInsets.all(16.w),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1E40AF), Color(0xFF7C3AED)],
                ),
                borderRadius: BorderRadius.circular(12.r),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _grievance!.title,
                    style: TextStyle(
                      fontSize: 20.sp,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  SizedBox(height: 8.h),
                  Text(
                    _grievance!.trackingNumber,
                    style: TextStyle(
                      fontSize: 16.sp,
                      color: Colors.white70,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  SizedBox(height: 8.h),
                  Row(
                    children: [
                      _buildStatusChip(),
                      SizedBox(width: 8.w),
                      _buildPriorityChip(),
                    ],
                  ),
                ],
              ),
            ),
            
            SizedBox(height: 24.h),

            // Details Section
            _buildDetailSection('Description', _grievance!.description),
            SizedBox(height: 16.h),
            
            _buildDetailSection('Category', _grievance!.category),
            SizedBox(height: 16.h),
            
            _buildDetailSection('Location', _grievance!.location),
            SizedBox(height: 16.h),
            
            _buildDetailSection('Citizen Name', _grievance!.citizenName),
            SizedBox(height: 16.h),
            
            if (_grievance!.citizenPhone != null)
              _buildDetailSection('Phone', _grievance!.citizenPhone!),
            SizedBox(height: 16.h),
            
            _buildDetailSection(
              'Created Date', 
              DateFormat('MMM dd, yyyy - hh:mm a').format(_grievance!.createdAt)
            ),
            SizedBox(height: 16.h),
            
            if (_grievance!.assignedTo != null)
              _buildDetailSection('Assigned To', _grievance!.assignedTo!),
            
            if (_grievance!.attachments != null && _grievance!.attachments!.isNotEmpty) ...[
              SizedBox(height: 24.h),
              Text(
                'Attachments',
                style: TextStyle(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 12.h),
              Wrap(
                spacing: 8.w,
                runSpacing: 8.h,
                children: _grievance!.attachments!.map((attachment) {
                  return Container(
                    padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
                    decoration: BoxDecoration(
                      color: Colors.blue.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20.r),
                      border: Border.all(color: Colors.blue.withOpacity(0.3)),
                    ),
                    child: Text(
                      attachment,
                      style: TextStyle(
                        fontSize: 12.sp,
                        color: Colors.blue[700],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
            
            SizedBox(height: 32.h),

            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      // TODO: Implement update status
                    },
                    icon: const Icon(Icons.update),
                    label: const Text('Update Status'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.orange,
                      padding: EdgeInsets.symmetric(vertical: 12.h),
                    ),
                  ),
                ),
                SizedBox(width: 16.w),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      // TODO: Implement add comment
                    },
                    icon: const Icon(Icons.comment),
                    label: const Text('Add Comment'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1E40AF),
                      padding: EdgeInsets.symmetric(vertical: 12.h),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailSection(String title, String content) {
    return Container(
      width: double.infinity,
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
          Text(
            title,
            style: TextStyle(
              fontSize: 14.sp,
              fontWeight: FontWeight.w600,
              color: Colors.grey[600],
            ),
          ),
          SizedBox(height: 8.h),
          Text(
            content,
            style: TextStyle(
              fontSize: 16.sp,
              color: Colors.grey[800],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusChip() {
    Color color;
    String text;
    
    switch (_grievance!.status) {
      case GrievanceStatus.PENDING:
        color = Colors.orange;
        text = 'Pending';
        break;
      case GrievanceStatus.IN_PROGRESS:
        color = Colors.blue;
        text = 'In Progress';
        break;
      case GrievanceStatus.RESOLVED:
        color = Colors.green;
        text = 'Resolved';
        break;
      case GrievanceStatus.CLOSED:
        color = Colors.grey;
        text = 'Closed';
        break;
    }
    
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20.r),
        border: Border.all(color: Colors.white.withOpacity(0.3)),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 12.sp,
          color: Colors.white,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildPriorityChip() {
    Color color;
    String text;
    
    switch (_grievance!.priority) {
      case Priority.LOW:
        color = Colors.green;
        text = 'Low';
        break;
      case Priority.MEDIUM:
        color = Colors.orange;
        text = 'Medium';
        break;
      case Priority.HIGH:
        color = Colors.red;
        text = 'High';
        break;
      case Priority.CRITICAL:
        color = Colors.red[900]!;
        text = 'Critical';
        break;
    }
    
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20.r),
        border: Border.all(color: Colors.white.withOpacity(0.3)),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 12.sp,
          color: Colors.white,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}