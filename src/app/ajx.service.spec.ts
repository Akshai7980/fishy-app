import { TestBed } from '@angular/core/testing';

import { AjxService } from './ajx.service';

describe('AjxService', () => {
  let service: AjxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AjxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
