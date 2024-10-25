import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Node {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
}

@Injectable({
  providedIn: 'root',
})
export class AgentService {
  private apiUrl = 'http://localhost:9000/agents';

  constructor(private http: HttpClient) {}

  getAgents(): Observable<Node[]> {
    return this.http.get<Node[]>(this.apiUrl);
  }

  saveAgents(agents: Node[]): Observable<void> {
    return this.http.put<void>(this.apiUrl, agents);
  }

  addAgent(agent: Node): Observable<Node> {
    return this.http.post<Node>(this.apiUrl, agent);
  }

  updateAgent(id: string, agent: Node): Observable<Node> {
    return this.http.put<Node>(`${this.apiUrl}/${id}`, agent);
  }

  deleteAgent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
