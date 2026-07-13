import { TestBed } from '@angular/core/testing';

import { PelisApi } from './pelis-api';

describe('PelisApi', () => {
  let service: PelisApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PelisApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
