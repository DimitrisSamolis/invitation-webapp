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
  templateUrl: './invitations.component.html',
  styleUrl: './invitations.component.scss'
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
