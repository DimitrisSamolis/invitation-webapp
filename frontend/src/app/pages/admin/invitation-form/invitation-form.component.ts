import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { InvitationService } from '../../../services/invitation.service';
import { ThemeService } from '../../../services/theme.service';
import { Theme, Invitation } from '../../../models/models';
import { AnimationCanvasComponent } from '../../../components/animation-canvas/animation-canvas.component';

// Interface for built-in themes
interface BuiltInTheme {
  id: string;
  name: string;
  description: string;
  gradient: string;
  primaryColor: string;
  accentColor: string;
  animation: 'confetti' | 'hearts' | 'balloons' | 'sparkles' | 'stars' | 'fireworks';
}

@Component({
  selector: 'app-invitation-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatTooltipModule,
    MatTabsModule,
    MatDividerModule,
    ClipboardModule,
    MatDialogModule,
    DatePipe,
    AnimationCanvasComponent
  ],
  templateUrl: './invitation-form.component.html',
  styleUrl: './invitation-form.component.scss'
})
export class InvitationFormComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  invitationForm: FormGroup;
  themes: Theme[] = [];
  isEdit = false;
  saving = false;
  invitationId: string | null = null;
  createdInvitation: Invitation | null = null;

  // Image upload properties
  imageSourceMode: 'url' | 'upload' = 'url';
  imagePreview: string | null = null;
  isDragging = false;
  showPreview = true;
  previewDevice: 'desktop' | 'phone' = 'desktop';
  previewShowDetails = false;
  selectedBuiltInTheme: string | null = null;
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Built-in animated themes
  builtInThemes: { [eventType: string]: BuiltInTheme[] } = {
    wedding: [
      { id: 'romantic-rose', name: 'Romantic Rose', description: 'Floating hearts', gradient: 'linear-gradient(135deg, #e91e63 0%, #f8bbd9 100%)', primaryColor: '#e91e63', accentColor: '#f8bbd9', animation: 'hearts' },
      { id: 'elegant-gold', name: 'Elegant Gold', description: 'Golden sparkles', gradient: 'linear-gradient(135deg, #bf953f 0%, #fcf6ba 50%, #b38728 100%)', primaryColor: '#bf953f', accentColor: '#fcf6ba', animation: 'sparkles' },
      { id: 'classic-white', name: 'Classic White', description: 'Subtle stars', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', primaryColor: '#667eea', accentColor: '#764ba2', animation: 'stars' }
    ],
    birthday: [
      { id: 'party-confetti', name: 'Party Confetti', description: 'Colorful confetti', gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ffd93d 100%)', primaryColor: '#ff6b6b', accentColor: '#ffd93d', animation: 'confetti' },
      { id: 'balloon-fiesta', name: 'Balloon Fiesta', description: 'Flying balloons', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', primaryColor: '#ff6b95', accentColor: '#fed6e3', animation: 'balloons' },
      { id: 'cosmic-party', name: 'Cosmic Party', description: 'Starry night', gradient: 'linear-gradient(135deg, #0c0c3d 0%, #4a00e0 100%)', primaryColor: '#8e2de2', accentColor: '#4a00e0', animation: 'stars' },
      { id: 'candy-pop', name: 'Candy Pop', description: 'Sweet sparkles', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', primaryColor: '#ff9a9e', accentColor: '#fecfef', animation: 'sparkles' }
    ],
    corporate: [
      { id: 'professional-blue', name: 'Professional Blue', description: 'Elegant stars', gradient: 'linear-gradient(135deg, #1a237e 0%, #534bae 100%)', primaryColor: '#1a237e', accentColor: '#534bae', animation: 'stars' },
      { id: 'modern-slate', name: 'Modern Slate', description: 'Subtle sparkles', gradient: 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)', primaryColor: '#2c3e50', accentColor: '#4ca1af', animation: 'sparkles' }
    ],
    party: [
      { id: 'neon-nights', name: 'Neon Nights', description: 'Fireworks show', gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', primaryColor: '#ff00ff', accentColor: '#00ffff', animation: 'fireworks' },
      { id: 'disco-fever', name: 'Disco Fever', description: 'Party confetti', gradient: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)', primaryColor: '#fc466b', accentColor: '#3f5efb', animation: 'confetti' },
      { id: 'tropical-vibes', name: 'Tropical Vibes', description: 'Fun balloons', gradient: 'linear-gradient(135deg, #f857a6 0%, #ff5858 50%, #ffb347 100%)', primaryColor: '#f857a6', accentColor: '#ffb347', animation: 'balloons' },
      { id: 'retro-wave', name: 'Retro Wave', description: 'Synthwave sparkles', gradient: 'linear-gradient(135deg, #ff0084 0%, #33001b 100%)', primaryColor: '#ff0084', accentColor: '#33001b', animation: 'sparkles' }
    ],
    other: [
      { id: 'minimal-clean', name: 'Minimal Clean', description: 'Simple elegance', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', primaryColor: '#667eea', accentColor: '#764ba2', animation: 'stars' },
      { id: 'sunset-glow', name: 'Sunset Glow', description: 'Warm sparkles', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', primaryColor: '#fa709a', accentColor: '#fee140', animation: 'sparkles' },
      { id: 'cherry-blossom', name: 'Cherry Blossom', description: 'Floating petals', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', primaryColor: '#fcb69f', accentColor: '#ffecd2', animation: 'hearts' }
    ]
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private invitationService: InvitationService,
    private themeService: ThemeService,
    private snackBar: MatSnackBar,
    private clipboard: Clipboard,
    private dialog: MatDialog
  ) {
    this.invitationForm = this.fb.group({
      title: ['', Validators.required],
      eventType: ['wedding', Validators.required],
      eventDate: ['', Validators.required],
      eventTime: ['', Validators.required],
      venue: ['', Validators.required],
      venueAddress: ['', Validators.required],
      venueMapUrl: [''],
      description: [''],
      dressCode: [''],
      additionalInfo: [''],
      theme: [''],
      hostName: ['', Validators.required],
      hostContact: [''],
      hostEmail: [''],
      rsvpDeadline: [''],
      maxGuests: [''],
      isActive: [true],
      selectedThemeId: [''],
      spotifyPlaylistUrl: [''],
      customStyles: this.fb.group({
        primaryColor: ['#667eea'],
        accentColor: ['#764ba2'],
        backgroundImage: [''],
        animation: ['none']
      })
    });
  }

  ngOnInit() {
    this.loadThemes();

    this.invitationId = this.route.snapshot.paramMap.get('id');
    if (this.invitationId) {
      this.isEdit = true;
      this.loadInvitation();
    }
  }

  loadThemes() {
    this.themeService.getAll().subscribe({
      next: (data) => {
        this.themes = data;
      }
    });
  }

  loadInvitation() {
    if (!this.invitationId) return;

    this.invitationService.getById(this.invitationId).subscribe({
      next: (invitation) => {
        this.invitationForm.patchValue({
          ...invitation,
          eventDate: new Date(invitation.eventDate),
          rsvpDeadline: invitation.rsvpDeadline ? new Date(invitation.rsvpDeadline) : null
        });

        // Restore the selected built-in theme
        if (invitation.selectedThemeId) {
          this.selectedBuiltInTheme = invitation.selectedThemeId;
        }

        // Restore background image preview if exists
        if (invitation.customStyles?.backgroundImage) {
          this.imagePreview = invitation.customStyles.backgroundImage;
        }
      },
      error: () => {
        this.snackBar.open('Failed to load invitation', 'Close', { duration: 3000 });
        this.router.navigate(['/admin/invitations']);
      }
    });
  }

  getShareableLink(): string {
    if (!this.createdInvitation) return '';
    return `${window.location.origin}/invitation/${this.createdInvitation._id}`;
  }

  copyLink() {
    const link = this.getShareableLink();
    this.clipboard.copy(link);
    this.snackBar.open('Link copied to clipboard!', 'Close', { duration: 2000 });
  }

  onSubmit() {
    if (this.invitationForm.invalid) return;

    this.saving = true;
    const formData = this.invitationForm.value;

    // Generate slug from title
    formData.slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const request = this.isEdit
      ? this.invitationService.update(this.invitationId!, formData)
      : this.invitationService.create(formData);

    request.subscribe({
      next: (invitation) => {
        if (this.isEdit) {
          this.snackBar.open('Invitation updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/admin/invitations']);
        } else {
          // Show success card with shareable link
          this.createdInvitation = invitation;
          this.saving = false;
        }
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to save invitation', 'Close', { duration: 3000 });
        this.saving = false;
      }
    });
  }

  // Image source mode toggle
  setImageSourceMode(mode: 'url' | 'upload') {
    this.imageSourceMode = mode;
  }

  // File selection handler
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  // Drag and drop handlers
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  // Process the selected file
  private handleFile(file: File) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.snackBar.open('Please select an image file', 'Close', { duration: 3000 });
      return;
    }

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      this.snackBar.open('Image size must be less than 5MB', 'Close', { duration: 3000 });
      return;
    }

    // Read and convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      this.imagePreview = result;
      this.invitationForm.get('customStyles.backgroundImage')?.setValue(result);
    };
    reader.onerror = () => {
      this.snackBar.open('Failed to read image file', 'Close', { duration: 3000 });
    };
    reader.readAsDataURL(file);
  }

  // Remove background image
  removeBackgroundImage() {
    this.imagePreview = null;
    this.invitationForm.get('customStyles.backgroundImage')?.setValue('');
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // Preview toggle
  togglePreview() {
    this.showPreview = !this.showPreview;
  }

  // Set preview device type
  setPreviewDevice(device: 'desktop' | 'phone') {
    this.previewDevice = device;
  }

  // Get event icon for preview
  getEventIcon(eventType: string): string {
    const icons: { [key: string]: string } = {
      wedding: 'favorite',
      birthday: 'cake',
      corporate: 'business',
      party: 'celebration',
      other: 'event'
    };
    return icons[eventType] || 'event';
  }

  // Toggle preview details view
  togglePreviewDetails(): void {
    this.previewShowDetails = !this.previewShowDetails;
  }

  // Close preview details
  closePreviewDetails(): void {
    this.previewShowDetails = false;
  }

  // Preview color methods
  getPreviewPrimaryColor(): string {
    return this.invitationForm.get('customStyles.primaryColor')?.value || '#667eea';
  }

  getPreviewAccentColor(): string {
    return this.invitationForm.get('customStyles.accentColor')?.value || '#764ba2';
  }

  getPreviewBackgroundImage(): string {
    const bgImage = this.invitationForm.get('customStyles.backgroundImage')?.value;
    if (bgImage) {
      return `url('${bgImage}')`;
    }
    return 'none';
  }

  // Get themes for current event type
  getThemesForEventType(): BuiltInTheme[] {
    const eventType = this.invitationForm.get('eventType')?.value || 'wedding';
    return this.builtInThemes[eventType] || this.builtInThemes['other'];
  }

  // Handle event type change
  onEventTypeChange(eventType: string) {
    // Clear selected theme when event type changes
    this.selectedBuiltInTheme = null;
  }

  // Select a built-in theme (click again to deselect)
  selectBuiltInTheme(theme: BuiltInTheme) {
    if (this.selectedBuiltInTheme === theme.id) {
      // Deselect - reset to defaults
      this.selectedBuiltInTheme = null;
      this.invitationForm.patchValue({
        selectedThemeId: '',
        customStyles: {
          primaryColor: '#667eea',
          accentColor: '#764ba2',
          animation: 'none'
        }
      });
    } else {
      // Select the theme
      this.selectedBuiltInTheme = theme.id;
      this.invitationForm.patchValue({
        selectedThemeId: theme.id,
        customStyles: {
          primaryColor: theme.primaryColor,
          accentColor: theme.accentColor,
          animation: theme.animation
        }
      });
    }
  }

  // Get currently selected theme
  getSelectedTheme(): BuiltInTheme | null {
    if (!this.selectedBuiltInTheme) return null;
    const themes = this.getThemesForEventType();
    return themes.find(t => t.id === this.selectedBuiltInTheme) || null;
  }
}
