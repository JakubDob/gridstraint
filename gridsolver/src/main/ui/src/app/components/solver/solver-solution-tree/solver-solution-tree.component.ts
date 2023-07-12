import { NestedTreeControl } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { Subject, takeUntil } from 'rxjs';
import {
  isSolution,
  isSolvedProblem,
  Solution,
  SolvedProblem,
} from 'src/app/interfaces/solver-model';
import { SolverStateService } from 'src/app/services/solver/solver-state.service';

interface SolutionNode {
  name: string;
  ref?: Solution | SolvedProblem;
  children?: SolutionNode[];
}

@Component({
  selector: 'app-solver-solution-tree',
  standalone: true,
  imports: [CommonModule, MatTreeModule, MatIconModule, MatButtonModule],
  templateUrl: './solver-solution-tree.component.html',
  styleUrls: ['./solver-solution-tree.component.scss'],
})
export class SolverSolutionTreeComponent implements OnInit, OnDestroy {
  private solverState = inject(SolverStateService);
  private destroy$ = new Subject<void>();
  dataSource = new MatTreeNestedDataSource<SolutionNode>();
  treeControl = new NestedTreeControl<SolutionNode>((node) => node.children);

  ngOnInit(): void {
    this.updateDataSource();

    this.solverState.problemSolved$
      .pipe(takeUntil(this.destroy$))
      .subscribe((solved: SolvedProblem) => {
        this.updateDataSource();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildTree(arr: Array<Solution | SolvedProblem>): SolutionNode[] {
    return arr.reduce<SolutionNode[]>((accumulator, value) => {
      if (isSolvedProblem(value)) {
        const node: SolutionNode = {
          name: value.name,
          children: this.buildTree(value.solutions),
          ref: value,
        };
        return accumulator.concat(node);
      } else {
        const node: SolutionNode = {
          name: value.name,
          ref: value,
        };
        return accumulator.concat(node);
      }
    }, []);
  }

  updateDataSource() {
    const rootNode: SolutionNode[] = [
      {
        name: 'solutions',
        children: this.buildTree(this.solverState.solvedProblems),
      },
    ];

    this.dataSource.data = rootNode;
    this.treeControl.dataNodes = rootNode;
    this.treeControl.expandAll();
  }

  hasNestedChild(index: number, node: SolutionNode) {
    if (node && node.children) {
      return node.children.length > 0;
    }
    return false;
  }

  onClickDelete(node: SolutionNode) {
    if (node.ref) {
      if (isSolvedProblem(node.ref)) {
        this.solverState.deleteSolvedProblem(node.ref);
      } else {
        const parent = node.ref.parent;
        this.solverState.deleteSolution(node.ref);
        if (parent.solutions.length === 0) {
          this.solverState.deleteSolvedProblem(parent);
        }
      }
    } else {
      this.solverState.solvedProblems.forEach((solved) =>
        this.solverState.deleteSolvedProblem(solved)
      );
    }
    this.updateDataSource();
  }

  onClickSolutionView(node: SolutionNode) {
    if (node.ref && isSolution(node.ref)) {
      this.solverState.activeSolution = node.ref;
    }
  }

  isContainerNode(node: SolutionNode) {
    return node.ref === undefined;
  }
}
