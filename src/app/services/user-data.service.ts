import { Injectable } from '@angular/core';
import { Database, ref, set } from '@angular/fire/database';
import { UserDto } from '../models/user.dto';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  constructor(private db: Database) {}

  addUserToDatabase(user: UserDto): Observable<void> {
    const userRef = ref(this.db, `usuarios/${user.id}`);
    return from(set(userRef, user));
  }
}