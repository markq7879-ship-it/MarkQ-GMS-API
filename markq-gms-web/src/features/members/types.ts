export type Gender = "MALE" | "FEMALE" | "OTHER";
export type MemberStatus = "ACTIVE" | "EXPIRED" | "FROZEN" | "NO_MEMBERSHIP" | "CANCELLED" | "INACTIVE";
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | "UNKNOWN";
export type MaritalStatus = "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED" | "OTHER";
export type IdProofType = "AADHAR" | "PAN" | "PASSPORT" | "DRIVING_LICENSE" | "VOTER_ID" | "OTHER";

export interface Member {
  id: string;
  memberCode: string;
  fullName: string;
  fatherFullName?: string | null;
  mobile: string;
  whatsapp?: string | null;
  email?: string | null;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  bloodGroup?: BloodGroup | null;
  maritalStatus?: MaritalStatus | null;
  occupation?: string | null;
  address?: string | null;
  city?: string | null;
  pincode?: string | null;
  idProofType?: IdProofType | null;
  idProofNumber?: string | null;
  emergencyContactName?: string | null;
  emergencyContactRelation?: string | null;
  emergencyContactPhone?: string | null;
  referredBy?: string | null;
  notes?: string | null;
  branchId: string;
  branchName: string;
  status: MemberStatus;
  photoBase64?: string | null;
  photoContentType?: string | null;
  createdAt: string;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  cancelledByName?: string | null;
}

export interface MemberFormValues {
  fullName: string;
  fatherFullName?: string;
  mobile: string;
  whatsapp?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: Gender;
  bloodGroup?: BloodGroup;
  maritalStatus?: MaritalStatus;
  occupation?: string;
  address?: string;
  city?: string;
  pincode?: string;
  idProofType?: IdProofType;
  idProofNumber?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  referredBy?: string;
  notes?: string;
  branchId: string;
  photoBase64?: string;
  photoContentType?: string;
}

export interface MemberListResult {
  items: Member[];
  total: number;
}

export interface CheckMobileResult {
  exists: boolean;
  memberCode?: string;
  memberName?: string;
}
