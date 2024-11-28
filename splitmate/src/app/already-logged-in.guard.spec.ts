import { TestBed } from '@angular/core/testing';

import { AlreadyLoggedInGuard } from './already-logged-in.guard';

describe('AlreadyLoggedInGuard', () => {
  let guard: AlreadyLoggedInGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AlreadyLoggedInGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
