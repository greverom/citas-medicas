import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from '@angular/fire/auth';
import { Store } from '@ngrx/store';
import { UserDto, UserRole } from '../models/user.dto';
import { from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { setAdminStatus, setLoggedInStatus, setUserData, unsetUserData } from '../store/user.action';
import { LoginDto, RegisterDto } from '../models/auth.dto';
import { UserDataService } from './user-data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth, private userDataService: UserDataService, private store: Store) { }

  register(registerData: RegisterDto) {
    const { email, password, name = '', lastName = '', role = UserRole.Paciente } = registerData;

    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((userCredential) => {
        const user = userCredential.user;
        return user
          ? from(updateProfile(user, { displayName: `${name} ${lastName}` })).pipe(
              map(() => user)
            )
          : of(null);
      }),
      switchMap((user) => {
        if (user) {
          const newUser: UserDto = {
            id: user.uid,
            name,
            email: user.email || '',
            role,
            isAdmin: role === UserRole.Admin,
            detalles: role === UserRole.Paciente
              ? {
                  medicoId: '',
                  cedula: '',
                  fechaNacimiento: '',
                  direccion: '',
                  telefono: '',
                }
              : role === UserRole.Medico
              ? {
                  especialidad: '',
                  numeroLicencia: '',
                  cedula: '',
                }
              : undefined,
          };
          if (newUser.detalles === undefined) {
            delete newUser.detalles;
          }

          return this.userDataService.addUserToDatabase(newUser).pipe(
            map(() => {
              this.store.dispatch(setUserData({ data: newUser }));
              this.store.dispatch(setAdminStatus({ isAdmin: role === UserRole.Admin }));
            })
          );
        }
        return of(null);
      }),
      catchError((error) => {
        console.error('Error al registrar usuario:', error);
        return of(null);
      })
    );
  }

  login(loginData: LoginDto) {
    const { email, password } = loginData;

    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
        switchMap((userCredential) => {
            const user = userCredential.user;
            if (user) {
                return from(user.getIdToken()).pipe(
                    switchMap((token) => {
                        return this.userDataService.getUserFromDatabase(user.uid).pipe(
                            map((userData) => {
                                if (userData) {
                                    localStorage.setItem('accessToken', token);
                                    this.store.dispatch(setUserData({ data: userData }));
                                    this.store.dispatch(setAdminStatus({ isAdmin: userData.role === UserRole.Admin }));
                                    this.store.dispatch(setLoggedInStatus({ isLoggedIn: true }));
                                }
                                return userData;
                            })
                        );
                    })
                );
            }
            return of(null);
        }),
        catchError((error) => {
            console.error('Error al iniciar sesión:', error);
            return of(null);
        })
    );
}

logout() {
  return from(signOut(this.auth)).pipe(
    map(() => {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        localStorage.removeItem('accessToken');
      }

      this.store.dispatch(setLoggedInStatus({ isLoggedIn: false }));
      this.store.dispatch(setAdminStatus({ isAdmin: false }));
      this.store.dispatch(unsetUserData());
    }),
    catchError((error) => {
      console.error('Error al cerrar sesión:', error);
      return of(null);
    })
  );
}
}