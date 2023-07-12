import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { debounceTime, exhaustMap, fromEvent, Subject, takeUntil } from 'rxjs';
import { SolverAPIService } from 'src/app/services/solver/solver-api.service';
import { SolverStateService } from 'src/app/services/solver/solver-state.service';

@Component({
  selector: 'app-solver-solution-options',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSliderModule,
    MatInputModule,
  ],
  templateUrl: './solver-solution-options.component.html',
  styleUrls: ['./solver-solution-options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolverSolutionOptionsComponent
  implements AfterViewInit, OnDestroy
{
  @ViewChild('solveButton', { read: ElementRef }) solveButton!: ElementRef;

  private solverState = inject(SolverStateService);
  private apiService = inject(SolverAPIService);
  private destroy$ = new Subject<void>();

  solvingMethods = this.solverState.supportedSolvingMethods;
  selected = this.solverState.solvingMethod;
  allSolutions = this.solverState.findAllSolutions;
  timeout: number = this.solverState.timeout;
  problemName: string = this.solverState.problemName;

  ngAfterViewInit(): void {
    fromEvent(this.solveButton.nativeElement, 'click')
      .pipe(
        debounceTime(500),
        exhaustMap(() =>
          this.apiService.sendModel(this.solverState.serialize())
        ),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onChangedSolvingMethod(value: string) {
    this.solverState.solvingMethod = value;
  }

  onChangedAllSolutions(value: boolean) {
    this.solverState.findAllSolutions = value;
  }

  onChangedTimeout(value: number) {
    this.solverState.timeout = value;
  }

  onChangedProblemName(value: string) {
    this.solverState.problemName = value;
  }

  formatTimeoutLabel(value: number) {
    if (value >= 60) {
      return `${Math.round(value / 60)}m${value % 60}s`;
    }
    return `${value}s`;
  }
}
