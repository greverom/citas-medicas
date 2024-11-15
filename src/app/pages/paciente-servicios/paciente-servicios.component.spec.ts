import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacienteServiciosComponent } from './paciente-servicios.component';

describe('PacienteServiciosComponent', () => {
  let component: PacienteServiciosComponent;
  let fixture: ComponentFixture<PacienteServiciosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacienteServiciosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PacienteServiciosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
