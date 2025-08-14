// Simple seed script without external dependencies
const { exec } = require('child_process');
const fs = require('fs');

// First, let's create a simple SQL script to insert data
const sqlScript = `
-- Clear existing data
DELETE FROM "PatientGrievance";
DELETE FROM "IndividualGrievance";
DELETE FROM "JobRequest";
DELETE FROM "TTDRequest";
DELETE FROM "GovernmentProject";
DELETE FROM "Grievance";
DELETE FROM "Category";
DELETE FROM "User";

-- Insert Categories
INSERT INTO "Category" (id, name, description, "isActive", "createdAt", "updatedAt") VALUES
('cat1', 'Healthcare', 'Medical and health related issues', true, NOW(), NOW()),
('cat2', 'Infrastructure', 'Roads, water, electricity issues', true, NOW(), NOW()),
('cat3', 'Education', 'School and education related matters', true, NOW(), NOW()),
('cat4', 'Employment', 'Job and employment issues', true, NOW(), NOW()),
('cat5', 'Social Welfare', 'Pension, subsidies, welfare schemes', true, NOW(), NOW());

-- Insert Users (password hash for 'password123')
INSERT INTO "User" (id, name, email, "passwordHash", role, phone, status, "createdAt", "updatedAt") VALUES
('user1', 'System Administrator', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', '+919876543210', 'active', NOW(), NOW()),
('user2', 'Hon. Minister Rajesh Kumar', 'minister@ap.gov.in', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MINISTER', '+919876543211', 'active', NOW(), NOW()),
('user3', 'PA Officer Priya Sharma', 'pa1@ap.gov.in', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PA', '+919876543212', 'active', NOW(), NOW()),
('user4', 'Back Officer Lakshmi Devi', 'back1@ap.gov.in', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BACK_OFFICER', '+919876543213', 'active', NOW(), NOW()),
('user5', 'Field Officer Ramesh Kumar', 'field1@ap.gov.in', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'FIELD_OFFICER', '+919876543214', 'active', NOW(), NOW()),
('user6', 'Field Officer Anjali Patel', 'field2@ap.gov.in', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'FIELD_OFFICER', '+919876543215', 'active', NOW(), NOW()),
('user7', 'Citizen Ravi Teja', 'public1@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PUBLIC', '+919876543216', 'active', NOW(), NOW());

-- Insert Grievances
INSERT INTO "Grievance" (id, "referenceNumber", title, description, status, priority, "requesterName", "requesterPhone", "requesterEmail", village, district, state, "categoryId", "assignedToId", "createdAt", "updatedAt") VALUES
('grv1', 'GRV-2024-001', 'Water Supply Issue in Chandragiri', 'No water supply for 3 days in our area. Urgent attention needed.', 'PENDING', 'HIGH', 'Ravi Kumar', '+919876543301', 'ravi@example.com', 'Chandragiri', 'Chittoor', 'Andhra Pradesh', 'cat2', NULL, NOW(), NOW()),
('grv2', 'GRV-2024-002', 'Road Repair Required', 'Main road has big potholes. Vehicles getting damaged.', 'ASSIGNED', 'MEDIUM', 'Meera Devi', '+919876543302', 'meera@example.com', 'Palamaner', 'Chittoor', 'Andhra Pradesh', 'cat2', 'user5', NOW(), NOW()),
('grv3', 'GRV-2024-003', 'Hospital Staff Shortage', 'Not enough doctors in government hospital.', 'IN_PROGRESS', 'URGENT', 'Suresh Reddy', '+919876543303', 'suresh@example.com', 'Madanapalle', 'Chittoor', 'Andhra Pradesh', 'cat1', 'user6', NOW(), NOW()),
('grv4', 'GRV-2024-004', 'School Building Repair', 'School roof is leaking during rains.', 'RESOLVED', 'MEDIUM', 'Priya Sharma', '+919876543304', 'priya@example.com', 'Srikalahasti', 'Chittoor', 'Andhra Pradesh', 'cat3', 'user5', NOW(), NOW()),
('grv5', 'GRV-2024-005', 'Pension Not Received', 'Old age pension not received for 2 months.', 'PENDING', 'HIGH', 'Lakshmi Amma', '+919876543305', 'lakshmi@example.com', 'Puttur', 'Chittoor', 'Andhra Pradesh', 'cat5', NULL, NOW(), NOW());

-- Insert Government Projects
INSERT INTO "GovernmentProject" (id, "referenceNumber", "projectName", description, "ministerName", status, "estimatedCost", "actualCost", "startDate", "completionDate", village, district, state, beneficiaries, "createdBy", "assignedToId", "createdAt", "updatedAt") VALUES
('proj1', 'PROJ-2024-001', 'Rural Road Development', 'Construction of 50km rural roads', 'Hon. Minister Rajesh Kumar', 'IN_PROGRESS', 25000000, 15000000, '2024-01-15', '2024-12-31', 'Multiple Villages', 'Chittoor', 'Andhra Pradesh', 5000, 'user4', 'user5', NOW(), NOW()),
('proj2', 'PROJ-2024-002', 'Primary Health Center Upgrade', 'Modernization of PHC with new equipment', 'Hon. Minister Rajesh Kumar', 'COMPLETED', 15000000, 14500000, '2024-02-01', '2024-08-31', 'Chandragiri', 'Chittoor', 'Andhra Pradesh', 2000, 'user4', 'user6', NOW(), NOW());

-- Insert Patient Grievances
INSERT INTO "PatientGrievance" (id, "referenceNumber", "patientName", "patientPhone", village, "caretakerName", "caretakerPhone", issue, hospital, doctor, status, "createdBy", "createdAt", "updatedAt") VALUES
('pat1', 'PAT-2024-001', 'Patient Ramesh', '+919876543401', 'Chandragiri', 'Caretaker Suma', '+919876543402', 'Patient not getting proper treatment', 'Government Hospital Chandragiri', 'Dr. Sharma', 'NEW', 'user4', NOW(), NOW()),
('pat2', 'PAT-2024-002', 'Patient Kamala', '+919876543403', 'Palamaner', 'Caretaker Ravi', '+919876543404', 'Medicine not available in hospital', 'Government Hospital Palamaner', 'Dr. Reddy', 'NEW', 'user4', NOW(), NOW());

-- Insert Individual Grievances
INSERT INTO "IndividualGrievance" (id, name, "mobileNumber", village, "contactName", "contactNumber", office, subject, "createdBy", "createdAt", "updatedAt") VALUES
('ind1', 'Individual Applicant 1', '+919876543501', 'Chandragiri', 'Contact Person 1', '+919876543502', 'Tahsildar Office', 'Need caste certificate urgently', 'user4', NOW(), NOW()),
('ind2', 'Individual Applicant 2', '+919876543503', 'Palamaner', 'Contact Person 2', '+919876543504', 'VRO Office', 'Land records correction required', 'user4', NOW(), NOW());

-- Insert Job Requests
INSERT INTO "JobRequest" (id, name, "mobileNumber", village, "contactName", "contactNumber", office, subject, "createdBy", "createdAt", "updatedAt") VALUES
('job1', 'Job Seeker 1', '+919876543601', 'Chandragiri', 'Reference 1', '+919876543602', 'Employment Office', 'Looking for government job opportunity', 'user4', NOW(), NOW()),
('job2', 'Job Seeker 2', '+919876543603', 'Palamaner', 'Reference 2', '+919876543604', 'Employment Office', 'Need skill development training', 'user4', NOW(), NOW());

-- Insert TTD Requests
INSERT INTO "TTDRequest" (id, "darshanDate", "darshanType", "accommodationFrom", "accommodationTo", guests, "referenceName", "referenceNumber", "referenceVillage", "referenceMandal", "createdBy", "createdAt", "updatedAt") VALUES
('ttd1', '2024-12-25', 'SARVA_DARSHAN', '2024-12-24', '2024-12-26', '[{"name": "Devotee 1", "age": 45, "gender": "MALE"}]', 'Reference 1', '+919876543701', 'Chandragiri', 'Chandragiri', 'user4', NOW(), NOW()),
('ttd2', '2024-12-30', 'SPECIAL_ENTRY', '2024-12-29', '2024-12-31', '[{"name": "Devotee 2", "age": 35, "gender": "FEMALE"}]', 'Reference 2', '+919876543702', 'Palamaner', 'Palamaner', 'user4', NOW(), NOW());
`;

// Write SQL to file
fs.writeFileSync('seed-data.sql', sqlScript);

console.log('✅ SQL seed file created: seed-data.sql');
console.log('🔑 Login Credentials:');
console.log('   Minister: minister@ap.gov.in / password123');
console.log('   PA Officer: pa1@ap.gov.in / password123');
console.log('   Back Officer: back1@ap.gov.in / password123');
console.log('   Field Officer: field1@ap.gov.in / password123');
console.log('   Admin: admin@example.com / password123');
console.log('   Public: public1@example.com / password123');
console.log('');
console.log('📊 Created dummy data:');
console.log('   - 7 users (all roles)');
console.log('   - 5 categories');
console.log('   - 5 grievances');
console.log('   - 2 government projects');
console.log('   - 2 patient grievances');
console.log('   - 2 individual grievances');
console.log('   - 2 job requests');
console.log('   - 2 TTD requests');
console.log('');
console.log('To apply this data, run: npx prisma db execute --file seed-data.sql');