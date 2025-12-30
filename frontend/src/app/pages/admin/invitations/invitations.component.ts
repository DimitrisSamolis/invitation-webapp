import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { InvitationService } from '../../../services/invitation.service';
import { Invitation } from '../../../models/models';

@Component({
  selector: 'app-invitations',
  standalone: true,
  imports: [
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    ClipboardModule,
    DatePipe,
    TitleCasePipe
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Invitations</h1>
        <a mat-raised-button color="primary" routerLink="/admin/invitations/new">
          <mat-icon>add</mat-icon>
          New Invitation
        </a>
      </div>

      @if (loading) {
        <div class="loading">
          <mat-spinner diameter="50"></mat-spinner>
        </div>
      } @else if (invitations.length === 0) {
        <mat-card class="empty-state">
          <mat-card-content>
            <mat-icon>mail_outline</mat-icon>
            <h2>No Invitations Yet</h2>
            <p>Create your first invitation to get started</p>
            <a mat-raised-button color="primary" routerLink="/admin/invitations/new">
              Create Invitation
            </a>
          </mat-card-content>
        </mat-card>
      } @else {
        <mat-card>
          <table mat-table [dataSource]="invitations" class="full-width">
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Title</th>
              <td mat-cell *matCellDef="let inv">{{ inv.title }}</td>
            </ng-container>

            <ng-container matColumnDef="eventType">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let inv">{{ inv.eventType | titlecase }}</td>
            </ng-container>

            <ng-container matColumnDef="eventDate">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let inv">{{ inv.eventDate | date:'mediumDate' }}</td>
            </ng-container>

            <ng-container matColumnDef="venue">
              <th mat-header-cell *matHeaderCellDef>Address</th>
              <td mat-cell *matCellDef="let inv">{{ inv.venue }}</td>
            </ng-container>

            <ng-container matColumnDef="isActive">
              <th mat-header-cell *matHeaderCellDef>Active</th>
              <td mat-cell *matCellDef="let inv">
                <mat-slide-toggle 
                  [checked]="inv.isActive" 
                  (change)="toggleActive(inv)"
                  color="primary">
                </mat-slide-toggle>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let inv">
                <button mat-icon-button (click)="copyLink(inv)" matTooltip="Copy Shareable Link" color="primary">
                  <mat-icon>share</mat-icon>
                </button>
                <a mat-icon-button [routerLink]="['/invitation', inv._id]" matTooltip="Preview" target="_blank">
                  <mat-icon>visibility</mat-icon>
                </a>
                <a mat-icon-button [routerLink]="['/admin/guests', inv._id]" matTooltip="Manage Guests">
                  <mat-icon>people</mat-icon>
                </a>
                <a mat-icon-button [routerLink]="['/admin/invitations/edit', inv._id]" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </a>
                <button mat-icon-button color="warn" (click)="deleteInvitation(inv)" matTooltip="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
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
    
    .empty-state h2 {
      margin: 16px 0 8px;
    }
    
    .empty-state p {
      color: #666;
      margin-bottom: 20px;
    }
    
    .full-width {
      width: 100%;
    }
    
    table {
      width: 100%;
    }
    
    th.mat-header-cell {
      font-weight: 600;
    }
  `]
})
export class InvitationsComponent implements OnInit {
  invitations: Invitation[] = [];
  loading = true;
  displayedColumns = ['title', 'eventType', 'eventDate', 'venue', 'isActive', 'actions'];

  constructor(
    private invitationService: InvitationService,
    private snackBar: MatSnackBar,
    private clipboard: Clipboard
  ) { }

  ngOnInit() {
    this.loadInvitations();
  }

  loadInvitations() {
    this.invitationService.getAll().subscribe({
      next: (data) => {
        this.invitations = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load invitations', 'Close', { duration: 3000 });
      }
    });
  }

  copyLink(invitation: Invitation) {
    const link = `${window.location.origin}/invitation/${invitation._id}`;
    this.clipboard.copy(link);
    this.snackBar.open('Shareable link copied to clipboard!', 'Close', { duration: 2000 });
  }

  toggleActive(invitation: Invitation) {
    this.invitationService.toggleActive(invitation._id!, !invitation.isActive).subscribe({
      next: (updated) => {
        const index = this.invitations.findIndex(i => i._id === invitation._id);
        if (index !== -1) {
          this.invitations[index] = updated;
        }
      },
      error: () => {
        this.snackBar.open('Failed to update invitation', 'Close', { duration: 3000 });
      }
    });
  }

  deleteInvitation(invitation: Invitation) {
    if (confirm(`Are you sure you want to delete "${invitation.title}"?`)) {
      this.invitationService.delete(invitation._id!).subscribe({
        next: () => {
          this.invitations = this.invitations.filter(i => i._id !== invitation._id);
          this.snackBar.open('Invitation deleted', 'Close', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Failed to delete invitation', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
