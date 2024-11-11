import { Component } from '@angular/core';
import { HeroComponent } from '../../components/home-c/hero/hero.component';
import { ProductsComponent } from '../../components/home-c/products/products.component';
import { LoginComponent } from "../login/login.component";
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn } from '../../store/user.selector';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    ProductsComponent,
    LoginComponent
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  isLoggedIn$: Observable<boolean>;

  constructor(private store: Store) {
    this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
  }
}
