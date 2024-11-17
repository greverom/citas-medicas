import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements AfterViewInit {
  private autoSlideInterval: any; 
  private currentSlide = 1; 
  private track!: HTMLElement;
  private slides!: HTMLElement[];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.track = document.querySelector('.carousel-track') as HTMLElement;
      this.slides = Array.from(this.track.children) as HTMLElement[];

      const nextButton = document.querySelector('.next-btn') as HTMLElement;
      const prevButton = document.querySelector('.prev-btn') as HTMLElement;

      // Posicionar el track inicialmente
      this.updateTrackPosition();
      this.updateSlideStyles();

      // Botones de navegación
      nextButton.addEventListener('click', this.moveToNextSlide.bind(this));
      prevButton.addEventListener('click', this.moveToPrevSlide.bind(this));

      // Manejar el final del carrusel
      this.track.addEventListener('transitionend', this.handleTransitionEnd.bind(this));

      window.addEventListener('resize', this.updateTrackPosition.bind(this));

      // Iniciar auto-slide
      this.autoSlideInterval = setInterval(this.moveToNextSlide.bind(this), 5000);
    }
  }

  ngOnDestroy(): void {
    if (this.autoSlideInterval) clearInterval(this.autoSlideInterval);
  }

  private getSlideWidth(): number {
    const slide = this.slides[0];
    const slideWidth = slide.getBoundingClientRect().width;
    const slideMargin = parseFloat(getComputedStyle(slide).marginRight) +
                        parseFloat(getComputedStyle(slide).marginLeft);
    return slideWidth + slideMargin; // Ancho de tarjeta más márgenes
  }

  private updateTrackPosition(): void {
    const slideWidth = this.getSlideWidth();
    this.track.style.transition = 'none'; 
    this.track.style.transform = `translateX(-${this.currentSlide * slideWidth}px)`;
    this.updateSlideStyles();
  }

  private moveToNextSlide(): void {
    this.currentSlide++;
    const slideWidth = this.getSlideWidth();
    this.track.style.transition = 'transform 0.3s ease-in-out';
    this.track.style.transform = `translateX(-${this.currentSlide * slideWidth}px)`;
    this.updateSlideStyles();
  }

  private moveToPrevSlide(): void {
    this.currentSlide--;
    const slideWidth = this.getSlideWidth();
    this.track.style.transition = 'transform 0.3s ease-in-out';
    this.track.style.transform = `translateX(-${this.currentSlide * slideWidth}px)`;
    this.updateSlideStyles();
  }

  private handleTransitionEnd(): void {
    if (this.currentSlide === 0) {
      this.currentSlide = this.slides.length - 2;
      this.updateTrackPosition();
    } else if (this.currentSlide === this.slides.length - 1) {
      this.currentSlide = 1;
      this.updateTrackPosition();
    }
    this.updateSlideStyles(); 
  }

  private updateSlideStyles(): void {
    this.slides.forEach((slide, index) => {
      slide.classList.remove('center'); 
      slide.style.opacity = '0.5'; 
      slide.style.filter = 'blur(5px)'; 

      if (index === this.currentSlide) {
        slide.classList.add('center'); 
        slide.style.opacity = '1'; 
        slide.style.filter = 'none'; 
      }
    });
  }
}
