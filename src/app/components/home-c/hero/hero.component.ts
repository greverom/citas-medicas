import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectIsLoggedIn, selectUserData } from '../../../store/user.selector';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
  isLoggedIn$: Observable<boolean>;
  userName: string | null = null;

  constructor(private store: Store) {
    this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
  }

  ngOnInit(): void {
    this.store.select(selectUserData).subscribe((data) => {
      this.userName = data?.name || null;
    });
  }
}
