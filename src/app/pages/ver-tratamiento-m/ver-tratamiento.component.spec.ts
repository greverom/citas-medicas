import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerTratamientoComponent } from './ver-tratamiento.component';

describe('VerTratamientoComponent', () => {
  let component: VerTratamientoComponent;
  let fixture: ComponentFixture<VerTratamientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerTratamientoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerTratamientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
