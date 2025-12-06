// Permission constants matching backend PERMISSION enum
export const PERMISSIONS = {
  // Auth
  CREATE_INSTRUCTOR: 'create_instructor',
  CREATE_STUDENT: 'create_student',

  // Lectures
  UPLOAD_LECTURE: 'upload_lecture',
  UPLOAD_LECTURE_FILES: 'upload_lecture_files',
  MANAGE_LECTURE: 'manage_lecture',

  // Users & Roles
  MANAGE_ROLES: 'manage_roles',
  MANAGE_USERS: 'manage_users',

  // Batches
  MANAGE_BATCHES: 'manage_batches',
  BATCH_ENROLL_STUDENTS: 'batch_enroll_students',
  BATCH_ASSIGN_COURSES: 'batch_assign_courses',

  // Courses
  COURSE_CREATE: 'course_create',
  COURSE_UPDATE: 'course_update',
  COURSE_DELETE: 'course_delete',
  COURSE_TOGGLE_PUBLISH: 'course_toggle_publish',

  // Content
  CONTENT_CREATE: 'content_create',
  CONTENT_UPDATE: 'content_update',
  CONTENT_DELETE: 'content_delete',

  // Organization
  ORG_INFO_MANAGE: 'org_info_manage',

  // Resources
  RESOURCES_MANAGE: 'resources_manage',
  RESOURCES_UPDATE_BATCHES: 'resources_update_batches',

  // Course Files
  COURSE_FILES_MANAGE: 'course_files_manage',

  // Quiz
  QUIZ_MANAGE: 'quiz_manage',

  // Certificates
  CERTIFICATE_ISSUE_USER: 'certificate_issue_user',
  CERTIFICATE_ISSUE_BATCH: 'certificate_issue_batch',
  CERTIFICATE_REVOKE: 'certificate_revoke',
  CERTIFICATE_DELETE: 'certificate_delete',
  CERTIFICATE_VIEW_ADMIN: 'certificate_view_admin',

  // Notifications & Email
  NOTIFICATION_MANAGE: 'notification_manage',
  EMAIL_SEND: 'email_send',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
