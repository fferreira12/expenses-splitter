import { TestBed } from '@angular/core/testing';

import { SplitterService } from './splitter.service';

describe('SplitterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SplitterService = TestBed.get(SplitterService);
    expect(service).toBeTruthy();
  });
});
