import type { UserRole } from "@prisma/client";
export type { UserRole };

export interface PublicUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: UserRole;
}

export interface UserAddress {
  id: string;
  label?: string | null;
  street: string;
  number: string;
  apartment?: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}
