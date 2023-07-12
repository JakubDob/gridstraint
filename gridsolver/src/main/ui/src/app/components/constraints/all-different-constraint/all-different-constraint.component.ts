import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { LabeledConstraintSettings } from 'src/app/interfaces/solver-model';

@Component({
  selector: 'app-all-different-constraint',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './all-different-constraint.component.html',
  styleUrls: ['./all-different-constraint.component.scss'],
})
export class AllDifferentConstraintComponent {
  private dialogRef = inject(
    MatDialogRef<LabeledConstraintSettings, AllDifferentConstraintComponent>
  );
  label: string = 'default';

  @HostListener('keypress', ['$event'])
  handleKeyEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onOKClick();
    }
  }

  onOKClick() {
    this.dialogRef.close({ label: this.label });
  }
}
