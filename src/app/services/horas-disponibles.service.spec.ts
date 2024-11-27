import { TestBed } from '@angular/core/testing';

import { HorasDisponiblesService } from './horas-disponibles.service';

describe('HorasDisponiblesService', () => {
  let service: HorasDisponiblesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HorasDisponiblesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
