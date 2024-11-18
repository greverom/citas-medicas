import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacienteDatosComponent } from './paciente-datos.component';

describe('PacienteDatosComponent', () => {
  let component: PacienteDatosComponent;
  let fixture: ComponentFixture<PacienteDatosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacienteDatosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PacienteDatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
