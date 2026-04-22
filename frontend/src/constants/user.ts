// User types - single source of truth
export const USER_TYPES = {
  FACTURACION: 'facturacion',
  SOPORTE: 'soporte',
  ADMIN: 'admin',
} as const;

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];

// Role-based access checks
export const canAccessFacturas = (userType: UserType): boolean =>
  [USER_TYPES.FACTURACION, USER_TYPES.ADMIN].includes(userType);

export const canManageClientes = (userType: UserType): boolean =>
  [USER_TYPES.SOPORTE, USER_TYPES.ADMIN].includes(userType);

export const canDeleteClientes = (userType: UserType): boolean =>
  userType === USER_TYPES.ADMIN;

export const canEditClientes = (userType: UserType): boolean =>
  [USER_TYPES.SOPORTE, USER_TYPES.ADMIN].includes(userType);

// Validate user type from string
export const isValidUserType = (value: string): value is UserType =>
  Object.values(USER_TYPES).includes(value as UserType);
