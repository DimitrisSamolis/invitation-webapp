import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { InvitationService } from '../../services/invitation.service';
import { Invitation } from '../../models/models';
import { AnimationCanvasComponent, AnimationType } from '../../components/animation-canvas/animation-canvas.component';
import { InvitationDetailsDialogComponent } from './invitation-details-dialog/invitation-details-dialog.component';
import { RsvpDialogComponent } from './rsvp-dialog/rsvp-dialog.component';

@Component({
  selector: 'app-invitation-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatDialogModule,
    AnimationCanvasComponent
  ],
  templateUrl: './invitation-view.component.html',
  styleUrl: './invitation-view.component.scss'
})
export class InvitationViewComponent implements OnInit {
  invitation: Invitation | null = null;
  loading = true;
  envelopeClicked = false;

  constructor(
    private route: ActivatedRoute,
    private invitationService: InvitationService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.invitationService.getById(id).subscribe({
        next: (data) => {
          this.invitation = data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  openDetailsDialog() {
    if (!this.invitation) return;
    this.envelopeClicked = true;

    const dialogRef = this.dialog.open(InvitationDetailsDialogComponent, {
      data: { invitation: this.invitation },
      panelClass: 'invitation-details-dialog-panel',
      maxWidth: '95vw',
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'rsvp') {
        this.openRsvpDialog();
      }
    });
  }

  openRsvpDialog() {
    if (!this.invitation) return;

    this.dialog.open(RsvpDialogComponent, {
      data: { invitation: this.invitation },
      panelClass: 'rsvp-dialog-panel',
      maxWidth: '95vw'
    });
  }

  getPrimaryColor(): string {
    return this.invitation?.customStyles?.primaryColor || '#667eea';
  }

  getAccentColor(): string {
    return this.invitation?.customStyles?.accentColor || '#764ba2';
  }

  getBackgroundImage(): string {
    if (this.invitation?.customStyles?.backgroundImage) {
      return `url('${this.invitation.customStyles.backgroundImage}')`;
    }
    return 'none';
  }

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

  getAnimation(): string {
    return this.invitation?.customStyles?.animation || 'none';
  }

  getAnimationType(): AnimationType {
    const anim = this.invitation?.customStyles?.animation;
    if (anim === 'confetti' || anim === 'hearts' || anim === 'balloons' ||
      anim === 'sparkles' || anim === 'stars' || anim === 'fireworks') {
      return anim;
    }
    return 'none';
  }

  // Text styling methods
  getTitleFont(): string {
    return this.invitation?.customStyles?.titleFont || 'Pacifico';
  }

  getTitleSize(): string {
    const size = this.invitation?.customStyles?.titleSize || '2.5';
    return `${size}rem`;
  }

  getTitleColor(): string {
    return this.invitation?.customStyles?.titleColor || '#ffffff';
  }

  getSubtitleFont(): string {
    return this.invitation?.customStyles?.subtitleFont || 'Roboto';
  }

  getSubtitleSize(): string {
    const size = this.invitation?.customStyles?.subtitleSize || '1.1';
    return `${size}rem`;
  }

  getSubtitleColor(): string {
    return this.invitation?.customStyles?.subtitleColor || '#ffffff';
  }
}