import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TratamientosMedicoComponent } from './tratamientos-medico.component';

describe('TratamientosMedicoComponent', () => {
  let component: TratamientosMedicoComponent;
  let fixture: ComponentFixture<TratamientosMedicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TratamientosMedicoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TratamientosMedicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
