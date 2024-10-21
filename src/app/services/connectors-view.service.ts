import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConnectorsViewService {
  private apiUrl = 'http://localhost:9000/connectors-views';
  constructor(private http: HttpClient) {}

  getConnectorView(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  saveConnectors(connections: any[]): Observable<any> {
    return this.http.put<any>(this.apiUrl, connections);
  }
}
