import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Guest } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class GuestService {
  private apiUrl = `${environment.apiUrl}/guests`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Guest[]> {
    return this.http.get<Guest[]>(this.apiUrl);
  }

  getByInvitation(invitationId: string): Observable<Guest[]> {
    return this.http.get<Guest[]>(`${this.apiUrl}/invitation/${invitationId}`);
  }

  getById(id: string): Observable<Guest> {
    return this.http.get<Guest>(`${this.apiUrl}/${id}`);
  }

  create(guest: Guest): Observable<Guest> {
    return this.http.post<Guest>(this.apiUrl, guest);
  }

  update(id: string, guest: Partial<Guest>): Observable<Guest> {
    return this.http.put<Guest>(`${this.apiUrl}/${id}`, guest);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  submitRsvp(invitationId: string, guestData: Partial<Guest>): Observable<Guest> {
    return this.http.post<Guest>(`${this.apiUrl}/rsvp/${invitationId}`, guestData);
  }

  updateRsvpStatus(id: string, status: Guest['rsvpStatus']): Observable<Guest> {
    return this.http.patch<Guest>(`${this.apiUrl}/${id}/status`, { rsvpStatus: status });
  }
}
