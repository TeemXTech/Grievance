# Telangana Grievance Management Mobile App

A comprehensive Flutter mobile application for the Telangana Grievance Management System, supporting iOS and Android platforms.

## Features

### 🔐 Authentication & Role Management
- Secure login with JWT tokens
- Role-based access control (Minister, PA, Field Team, Back Officer, Admin, Public)
- Automatic session management

### 📱 Core Functionality
- **Dashboard**: Role-specific dashboards with quick actions and statistics
- **Grievance Management**: View, create, update, and track grievances
- **QR Code Scanner**: Scan QR codes from printed receipts to open grievances
- **Image Capture**: Camera integration for evidence and documentation
- **Offline Support**: Local storage for critical data

### 👥 Role-Specific Features

#### Minister Dashboard
- Executive overview with key metrics
- High-priority grievance alerts
- Performance analytics

#### PA (Personal Assistant)
- Administrative workflow management
- Grievance assignment and tracking
- Communication tools

#### Field Team
- Ground-level grievance handling
- Status updates with location
- Photo evidence capture

#### Back Officer
- Data entry and management
- Bulk operations
- Report generation

#### Admin
- System administration
- User management
- System analytics

### 📸 Advanced Features
- **Camera Integration**: Capture photos for grievances
- **QR Code Scanning**: Quick access to grievances via QR codes
- **Push Notifications**: Real-time updates
- **Offline Mode**: Work without internet connection
- **Multi-language Support**: Telugu and English

## Technical Stack

- **Framework**: Flutter 3.10+
- **State Management**: Provider
- **HTTP Client**: Dio
- **Local Storage**: SharedPreferences
- **Camera**: camera plugin
- **QR Scanner**: qr_code_scanner
- **UI**: Material Design with custom theming

## Project Structure

```
lib/
├── main.dart                 # App entry point
├── models/                   # Data models
│   └── user_model.dart
├── services/                 # API and business logic
│   ├── auth_service.dart
│   └── api_service.dart
├── screens/                  # UI screens
│   ├── splash_screen.dart
│   ├── login_screen.dart
│   ├── dashboard_screen.dart
│   ├── grievances_screen.dart
│   ├── qr_scanner_screen.dart
│   └── grievance_detail_screen.dart
├── widgets/                  # Reusable components
│   └── grievance_card.dart
└── utils/                    # Utilities and themes
    └── app_theme.dart
```

## Setup Instructions

### Prerequisites
- Flutter SDK 3.10 or higher
- Dart SDK 3.0 or higher
- Android Studio / VS Code
- iOS development setup (for iOS builds)

### Installation

1. **Clone the repository**
   ```bash
   cd flutter_app
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Configure API endpoint**
   Update the `baseUrl` in `lib/services/api_service.dart`:
   ```dart
   static const String baseUrl = 'http://your-api-url.com/api';
   ```

4. **Run the app**
   ```bash
   # For development
   flutter run
   
   # For Android release
   flutter build apk --release
   
   # For iOS release
   flutter build ios --release
   ```

## Key Features Implementation

### QR Code Scanning
- Scan QR codes from printed grievance receipts
- Automatic grievance lookup and navigation
- Flash toggle and camera controls

### Camera Integration
- Capture photos for grievance evidence
- Image compression and upload
- Gallery selection support

### Role-Based UI
- Dynamic dashboard based on user role
- Conditional feature access
- Customized navigation and actions

### Offline Support
- Local data caching
- Sync when connection restored
- Critical data persistence

## API Integration

The app integrates with the Next.js backend API:

- **Authentication**: `/api/auth/signin`
- **Grievances**: `/api/grievances`
- **Dashboard Stats**: `/api/dashboard/stats`
- **Profile**: `/api/auth/profile`

## Build & Deployment

### Android
```bash
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

### iOS
```bash
flutter build ios --release
# Requires Xcode for final build and distribution
```

## Testing

```bash
# Run unit tests
flutter test

# Run integration tests
flutter drive --target=test_driver/app.dart
```

## Performance Optimizations

- Image compression for uploads
- Lazy loading for large lists
- Efficient state management
- Memory leak prevention
- Battery optimization

## Security Features

- JWT token management
- Secure storage for sensitive data
- API request encryption
- Biometric authentication (optional)
- Certificate pinning

## Accessibility

- Screen reader support
- High contrast mode
- Large text support
- Voice navigation
- Keyboard navigation

## Future Enhancements

- Push notifications
- Real-time chat
- Voice notes
- GPS tracking
- Biometric login
- Dark mode
- Multi-language support

## Support

For technical support or feature requests, contact the development team.

---

**Government of Telangana**  
Digital Governance Initiative