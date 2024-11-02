import { TestBed } from '@angular/core/testing';

import { CosmeticService } from './cosmetics.service';

describe('CosmeticsService', () => {
  let service: CosmeticService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CosmeticService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
