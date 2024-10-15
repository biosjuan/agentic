import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

export interface AgentView {
  id: string;
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class AgentViewService {
  private apiUrl = 'http://localhost:9000/agents-views';

  constructor(private http: HttpClient) {}

  getAgentView(): Observable<AgentView[]> {
    return this.http.get<AgentView[]>(this.apiUrl);
  }
}
