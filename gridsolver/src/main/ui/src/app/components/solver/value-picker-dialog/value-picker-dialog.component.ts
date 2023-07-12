import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-value-picker-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
  ],
  templateUrl: './value-picker-dialog.component.html',
  styleUrls: ['./value-picker-dialog.component.scss'],
})
export class ValuePickerDialogComponent {
  private dialogRef = inject(MatDialogRef<ValuePickerDialogComponent>);
  value: number | null = null;

  @HostListener('keypress', ['$event'])
  handleKeyEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.dialogRef.close(this.value);
    }
  }

  onCancelClick() {
    this.dialogRef.close();
  }

  onRemoveClick() {}
}
