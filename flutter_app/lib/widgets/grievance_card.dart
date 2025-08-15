import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:intl/intl.dart';
import '../models/user_model.dart';
import '../screens/grievance_detail_screen.dart';

class GrievanceCard extends StatelessWidget {
  final Grievance grievance;

  const GrievanceCard({
    super.key,
    required this.grievance,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => GrievanceDetailScreen(
              grievanceId: grievance.id,
              grievance: grievance,
            ),
          ),
        );
      },
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
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    grievance.title,
                    style: TextStyle(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                SizedBox(width: 8.w),
                _buildStatusChip(),
              ],
            ),
            
            SizedBox(height: 8.h),
            
            // Tracking Number
            Text(
              grievance.trackingNumber,
              style: TextStyle(
                fontSize: 12.sp,
                color: const Color(0xFF1E40AF),
                fontWeight: FontWeight.w600,
              ),
            ),
            
            SizedBox(height: 8.h),
            
            // Description
            Text(
              grievance.description,
              style: TextStyle(
                fontSize: 14.sp,
                color: Colors.grey[600],
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            
            SizedBox(height: 12.h),
            
            // Details Row
            Row(
              children: [
                Expanded(
                  child: _buildDetailItem(
                    Icons.person_outline,
                    grievance.citizenName,
                  ),
                ),
                Expanded(
                  child: _buildDetailItem(
                    Icons.location_on_outlined,
                    grievance.location,
                  ),
                ),
              ],
            ),
            
            SizedBox(height: 8.h),
            
            Row(
              children: [
                Expanded(
                  child: _buildDetailItem(
                    Icons.category_outlined,
                    grievance.category,
                  ),
                ),
                Expanded(
                  child: _buildDetailItem(
                    Icons.access_time,
                    DateFormat('MMM dd, yyyy').format(grievance.createdAt),
                  ),
                ),
              ],
            ),
            
            if (grievance.assignedTo != null) ...[
              SizedBox(height: 8.h),
              _buildDetailItem(
                Icons.assignment_ind_outlined,
                'Assigned to: ${grievance.assignedTo}',
              ),
            ],
            
            // Priority Badge
            SizedBox(height: 12.h),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildPriorityChip(),
                Icon(
                  Icons.arrow_forward_ios,
                  size: 16.sp,
                  color: Colors.grey[400],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusChip() {
    Color color;
    String text;
    
    switch (grievance.status) {
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
      padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12.r),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 12.sp,
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildPriorityChip() {
    Color color;
    String text;
    
    switch (grievance.priority) {
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
      padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 12.sp,
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildDetailItem(IconData icon, String text) {
    return Row(
      children: [
        Icon(
          icon,
          size: 16.sp,
          color: Colors.grey[500],
        ),
        SizedBox(width: 4.w),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              fontSize: 12.sp,
              color: Colors.grey[600],
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}