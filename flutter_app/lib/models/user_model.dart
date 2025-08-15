class User {
  final String id;
  final String email;
  final String name;
  final UserRole role;
  final String? phone;
  final String? department;

  User({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    this.phone,
    this.department,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'].toString(),
      email: json['email'],
      name: json['name'],
      role: UserRole.values.firstWhere(
        (e) => e.toString().split('.').last == json['role'],
        orElse: () => UserRole.PUBLIC,
      ),
      phone: json['phone'],
      department: json['department'],
    );
  }
}

enum UserRole {
  ADMIN,
  MINISTER,
  PERSONAL_ASSISTANT,
  FIELD_TEAM,
  BACK_OFFICER,
  PUBLIC
}

class Grievance {
  final String id;
  final String trackingNumber;
  final String title;
  final String description;
  final String category;
  final GrievanceStatus status;
  final Priority priority;
  final String citizenName;
  final String? citizenPhone;
  final String location;
  final DateTime createdAt;
  final String? assignedTo;
  final List<String>? attachments;

  Grievance({
    required this.id,
    required this.trackingNumber,
    required this.title,
    required this.description,
    required this.category,
    required this.status,
    required this.priority,
    required this.citizenName,
    this.citizenPhone,
    required this.location,
    required this.createdAt,
    this.assignedTo,
    this.attachments,
  });

  factory Grievance.fromJson(Map<String, dynamic> json) {
    return Grievance(
      id: json['id'].toString(),
      trackingNumber: json['trackingNumber'],
      title: json['title'],
      description: json['description'],
      category: json['category'],
      status: GrievanceStatus.values.firstWhere(
        (e) => e.toString().split('.').last == json['status'],
        orElse: () => GrievanceStatus.PENDING,
      ),
      priority: Priority.values.firstWhere(
        (e) => e.toString().split('.').last == json['priority'],
        orElse: () => Priority.MEDIUM,
      ),
      citizenName: json['citizenName'],
      citizenPhone: json['citizenPhone'],
      location: json['location'],
      createdAt: DateTime.parse(json['createdAt']),
      assignedTo: json['assignedTo'],
      attachments: json['attachments']?.cast<String>(),
    );
  }
}

enum GrievanceStatus { PENDING, IN_PROGRESS, RESOLVED, CLOSED }
enum Priority { LOW, MEDIUM, HIGH, CRITICAL }