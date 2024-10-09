import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConnectorsService {
  private apiUrl = 'http://localhost:9000/connectors';

  constructor(private http: HttpClient) {}

  getConnectors(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  saveConnectors(connectors: any[]): Observable<void> {
    return this.http.put<void>(this.apiUrl, connectors);
  }
}
