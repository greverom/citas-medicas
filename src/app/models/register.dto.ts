import { UserRole } from "./user.dto";

export interface RegisterDto {
    name: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
  }