import { TestBed } from '@angular/core/testing';

import { AgentViewService } from './agent-view.service';

describe('AgentViewService', () => {
  let service: AgentViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgentViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
