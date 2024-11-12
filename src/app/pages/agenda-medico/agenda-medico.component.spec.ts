import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaMedicoComponent } from './agenda-medico.component';

describe('AgendaMedicoComponent', () => {
  let component: AgendaMedicoComponent;
  let fixture: ComponentFixture<AgendaMedicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaMedicoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgendaMedicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
