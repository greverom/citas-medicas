import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacienteTurnoComponent } from './paciente-turno.component';

describe('PacienteTurnoComponent', () => {
  let component: PacienteTurnoComponent;
  let fixture: ComponentFixture<PacienteTurnoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacienteTurnoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PacienteTurnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
