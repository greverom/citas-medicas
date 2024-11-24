import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificacionSolicitudComponent } from './notificacion-solicitud.component';

describe('NotificacionSolicitudComponent', () => {
  let component: NotificacionSolicitudComponent;
  let fixture: ComponentFixture<NotificacionSolicitudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificacionSolicitudComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NotificacionSolicitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
