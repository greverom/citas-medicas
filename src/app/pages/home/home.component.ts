import { AfterViewInit, Component, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { HeroComponent } from '../../components/home-c/hero/hero.component';
import { ProductsComponent } from '../../components/home-c/products/products.component';
import { LoginComponent } from "../login/login.component";
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn } from '../../store/user.selector';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FooterComponent } from '../../components/home-c/footer/footer.component';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    ProductsComponent,
    LoginComponent,
    FooterComponent
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  isLoggedIn$: Observable<boolean>;

  constructor(private store: Store,
              @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
    gsap.registerPlugin(ScrollTrigger);
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.addScrollAnimations();
    }
  }

  
  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    }
  }

  private addScrollAnimations(): void {
    const hero = document.querySelector('.hero-container');
    const products = document.querySelector('.products-container');
    const login = document.querySelector('#login-section');
    const footer = document.querySelector('.footer-container');

    if (hero) {
      gsap.from(hero, {
        opacity: 0,
        y: -100,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: hero,
          start: 'top center',
          toggleActions: 'play none none none',
        },
      });
    }

    if (products) {
      gsap.from(products, {
        opacity: 0,
        y: 100,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: products,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }

    if (login) {
      gsap.from(login, {
        opacity: 0,
        x: -50,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: login,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }
  }
}
