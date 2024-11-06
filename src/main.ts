import { bootstrapApplication } from '@angular/platform-browser';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { userReducer } from './app/store/user.reducer';
import { routes } from './app/app.routes';
import { getAuth, provideAuth } from '@angular/fire/auth';

bootstrapApplication(AppComponent, {
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideDatabase(() => getDatabase()),
    provideAuth(() => getAuth()),
    provideRouter(routes), 
    provideStore({ user: userReducer }), 
    provideStoreDevtools({
      maxAge: 25,
      logOnly: environment.production
    })
  ]
}).catch(err => console.error(err));