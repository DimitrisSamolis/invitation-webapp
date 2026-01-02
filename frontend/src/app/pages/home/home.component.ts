import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InvitationService } from '../../services/invitation.service';
import { AuthService } from '../../services/auth.service';
import { Invitation } from '../../models/models';
import { DatePipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, DatePipe, TitleCasePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  invitations: Invitation[] = [];
  loading = true;
  isLoggedIn: () => boolean;

  constructor(
    private invitationService: InvitationService,
    private authService: AuthService
  ) {
    this.isLoggedIn = this.authService.isLoggedIn;
  }

  ngOnInit() {
    if (this.isLoggedIn()) {
      this.loadInvitations();
    } else {
      this.loading = false;
    }
  }

  loadInvitations() {
    this.invitationService.getAll().subscribe({
      next: (data) => {
        this.invitations = data.filter(inv => inv.isActive);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
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
}
