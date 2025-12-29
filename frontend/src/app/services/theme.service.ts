import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Theme } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private apiUrl = `${environment.apiUrl}/themes`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Theme[]> {
    return this.http.get<Theme[]>(this.apiUrl);
  }

  getById(id: string): Observable<Theme> {
    return this.http.get<Theme>(`${this.apiUrl}/${id}`);
  }

  create(theme: Theme): Observable<Theme> {
    return this.http.post<Theme>(this.apiUrl, theme);
  }

  update(id: string, theme: Partial<Theme>): Observable<Theme> {
    return this.http.put<Theme>(`${this.apiUrl}/${id}`, theme);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setDefault(id: string): Observable<Theme> {
    return this.http.patch<Theme>(`${this.apiUrl}/${id}/default`, {});
  }
}
