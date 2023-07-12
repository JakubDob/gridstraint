import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  CountConstraintSettings,
  LabeledConstraintSettings,
  RelationSymbol,
} from 'src/app/interfaces/solver-model';

@Component({
  selector: 'app-count-constraint',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './count-constraint.component.html',
  styleUrls: ['./count-constraint.component.scss'],
})
export class CountConstraintComponent {
  private dialogRef = inject(
    MatDialogRef<LabeledConstraintSettings, CountConstraintComponent>
  );
  symbolIter = RelationSymbol;
  label = '';
  settings: CountConstraintSettings = {
    amount: 0,
    countedValue: 0,
    relation: RelationSymbol.EQUAL,
  };

  @HostListener('keypress', ['$event'])
  handleKeyEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onOKClick();
    }
  }

  onOKClick() {
    if (this.label.length === 0) {
      this.label = `count(${this.settings.countedValue}) ${this.settings.relation} ${this.settings.amount}`;
    }
    const ret: LabeledConstraintSettings = {
      label: this.label,
      settings: this.settings,
    };
    this.dialogRef.close(ret);
  }
}
