import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacienteDiagnosticoComponent } from './paciente-diagnostico.component';

describe('PacienteDiagnosticoComponent', () => {
  let component: PacienteDiagnosticoComponent;
  let fixture: ComponentFixture<PacienteDiagnosticoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacienteDiagnosticoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PacienteDiagnosticoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
