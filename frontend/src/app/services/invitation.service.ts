import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Invitation, DashboardStats } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {
  private apiUrl = `${environment.apiUrl}/invitations`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Invitation[]> {
    return this.http.get<Invitation[]>(this.apiUrl);
  }

  getById(id: string): Observable<Invitation> {
    return this.http.get<Invitation>(`${this.apiUrl}/${id}`);
  }

  getBySlug(slug: string): Observable<Invitation> {
    return this.http.get<Invitation>(`${this.apiUrl}/slug/${slug}`);
  }

  create(invitation: Invitation): Observable<Invitation> {
    return this.http.post<Invitation>(this.apiUrl, invitation);
  }

  update(id: string, invitation: Partial<Invitation>): Observable<Invitation> {
    return this.http.put<Invitation>(`${this.apiUrl}/${id}`, invitation);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  toggleActive(id: string, isActive: boolean): Observable<Invitation> {
    return this.http.patch<Invitation>(`${this.apiUrl}/${id}/toggle`, { isActive });
  }
}
