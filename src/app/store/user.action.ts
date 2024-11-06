import { createAction, props } from '@ngrx/store';
import { UserDto } from '../models/user.dto';


export const setAdminStatus = createAction(
  '[User] Set Admin Status',
  props<{ isAdmin: boolean }>()
);

export const setLoggedInStatus = createAction(
  '[User] Set Logged In Status',
  props<{ isLoggedIn: boolean }>()
);

export const setUserData = createAction(
  '[User] Set Data In Status',
  props<{ data: UserDto | null }>()
);

export const unsetUserData = createAction(
  '[User] Unset Data In Status',
);
