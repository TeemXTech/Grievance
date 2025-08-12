import type { DataSource } from "typeorm"
import * as bcrypt from "bcrypt"
import { User, LanguagePreference } from "../entities/user.entity"
import { Role, RoleName } from "../entities/role.entity"
import { Request, RequestType, RequestStatus, Priority } from "../entities/request.entity"
import { Category } from "../entities/category.entity"
import { FundRequest, ApprovalStatus } from "../entities/fund-request.entity"
import { Permission, PermissionAction, PermissionResource } from "../entities/permission.entity"

export async function seedDatabase(dataSource: DataSource) {
  console.log("🌱 Starting database seeding...")

  // Create Permissions
  const permissionRepository = dataSource.getRepository(Permission)
  const permissions = await permissionRepository.save([
    { action: PermissionAction.CREATE, resource: PermissionResource.REQUEST },
    { action: PermissionAction.READ, resource: PermissionResource.REQUEST },
    { action: PermissionAction.UPDATE, resource: PermissionResource.REQUEST },
    { action: PermissionAction.ASSIGN, resource: PermissionResource.REQUEST },
    { action: PermissionAction.APPROVE, resource: PermissionResource.FUND },
    { action: PermissionAction.READ, resource: PermissionResource.DASHBOARD },
  ])

  // Create Roles
  const roleRepository = dataSource.getRepository(Role)
  const roles = await roleRepository.save([
    { name: RoleName.ADMIN, permissions },
    { name: RoleName.MINISTER, permissions },
    { name: RoleName.PERSONAL_ASSISTANT, permissions: permissions.slice(0, 4) },
    { name: RoleName.OFFICE_STAFF, permissions: permissions.slice(0, 3) },
    { name: RoleName.FIELD_TEAM, permissions: permissions.slice(0, 3) },
    { name: RoleName.VILLAGE_HEAD, permissions: permissions.slice(0, 2) },
    { name: RoleName.VOLUNTEER, permissions: permissions.slice(0, 2) },
    { name: RoleName.AUDITOR, permissions: [permissions[1], permissions[5]] },
  ])

  // Create Categories
  const categoryRepository = dataSource.getRepository(Category)
  const categories = await categoryRepository.save([
    { name: "Healthcare", name_te: "ఆరోగ్య సేవలు", is_active: true },
    { name: "Infrastructure", name_te: "మౌలిక వసతులు", is_active: true },
    { name: "Education", name_te: "విద్య", is_active: true },
    { name: "Employment", name_te: "ఉపాధి", is_active: true },
    { name: "Social Welfare", name_te: "సామాజిక సంక్షేమం", is_active: true },
  ])

  // Create Users
  const userRepository = dataSource.getRepository(User)
  const hashedPassword = await bcrypt.hash("password123", 10)

  const users = await userRepository.save([
    {
      name: "Hon. Minister",
      phone: "+919876543210",
      email: "minister@telangana.gov.in",
      password_hash: hashedPassword,
      language_pref: LanguagePreference.ENGLISH,
      role: roles.find((r) => r.name === RoleName.MINISTER),
      is_active: true,
    },
    {
      name: "Personal Assistant",
      phone: "+919876543211",
      email: "pa@telangana.gov.in",
      password_hash: hashedPassword,
      language_pref: LanguagePreference.ENGLISH,
      role: roles.find((r) => r.name === RoleName.PERSONAL_ASSISTANT),
      is_active: true,
    },
    {
      name: "Admin User",
      phone: "+919876543212",
      email: "admin@telangana.gov.in",
      password_hash: hashedPassword,
      language_pref: LanguagePreference.ENGLISH,
      role: roles.find((r) => r.name === RoleName.ADMIN),
      is_active: true,
    },
    {
      name: "Field Officer",
      phone: "+919876543213",
      email: "field@telangana.gov.in",
      password_hash: hashedPassword,
      language_pref: LanguagePreference.TELUGU,
      role: roles.find((r) => r.name === RoleName.FIELD_TEAM),
      is_active: true,
    },
    {
      name: "Village Head",
      phone: "+919876543214",
      email: "village@telangana.gov.in",
      password_hash: hashedPassword,
      language_pref: LanguagePreference.TELUGU,
      role: roles.find((r) => r.name === RoleName.VILLAGE_HEAD),
      is_active: true,
    },
    {
      name: "Volunteer",
      phone: "+919876543215",
      email: "volunteer@telangana.gov.in",
      password_hash: hashedPassword,
      language_pref: LanguagePreference.TELUGU,
      role: roles.find((r) => r.name === RoleName.VOLUNTEER),
      is_active: true,
    },
  ])

  // Create Sample Requests
  const requestRepository = dataSource.getRepository(Request)
  const requests = await requestRepository.save([
    {
      id: "GRV-2024-0001",
      type: RequestType.PATIENT,
      title: "Medical Treatment Support Required",
      description: "Need financial assistance for heart surgery treatment at Apollo Hospital",
      requester_name: "Rajesh Kumar",
      requester_phone: "+919876543216",
      requester_address: "H.No 12-34, Gandhi Nagar, Hyderabad, Telangana - 500001",
      geo_latitude: 17.385,
      geo_longitude: 78.4867,
      status: RequestStatus.PENDING,
      priority: Priority.HIGH,
      category: categories[0],
      created_by_user: users[3],
      assigned_to: users[1],
    },
    {
      id: "GRV-2024-0002",
      type: RequestType.INFRA,
      title: "Road Repair Request",
      description: "Main road in our village has multiple potholes causing accidents",
      requester_name: "Lakshmi Devi",
      requester_phone: "+919876543217",
      requester_address: "Village: Kondapur, Mandal: Medak, District: Medak",
      geo_latitude: 17.4875,
      geo_longitude: 78.3953,
      status: RequestStatus.ASSIGNED,
      priority: Priority.MEDIUM,
      category: categories[1],
      created_by_user: users[4],
      assigned_to: users[3],
    },
    {
      id: "GRV-2024-0003",
      type: RequestType.JOB,
      title: "Employment Opportunity Request",
      description: "Looking for government job opportunities for engineering graduate",
      requester_name: "Suresh Reddy",
      requester_phone: "+919876543218",
      requester_address: "Plot No 45, Jubilee Hills, Hyderabad, Telangana - 500033",
      geo_latitude: 17.4239,
      geo_longitude: 78.4738,
      status: RequestStatus.NEW,
      priority: Priority.LOW,
      category: categories[3],
      created_by_user: users[5],
    },
    {
      id: "GRV-2024-0004",
      type: RequestType.FUND,
      title: "Educational Scholarship Request",
      description: "Need scholarship for daughter's engineering education",
      requester_name: "Venkata Rao",
      requester_phone: "+919876543219",
      requester_address: "Door No 8-15, Teachers Colony, Warangal, Telangana - 506002",
      geo_latitude: 17.9689,
      geo_longitude: 79.5941,
      status: RequestStatus.IN_PROGRESS,
      priority: Priority.MEDIUM,
      category: categories[2],
      created_by_user: users[4],
      assigned_to: users[2],
    },
    {
      id: "GRV-2024-0005",
      type: RequestType.OTHER,
      title: "Pension Scheme Enrollment",
      description: "Help with enrolling in senior citizen pension scheme",
      requester_name: "Kamala Devi",
      requester_phone: "+919876543220",
      requester_address: "H.No 23-67, Old City, Nizamabad, Telangana - 503001",
      geo_latitude: 18.6725,
      geo_longitude: 78.0941,
      status: RequestStatus.RESOLVED,
      priority: Priority.LOW,
      category: categories[4],
      created_by_user: users[5],
      assigned_to: users[1],
      closed_at: new Date(),
    },
  ])

  // Create Fund Requests
  const fundRequestRepository = dataSource.getRepository(FundRequest)
  await fundRequestRepository.save([
    {
      request: requests[0],
      amount: 250000,
      purpose: "Heart surgery medical expenses",
      requested_date: new Date(),
      approval_status: ApprovalStatus.REQUESTED,
      documents: { medical_reports: "heart_surgery_estimate.pdf" },
    },
    {
      request: requests[3],
      amount: 50000,
      purpose: "Engineering college fees for first year",
      requested_date: new Date(),
      approval_status: ApprovalStatus.SANCTIONED,
      approver: users[0],
      documents: { admission_letter: "engineering_admission.pdf", income_certificate: "income_cert.pdf" },
    },
  ])

  console.log("✅ Database seeding completed successfully!")
  console.log(`
📊 Seeded Data Summary:
- ${permissions.length} Permissions
- ${roles.length} Roles  
- ${users.length} Users
- ${categories.length} Categories
- ${requests.length} Requests
- 2 Fund Requests

🔐 Demo Login Credentials:
Minister: +919876543210 / password123
PA: +919876543211 / password123
Admin: +919876543212 / password123
Field Officer: +919876543213 / password123
Village Head: +919876543214 / password123
Volunteer: +919876543215 / password123
  `)
}
