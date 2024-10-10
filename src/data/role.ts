const roles = [
  "STAFF_VIEW",
  "STAFF_CREATE",
  "STAFF_UPDATE",
  "STAFF_DELETE",
  "ROLE_VIEW",
  "ROLE_CREATE",
  "ROLE_UPDATE",
  "ROLE_DELETE",
  "MEMBER_CREATE",
  "MEMBER_VIEW",
  "MEMBER_UPDATE",
  "MEMBER_DELETE",
  "DATABASE_VIEW",
  "ACTIVITY_LOG",
  "SITE_SETTING",
] as const;

export default roles;

export const falsyRole = () => {
  // Assign role to object with true value
  const roleObject: any = {};
  roles.forEach((role) => {
    roleObject[role] = false;
  });
  return roleObject;
};
