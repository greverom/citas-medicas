import { Injectable } from '@angular/core';
import { Database, get, ref, set } from '@angular/fire/database';
import { UserDto } from '../models/user.dto';
import { from, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserDataService {
  constructor(private db: Database) {}

  addUserToDatabase(user: UserDto): Observable<void> {
    const userRef = ref(this.db, `usuarios/${user.id}`);
    return from(set(userRef, user));
  }

  getUserFromDatabase(userId: string): Observable<UserDto | null> {
    const userRef = ref(this.db, `usuarios/${userId}`);
    return from(get(userRef)).pipe(
      map((snapshot) => {
        if (snapshot.exists()) {
          return snapshot.val() as UserDto;
        } else {
          return null;
        }
      })
    );
  }
}