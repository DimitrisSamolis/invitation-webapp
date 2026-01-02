import { Component, Inject } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Invitation } from '../../../models/models';

@Component({
  selector: 'app-invitation-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    DatePipe,
    TitleCasePipe
  ],
  templateUrl: './invitation-details-dialog.component.html',
  styleUrl: './invitation-details-dialog.component.scss'
})
export class InvitationDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<InvitationDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { invitation: Invitation }
  ) { }

  getEventIcon(eventType: string): string {
    const icons: Record<string, string> = {
      wedding: 'favorite',
      birthday: 'cake',
      corporate: 'business',
      party: 'celebration',
      other: 'event'
    };
    return icons[eventType] || 'event';
  }

  onRsvpClick() {
    this.dialogRef.close('rsvp');
  }
}
