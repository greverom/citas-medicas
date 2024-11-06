// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { userReducer } from './app/store/user.reducer';

bootstrapApplication(AppComponent, {
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideDatabase(() => getDatabase()),
    provideStore({ user: userReducer }), // Configura `userReducer` directamente para el estado de `user`
    provideStoreDevtools({
      maxAge: 25,
      logOnly: environment.production
    })
  ]
}).catch(err => console.error(err));