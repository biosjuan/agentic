import { TestBed } from '@angular/core/testing';

import { ConnectorsViewService } from './connectors-view.service';

describe('ConnectorsViewService', () => {
  let service: ConnectorsViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConnectorsViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
