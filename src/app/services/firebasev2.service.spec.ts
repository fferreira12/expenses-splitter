import { TestBed } from '@angular/core/testing';

import { Firebasev2Service } from './firebasev2.service';

describe('Firebasev2Service', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Firebasev2Service = TestBed.get(Firebasev2Service);
    expect(service).toBeTruthy();
  });
});
