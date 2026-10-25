export type UserRole = "OWNER" | "ADMIN";

export interface UserSummary {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string | null;
  branchIds: string[];
}

export interface CreateUserValues {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  branchIds: string[];
}

export interface UpdateUserValues {
  fullName: string;
  phone?: string;
  role: UserRole;
  branchIds?: string[];
}
