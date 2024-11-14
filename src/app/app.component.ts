import { Component, OnInit } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./components/navbar/navbar.component";
import { UserDto, UserRole  } from './models/user.dto';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUserData } from './store/user.selector';
import { Auth } from '@angular/fire/auth';
import { UserDataService } from './services/user-data.service';
import { setAdminStatus, setLoggedInStatus, setUserData } from './store/user.action';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { SpinnerService } from './services/spinner.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, 
            NavbarComponent, 
            SpinnerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'citas-medicas';
  userData$: Observable<UserDto | null>;

  constructor(
    private store: Store,
    private auth: Auth,
    private userDataService: UserDataService,
    private router: Router,
    private spinnerService: SpinnerService
  ) {
    this.userData$ = this.store.select(selectUserData);
  }

  ngOnInit(): void {
    this.auth.onAuthStateChanged(user => {
      if (user) {
        this.userDataService.getUserFromDatabase(user.uid).subscribe(userData => {
          if (userData) {
            this.store.dispatch(setUserData({ data: userData }));
            this.store.dispatch(setAdminStatus({ isAdmin: userData.role === UserRole.Admin }));
            this.store.dispatch(setLoggedInStatus({ isLoggedIn: true }));
          }
        });
      } else {
        this.store.dispatch(setLoggedInStatus({ isLoggedIn: false }));
        this.store.dispatch(setUserData({ data: null }));
      }
    });

    this.userData$.subscribe((data) => {
      console.log('Datos del usuario:', data);
    });
    //spinner para cambios de pagina
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.spinnerService.show();
      } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        this.spinnerService.hide();
      }
    });
  }
}
