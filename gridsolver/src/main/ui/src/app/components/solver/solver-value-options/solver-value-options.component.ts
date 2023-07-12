import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { SolverStateService } from 'src/app/services/solver/solver-state.service';

@Component({
  selector: 'app-solver-value-options',
  standalone: true,
  imports: [CommonModule, MatInputModule, FormsModule, MatCardModule],
  templateUrl: './solver-value-options.component.html',
  styleUrls: ['./solver-value-options.component.scss'],
})
export class SolverValueOptionsComponent {
  private solverState = inject(SolverStateService);
  minValue: number = 0;
  maxValue: number = 10;
  selectedCell?: number;

  onMinValueChange(value: number) {
    this.solverState.valueRange.min = value;
  }

  onMaxValueChange(value: number) {
    this.solverState.valueRange.max = value;
  }

  onSelectedCellValueChange(value: number | null) {
    const cellIndex = this.solverState.activeCellIndex;
    if (cellIndex !== null) {
      this.solverState.setValue(
        cellIndex,
        value === null ? null : value.toString()
      );
    }
  }
}
