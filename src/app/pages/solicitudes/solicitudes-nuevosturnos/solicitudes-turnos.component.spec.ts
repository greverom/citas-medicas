import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudesTurnosComponent } from './solicitudes-turnos.component';

describe('SolicitudesTurnosComponent', () => {
  let component: SolicitudesTurnosComponent;
  let fixture: ComponentFixture<SolicitudesTurnosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudesTurnosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SolicitudesTurnosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
