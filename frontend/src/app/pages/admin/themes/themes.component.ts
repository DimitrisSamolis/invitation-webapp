import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { ThemeService } from '../../../services/theme.service';
import { Theme } from '../../../models/models';

@Component({
  selector: 'app-themes',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Theme Management</h1>
        <button mat-raised-button color="primary" (click)="showForm = !showForm">
          <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon>
          {{ showForm ? 'Cancel' : 'New Theme' }}
        </button>
      </div>

      @if (showForm) {
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>{{ editingTheme ? 'Edit' : 'Create' }} Theme</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="themeForm" (ngSubmit)="onSubmit()">
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Theme Name</mat-label>
                  <input matInput formControlName="name" placeholder="e.g., Elegant Gold">
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput formControlName="description" rows="2"></textarea>
                </mat-form-field>
              </div>

              <div class="form-row two-col">
                <mat-form-field appearance="outline">
                  <mat-label>Primary Color</mat-label>
                  <input matInput formControlName="primaryColor" type="color">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Accent Color</mat-label>
                  <input matInput formControlName="accentColor" type="color">
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Font Family</mat-label>
                  <input matInput formControlName="fontFamily" placeholder="e.g., 'Playfair Display', serif">
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Background Image URL (Optional)</mat-label>
                  <input matInput formControlName="backgroundImage">
                </mat-form-field>
              </div>

              <div class="button-row">
                <button mat-button type="button" (click)="cancelEdit()">Cancel</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="saving || themeForm.invalid">
                  @if (saving) {
                    <mat-spinner diameter="20"></mat-spinner>
                  } @else {
                    {{ editingTheme ? 'Update' : 'Create' }}
                  }
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      }

      @if (loading) {
        <div class="loading">
          <mat-spinner diameter="50"></mat-spinner>
        </div>
      } @else if (themes.length === 0) {
        <mat-card class="empty-state">
          <mat-card-content>
            <mat-icon>palette</mat-icon>
            <h2>No Themes Yet</h2>
            <p>Create custom themes for your invitations</p>
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="themes-grid">
          @for (theme of themes; track theme._id) {
            <mat-card class="theme-card">
              <div class="theme-preview" [style.background]="'linear-gradient(135deg, ' + theme.primaryColor + ' 0%, ' + theme.accentColor + ' 100%)'">
                <span [style.font-family]="theme.fontFamily">{{ theme.name }}</span>
              </div>
              <mat-card-content>
                <h3>{{ theme.name }}</h3>
                <p>{{ theme.description }}</p>
                <div class="color-swatches">
                  <span class="swatch" [style.background]="theme.primaryColor" title="Primary"></span>
                  <span class="swatch" [style.background]="theme.accentColor" title="Accent"></span>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button (click)="editTheme(theme)">
                  <mat-icon>edit</mat-icon>
                  Edit
                </button>
                <button mat-button color="warn" (click)="deleteTheme(theme)">
                  <mat-icon>delete</mat-icon>
                  Delete
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
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
    
    .form-card {
      margin-bottom: 24px;
    }
    
    form {
      padding-top: 16px;
    }
    
    .form-row {
      margin-bottom: 16px;
    }
    
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    
    .full-width {
      width: 100%;
    }
    
    mat-form-field {
      width: 100%;
    }
    
    .button-row {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
    }
    
    .loading, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 20px;
      text-align: center;
    }
    
    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
    }
    
    .themes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }
    
    .theme-card {
      overflow: hidden;
    }
    
    .theme-preview {
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    
    .theme-card h3 {
      margin: 16px 0 8px;
    }
    
    .theme-card p {
      color: #666;
      font-size: 0.9rem;
      margin: 0;
    }
    
    .color-swatches {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }
    
    .swatch {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
  `]
})
export class ThemesComponent implements OnInit {
  themes: Theme[] = [];
  loading = true;
  saving = false;
  showForm = false;
  editingTheme: Theme | null = null;
  themeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private themeService: ThemeService,
    private snackBar: MatSnackBar
  ) {
    this.themeForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      primaryColor: ['#667eea', Validators.required],
      accentColor: ['#764ba2', Validators.required],
      fontFamily: ['Roboto, sans-serif'],
      backgroundImage: [''],
      isDefault: [false]
    });
  }

  ngOnInit() {
    this.loadThemes();
  }

  loadThemes() {
    this.themeService.getAll().subscribe({
      next: (data) => {
        this.themes = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load themes', 'Close', { duration: 3000 });
      }
    });
  }

  editTheme(theme: Theme) {
    this.editingTheme = theme;
    this.themeForm.patchValue(theme);
    this.showForm = true;
  }

  cancelEdit() {
    this.editingTheme = null;
    this.themeForm.reset({
      primaryColor: '#667eea',
      accentColor: '#764ba2',
      fontFamily: 'Roboto, sans-serif'
    });
    this.showForm = false;
  }

  onSubmit() {
    if (this.themeForm.invalid) return;

    this.saving = true;
    const formData = this.themeForm.value;

    const request = this.editingTheme
      ? this.themeService.update(this.editingTheme._id!, formData)
      : this.themeService.create(formData);

    request.subscribe({
      next: (theme) => {
        if (this.editingTheme) {
          const index = this.themes.findIndex(t => t._id === this.editingTheme!._id);
          if (index !== -1) {
            this.themes[index] = theme;
          }
        } else {
          this.themes.push(theme);
        }
        this.snackBar.open(`Theme ${this.editingTheme ? 'updated' : 'created'}`, 'Close', { duration: 2000 });
        this.cancelEdit();
        this.saving = false;
      },
      error: () => {
        this.snackBar.open('Failed to save theme', 'Close', { duration: 3000 });
        this.saving = false;
      }
    });
  }

  deleteTheme(theme: Theme) {
    if (confirm(`Delete theme "${theme.name}"?`)) {
      this.themeService.delete(theme._id!).subscribe({
        next: () => {
          this.themes = this.themes.filter(t => t._id !== theme._id);
          this.snackBar.open('Theme deleted', 'Close', { duration: 2000 });
        },
        error: () => {
          this.snackBar.open('Failed to delete theme', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
