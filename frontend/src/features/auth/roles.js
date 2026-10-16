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
  const normalizedRole = typeof role === "string" ? role.trim().toLowerCase() : "";
  return Object.values(ROLES).includes(normalizedRole) ? normalizedRole : null;
}

export function canAccessRole(role, allowedRoles) {
  const normalizedRole = normalizeRole(role);
  return normalizedRole
    ? allowedRoles.some((allowedRole) => normalizeRole(allowedRole) === normalizedRole)
    : false;
}
