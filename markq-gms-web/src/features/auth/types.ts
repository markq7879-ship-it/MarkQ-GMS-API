export type UserRole = "OWNER" | "ADMIN";

export interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  branchIds: string[];
}

export interface LoginResponse {
  accessToken: string;
  expiresAtUtc: string;
  user: UserInfo;
}
