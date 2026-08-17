export const ROLES = {
  ADMIN: "admin",
  INSTRUCTOR: "instructor",
  STUDENT: "student",
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.INSTRUCTOR]: "Instructor",
  [ROLES.STUDENT]: "Student",
};

export function normalizeRole(role) {
  return Object.values(ROLES).includes(role) ? role : null;
}

export function canAccessRole(role, allowedRoles) {
  return normalizeRole(role) ? allowedRoles.includes(role) : false;
}
