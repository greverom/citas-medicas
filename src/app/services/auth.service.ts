import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Store } from '@ngrx/store';
import { UserDto, UserRole } from '../models/user.dto';
import { from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { setUserData } from '../store/user.action';
import { LoginDto, RegisterDto } from '../models/auth.dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth, private store: Store) { }

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
      map((user) => {
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

          this.store.dispatch(setUserData({ data: newUser }));
        }
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
      map((userCredential) => userCredential.user),
      map((user) => {
        if (user) {
          const loggedInUser: UserDto = {
            id: user.uid,
            name: user.displayName || '', 
            email: user.email || '',
            role: UserRole.Paciente, 
            isAdmin: false, 
            detalles: undefined 
          };

          this.store.dispatch(setUserData({ data: loggedInUser }));
        }
      }),
      catchError((error) => {
        console.error('Error al iniciar sesión:', error);
        return of(null); 
      })
    );
  }
}