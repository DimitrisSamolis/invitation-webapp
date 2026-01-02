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
  templateUrl: './themes.component.html',
  styleUrl: './themes.component.scss'
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
