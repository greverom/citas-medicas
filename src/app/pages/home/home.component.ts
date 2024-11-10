import { Component } from '@angular/core';
import { HeroComponent } from '../../components/home/hero/hero.component';
import { ProductsComponent } from '../../components/home/products/products.component';



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    ProductsComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
