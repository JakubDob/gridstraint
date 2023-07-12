import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Subject, takeUntil } from 'rxjs';
import { SolvedProblem } from 'src/app/interfaces/solver-model';
import { SolverAPIService } from 'src/app/services/solver/solver-api.service';
import { SolverStateService } from 'src/app/services/solver/solver-state.service';
import { ConstraintTreeComponent } from '../solver-constraint-tree/solver-constraint-tree.component';
import { SolverGridActionsComponent } from '../solver-grid-actions/solver-grid-actions.component';
import { SolverGridComponent } from '../solver-grid/solver-grid.component';
import { SolverSolutionOptionsComponent } from '../solver-solution-options/solver-solution-options.component';
import { SolverSolutionTreeComponent } from '../solver-solution-tree/solver-solution-tree.component';
import { SolverValueOptionsComponent } from '../solver-value-options/solver-value-options.component';

@Component({
  selector: 'app-solver-manager',
  standalone: true,
  imports: [
    CommonModule,
    SolverGridComponent,
    ConstraintTreeComponent,
    SolverValueOptionsComponent,
    SolverSolutionOptionsComponent,
    SolverGridActionsComponent,
    SolverSolutionTreeComponent,
    MatCardModule,
  ],
  templateUrl: './solver-manager.component.html',
  styleUrls: ['./solver-manager.component.scss'],
  providers: [SolverStateService],
})
export class SolverManagerComponent implements OnInit, OnDestroy {
  private apiService = inject(SolverAPIService);
  private solverState = inject(SolverStateService);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.apiService
      .connect()
      .pipe(takeUntil(this.destroy$))
      .subscribe((solved: SolvedProblem) => {
        this.solverState.addSolvedProblem(solved);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
