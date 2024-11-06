import { UserDto } from "../models/user.dto";

export interface UserState {
  isAdmin: boolean;
  isLoggedIn: boolean;
  data: UserDto | null;
}
