import { UserRole } from "./user.dto";

export interface LoginDto {
    email: string;       
    password: string;    
  }


export interface RegisterDto {
  name?: string;
  lastName?: string;
  email: string;
  password: string;
  role?: UserRole;
  especialidad?: string; 
  numeroLicencia?: string; 
  
}