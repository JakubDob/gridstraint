import { CommonModule } from '@angular/common';
import { Component, inject, NgZone, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { GridDragEvent } from 'src/app/interfaces/events/grid-events';
import {
  CanvasGridCellRenderFn,
  CanvasGridCellRenderParams,
} from 'src/app/interfaces/grid-cell.model';
import {
  CellIndex,
  DisplayChangeEvent,
  DisplayTypeEnum,
  Group,
} from 'src/app/interfaces/solver-model';
import { SolverStateService } from 'src/app/services/solver/solver-state.service';
import { CanvasGridComponent } from '../../canvas-grid/canvas-grid.component';
import { ValuePickerDialogComponent } from '../value-picker-dialog/value-picker-dialog.component';

type Border = {
  style: string;
  color: string;
  width: number;
};
type TextStyle = {
  color: string;
  font: string;
};

@Component({
  selector: 'app-solver-grid',
  standalone: true,
  imports: [CommonModule, CanvasGridComponent, FormsModule, MatDialogModule],
  templateUrl: './solver-grid.component.html',
  styleUrls: ['./solver-grid.component.scss'],
})
export class SolverGridComponent implements OnDestroy {
  private ngZone = inject(NgZone);
  private isDragging: boolean = false;
  private defaultBackgroundColor = 'white';
  private solutionViewActive: boolean = false;
  private selectBorder: Border = {
    color: 'magenta',
    style: '',
    width: 4,
  };
  private valueTextStyle: TextStyle = {
    color: 'black',
    font: '2rem monospace',
  };
  private destroy$ = new Subject<void>();

  rows: number;
  cols: number;
  spacing = 2;
  fpsThrottle = 20;
  redraw: Boolean = false;
  dirtyIndices = new Set<number>();
  animationIndices = new Set<number>();

  cellRenderFn: CanvasGridCellRenderFn = (p: CanvasGridCellRenderParams) => {
    const group = this.solverState.activeView?.cellIndexToGroup.get(
      p.cellIndex
    );
    if (group) {
      if (group === this.solverState.activeGroup) {
        const centerX = p.cellRect.x + p.cellRect.w / 2;
        const centerY = p.cellRect.y + p.cellRect.h / 2;
        const radius = Math.min(p.cellRect.w, p.cellRect.h);
        const gradient = p.context.createRadialGradient(
          centerX,
          centerY,
          radius / 25,
          centerX,
          centerY,
          radius
        );
        const offset = (Math.sin(p.elapsedTime * 2) + 1) / 4;
        gradient.addColorStop(
          offset,
          this.solverState.activeGroup.backgroundColor
        );
        gradient.addColorStop(1, 'white');
        p.context.fillStyle = gradient;
      } else {
        p.context.fillStyle = group.backgroundColor;
      }
    } else {
      p.context.fillStyle = this.defaultBackgroundColor;
    }

    p.context.fillRect(p.cellRect.x, p.cellRect.y, p.cellRect.w, p.cellRect.h);

    if (p.cellIndex === this.solverState.activeCellIndex) {
      p.context.strokeStyle = this.selectBorder.color;
      p.context.lineWidth = this.selectBorder.width;
      p.context.strokeRect(
        p.cellRect.x + this.selectBorder.width / 2,
        p.cellRect.y + this.selectBorder.width / 2,
        p.cellRect.w - this.selectBorder.width,
        p.cellRect.h - this.selectBorder.width
      );
    }

    let value = this.solutionViewActive
      ? this.solverState.activeSolution?.values.at(p.cellIndex)
      : this.solverState.values.get(p.cellIndex);

    if (value === undefined) {
      value = '';
    }

    if (value) {
      p.renderTextFn({
        cellRect: p.cellRect,
        color: this.valueTextStyle.color,
        font: this.valueTextStyle.font,
        text: value,
      });
    }
  };

  constructor(
    private solverState: SolverStateService,
    private dialog: MatDialog
  ) {
    this.rows = solverState.gridSize.rows;
    this.cols = solverState.gridSize.cols;

    this.solverState.cellAddedToGroup$
      .pipe(takeUntil(this.destroy$))
      .subscribe((index) => {
        this.animationIndices.add(index);
      });

    this.solverState.cellRemovedFromGroup$
      .pipe(takeUntil(this.destroy$))
      .subscribe((index) => {
        this.animationIndices.delete(index);
      });

    this.solverState.groupDeleted$
      .pipe(takeUntil(this.destroy$))
      .subscribe((group) => {
        group.indices.forEach((index) => this.dirtyIndices.add(index));
      });

    this.solverState.displayChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: DisplayChangeEvent) => {
        if (event.type === DisplayTypeEnum.CELL_INDEX) {
          if (event.previous !== null) {
            this.dirtyIndices.add(event.previous as CellIndex);
          }
          if (event.current !== null) {
            this.dirtyIndices.add(event.current as CellIndex);
          }
          return;
        }
        if (event.type === DisplayTypeEnum.GROUP) {
          if (event.previous) {
            (event.previous as Group).indices.forEach((index) =>
              this.animationIndices.delete(index)
            );
          }
          if (event.current) {
            (event.current as Group).indices.forEach((index) =>
              this.animationIndices.add(index)
            );
          }
        }
        if (event.type === DisplayTypeEnum.SOLUTION) {
          this.solutionViewActive = true;
        } else {
          this.solutionViewActive = false;
        }
        this.redraw = new Boolean(true);
      });

    this.solverState.valueChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((index) => {
        this.dirtyIndices.add(index);
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onKeyDown(key: string) {
    const i = this.solverState.activeCellIndex;
    if (i !== null) {
      const oldValue = this.solverState.getValue(i);
      if (key >= '0' && key <= '9') {
        this.solverState.setValue(i, oldValue ? oldValue + key : key);
      } else if (key === 'Backspace') {
        const newValue = oldValue?.slice(0, -1);
        this.solverState.setValue(i, newValue ? newValue : null);
      }
    }
    if (i !== null && key >= '0' && key <= '9') {
    }
  }

  onClickCell(index: number) {
    if (this.solutionViewActive) {
      return;
    }
    if (!this.isDragging) {
      this.solverState.activeCellIndex = index;
    }
  }

  onDragCell(event: GridDragEvent) {
    if (this.solutionViewActive) {
      return;
    }
    this.isDragging = true;
    if (this.solverState.activeCellIndex === null) {
      this.solverState.activeCellIndex = event.from;
    } else if (this.solverState.activeCellIndex !== event.to) {
      this.solverState.activeCellIndex = event.to;
    }
  }

  onDropCell(index: number) {
    this.isDragging = false;
  }

  onDoubleClickCell(index: number) {
    if (this.solutionViewActive) {
      return;
    }

    this.ngZone.run(() => {
      const dialogRef = this.dialog.open(ValuePickerDialogComponent);
      dialogRef.afterClosed().subscribe((result: number | null) => {
        this.solverState.setValue(index, result?.toString() ?? null);
      });
    });
  }

  onRowsChange() {
    this.solverState.setRowCount(this.rows);
  }

  onColsChange() {
    this.solverState.setColCount(this.cols);
  }
}
