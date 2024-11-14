import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { selectIsLoggedIn, selectUserData } from '../../../store/user.selector';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserRole } from '../../../models/user.dto';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [
      CommonModule,
      RouterModule
  ],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent implements OnInit  {
  isAdmin$: Observable<boolean>;
  isLoggedIn$: Observable<boolean>;
  isMedico$: Observable<boolean>;
  isPaciente$: Observable<boolean>;
  userName: string | null = null;

  constructor(private store: Store,
               private authService: AuthService
  ) {
    this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
    this.isAdmin$ = this.store.select(selectUserData).pipe(
      map(user => user?.role === UserRole.Admin)
    );
    this.isMedico$ = this.store.select(selectUserData).pipe(
      map(user => user?.role === UserRole.Medico)
    );
    this.isPaciente$ = this.store.select(selectUserData).pipe(
      map(user => user?.role === UserRole.Paciente)
    );
  }

  ngOnInit(): void {
    this.store.select(selectUserData).subscribe((data) => {
      this.userName = data?.name || null;
    });
  }
}
