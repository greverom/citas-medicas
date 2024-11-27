import { AfterViewInit, Component, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { HeroComponent } from '../../components/home-c/hero/hero.component';
import { ProductsComponent } from '../../components/home-c/products/products.component';
import { LoginComponent } from "../login/login.component";
import { forkJoin, map, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn, selectUserData } from '../../store/user.selector';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FooterComponent } from '../../components/home-c/footer/footer.component';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PacienteService } from '../../services/pacientes.service';
import { NotificacionSolicitudComponent } from '../../components/medico/notificacion-solicitud/notificacion-solicitud.component';
import { SolicitudDto } from '../../models/turno.dto';
import { UserRole } from '../../models/user.dto';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    ProductsComponent,
    LoginComponent,
    FooterComponent,
    NotificacionSolicitudComponent
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  isLoggedIn$: Observable<boolean>;
  isMedico$: Observable<boolean>;
  isAdmin$: Observable<boolean>;
  isPaciente$: Observable<boolean>;
  solicitudesPendientes: SolicitudDto[] = [];

  constructor(private store: Store,
              private pacienteService: PacienteService,
              @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isLoggedIn$ = this.store.select(selectIsLoggedIn);

    this.isMedico$ = this.store.select(selectUserData).pipe(
      map((user) => user?.role === UserRole.Medico)
    );

    this.isAdmin$ = this.store.select(selectUserData).pipe(
      map((user) => user?.role === UserRole.Admin)
    );

    this.isPaciente$ = this.store.select(selectUserData).pipe(
      map((user) => user?.role === UserRole.Paciente)
    );
    gsap.registerPlugin(ScrollTrigger);
  }

  ngOnInit(): void {
    this.store.select(selectUserData).subscribe((userData) => {
      const medicoId = userData?.id;
      const userRole = userData?.role;
  
      if (userRole === UserRole.Medico && medicoId) {
        this.cargarTodasLasSolicitudes(medicoId);
      } 
    });
  }

  cargarTodasLasSolicitudes(medicoId: string): void {
    const solicitudesCambioTurnos$ = this.pacienteService
      .obtenerSolicitudesPendientesPorMedico(medicoId)
      .pipe(map((solicitudes) => solicitudes || []));
  
    const solicitudesNuevosTurnos$ = this.pacienteService
      .obtenerSolicitudesNuevosTurnosPorMedico(medicoId)
      .pipe(map((solicitudes) => solicitudes || []));
  
    forkJoin([solicitudesCambioTurnos$, solicitudesNuevosTurnos$]).subscribe({
      next: ([cambioTurnos, nuevosTurnos]) => {
        this.solicitudesPendientes = [...cambioTurnos, ...nuevosTurnos];
        //console.log(this.solicitudesPendientes);
      },
      error: (error) => {
        console.error('Error al cargar solicitudes combinadas:', error);
      },
    });
  }

  irASolicitudes(): void {
    window.location.href = '/solicitudes';
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
