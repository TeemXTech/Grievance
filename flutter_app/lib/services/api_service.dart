import 'package:dio/dio.dart';
import '../models/user_model.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:3000/api';
  static final Dio _dio = Dio();

  static Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _dio.post(
        '$baseUrl/auth/signin',
        data: {'email': email, 'password': password},
      );
      return response.data;
    } catch (e) {
      throw Exception('Login failed');
    }
  }

  static Future<Map<String, dynamic>> getProfile(String token) async {
    try {
      final response = await _dio.get(
        '$baseUrl/auth/profile',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return response.data;
    } catch (e) {
      throw Exception('Failed to get profile');
    }
  }

  static Future<List<Grievance>> getGrievances(String token) async {
    try {
      final response = await _dio.get(
        '$baseUrl/grievances',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return (response.data as List)
          .map((json) => Grievance.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to get grievances');
    }
  }

  static Future<Grievance> createGrievance(String token, Map<String, dynamic> data) async {
    try {
      final response = await _dio.post(
        '$baseUrl/grievances',
        data: data,
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return Grievance.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to create grievance');
    }
  }

  static Future<Grievance> updateGrievanceStatus(
    String token, 
    String id, 
    GrievanceStatus status
  ) async {
    try {
      final response = await _dio.put(
        '$baseUrl/grievances/$id/status',
        data: {'status': status.toString().split('.').last},
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return Grievance.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to update status');
    }
  }

  static Future<Map<String, dynamic>> getDashboardStats(String token) async {
    try {
      final response = await _dio.get(
        '$baseUrl/dashboard/stats',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );
      return response.data;
    } catch (e) {
      throw Exception('Failed to get stats');
    }
  }
}