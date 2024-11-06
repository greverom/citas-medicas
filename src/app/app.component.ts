import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./components/navbar/navbar.component";
import { UserDto } from './models/user.dto';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUserData } from './store/user.selector';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'citas-medicas';
  userData$: Observable<UserDto | null>;

  constructor(private store: Store) {
    this.userData$ = this.store.select(selectUserData);
  }

  ngOnInit(): void {
    this.userData$.subscribe((data) => {
      console.log('Datos del usuario:', data);
    });
  }
}
