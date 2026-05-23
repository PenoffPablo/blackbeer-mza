export type { UserRole } from "@prisma/client";

export interface PublicUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: "CUSTOMER" | "ADMIN";
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
