import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { GuestService } from '../../../services/guest.service';
import { Guest } from '../../../models/models';

@Component({
  selector: 'app-guests',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    DatePipe,
    TitleCasePipe
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Guest Management</h1>
        <a mat-button routerLink="/admin/invitations">
          <mat-icon>arrow_back</mat-icon>
          Back to Invitations
        </a>
      </div>

      @if (loading) {
        <div class="loading">
          <mat-spinner diameter="50"></mat-spinner>
        </div>
      } @else if (guests.length === 0) {
        <mat-card class="empty-state">
          <mat-card-content>
            <mat-icon>people_outline</mat-icon>
            <h2>No Guests Yet</h2>
            <p>Guests will appear here once they RSVP to your invitation</p>
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="stats-row">
          <mat-card class="mini-stat confirmed">
            <span class="count">{{ getStatusCount('confirmed') }}</span>
            <span class="label">Confirmed</span>
          </mat-card>
          <mat-card class="mini-stat pending">
            <span class="count">{{ getStatusCount('pending') }}</span>
            <span class="label">Pending</span>
          </mat-card>
          <mat-card class="mini-stat declined">
            <span class="count">{{ getStatusCount('declined') }}</span>
            <span class="label">Declined</span>
          </mat-card>
        </div>

        <mat-card>
          <table mat-table [dataSource]="guests" class="full-width">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let guest">{{ guest.name }}</td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let guest">{{ guest.email }}</td>
            </ng-container>

            <ng-container matColumnDef="numberOfGuests">
              <th mat-header-cell *matHeaderCellDef>Guests</th>
              <td mat-cell *matCellDef="let guest">{{ guest.numberOfGuests }}</td>
            </ng-container>

            <ng-container matColumnDef="rsvpStatus">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let guest">
                <span class="status-chip" [class]="guest.rsvpStatus">
                  {{ guest.rsvpStatus | titlecase }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="respondedAt">
              <th mat-header-cell *matHeaderCellDef>Responded</th>
              <td mat-cell *matCellDef="let guest">
                {{ guest.respondedAt ? (guest.respondedAt | date:'short') : '-' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let guest">
                <button mat-icon-button [matMenuTriggerFor]="statusMenu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #statusMenu="matMenu">
                  <button mat-menu-item (click)="updateStatus(guest, 'confirmed')">
                    <mat-icon>check_circle</mat-icon>
                    Mark Confirmed
                  </button>
                  <button mat-menu-item (click)="updateStatus(guest, 'pending')">
                    <mat-icon>schedule</mat-icon>
                    Mark Pending
                  </button>
                  <button mat-menu-item (click)="updateStatus(guest, 'declined')">
                    <mat-icon>cancel</mat-icon>
                    Mark Declined
                  </button>
                  <button mat-menu-item (click)="deleteGuest(guest)" class="delete-action">
                    <mat-icon>delete</mat-icon>
                    Delete
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .container {
      padding: 24px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    
    h1 {
      margin: 0;
      color: #333;
    }
    
    .loading {
      display: flex;
      justify-content: center;
      padding: 60px;
    }
    
    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }
    
    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
    }
    
    .stats-row {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .mini-stat {
      flex: 1;
      padding: 16px;
      text-align: center;
    }
    
    .mini-stat .count {
      display: block;
      font-size: 2rem;
      font-weight: 600;
    }
    
    .mini-stat .label {
      color: #666;
      font-size: 0.9rem;
    }
    
    .mini-stat.confirmed .count { color: #4caf50; }
    .mini-stat.pending .count { color: #ff9800; }
    .mini-stat.declined .count { color: #f44336; }
    
    .full-width {
      width: 100%;
    }
    
    .status-chip {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.85rem;
      font-weight: 500;
    }
    
    .status-chip.confirmed {
      background: #e8f5e9;
      color: #2e7d32;
    }
    
    .status-chip.pending {
      background: #fff3e0;
      color: #ef6c00;
    }
    
    .status-chip.declined {
      background: #ffebee;
      color: #c62828;
    }
    
    .delete-action {
      color: #f44336;
    }
  `]
})
export class GuestsComponent implements OnInit {
  guests: Guest[] = [];
  loading = true;
  invitationId: string | null = null;
  displayedColumns = ['name', 'email', 'numberOfGuests', 'rsvpStatus', 'respondedAt', 'actions'];

  constructor(
    private route: ActivatedRoute,
    private guestService: GuestService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.invitationId = this.route.snapshot.paramMap.get('invitationId');
    this.loadGuests();
  }

  loadGuests() {
    const request = this.invitationId
      ? this.guestService.getByInvitation(this.invitationId)
      : this.guestService.getAll();

    request.subscribe({
      next: (data) => {
        this.guests = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load guests', 'Close', { duration: 3000 });
      }
    });
  }

  getStatusCount(status: string): number {
    return this.guests.filter(g => g.rsvpStatus === status).length;
  }

  updateStatus(guest: Guest, status: Guest['rsvpStatus']) {
    this.guestService.updateRsvpStatus(guest._id!, status).subscribe({
      next: (updated) => {
        const index = this.guests.findIndex(g => g._id === guest._id);
        if (index !== -1) {
          this.guests[index] = updated;
        }
        this.snackBar.open('Status updated', 'Close', { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Failed to update status', 'Close', { duration: 3000 });
      }
    });
  }

  deleteGuest(guest: Guest) {
    if (confirm(`Are you sure you want to remove ${guest.name}?`)) {
      this.guestService.delete(guest._id!).subscribe({
        next: () => {
          this.guests = this.guests.filter(g => g._id !== guest._id);
          this.snackBar.open('Guest removed', 'Close', { duration: 2000 });
        },
        error: () => {
          this.snackBar.open('Failed to remove guest', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
