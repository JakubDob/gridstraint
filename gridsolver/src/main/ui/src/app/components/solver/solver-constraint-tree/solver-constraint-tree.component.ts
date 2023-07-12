import { NestedTreeControl } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatTreeModule, MatTreeNestedDataSource } from '@angular/material/tree';
import { merge, Subject, take, takeUntil } from 'rxjs';
import {
  AggregateSolverType,
  AggregateSolverTypeEnum,
  isConstraint,
  isGroup,
  isView,
  LabeledConstraintSettings,
} from 'src/app/interfaces/solver-model';
import { SolverStateService } from 'src/app/services/solver/solver-state.service';
import { AllDifferentConstraintComponent } from '../../constraints/all-different-constraint/all-different-constraint.component';
import { CountConstraintComponent } from '../../constraints/count-constraint/count-constraint.component';

interface SolverNode {
  name: string;
  children?: SolverNode[];
  value?: AggregateSolverType;
  aggregateType?: AggregateSolverTypeEnum;
}

@Component({
  selector: 'app-solver-constraint-tree',
  standalone: true,
  imports: [
    CommonModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
  templateUrl: './solver-constraint-tree.component.html',
  styleUrls: ['./solver-constraint-tree.component.scss'],
})
export class ConstraintTreeComponent implements OnInit, OnDestroy {
  @ViewChild(MatMenuTrigger) menuTrigger?: MatMenuTrigger;

  private solverState = inject(SolverStateService);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();
  private nameToConstraintView = new Map<string, any>([
    ['alldifferent', AllDifferentConstraintComponent],
    ['count', CountConstraintComponent],
  ]);

  supportedConstraints: string[] = this.solverState.supportedConstraints;
  dataSource = new MatTreeNestedDataSource<SolverNode>();
  treeControl = new NestedTreeControl<SolverNode>((node) => node.children);

  ngOnInit(): void {
    this.updateDataSource();
    merge(this.solverState.groupAdded$, this.solverState.groupDeleted$)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateDataSource();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateDataSource() {
    const rootNode: SolverNode[] = [
      {
        name: 'constraints',
        aggregateType: AggregateSolverTypeEnum.CONSTRAINT,
        children: this.buildTree(this.solverState.constraints),
      },
    ];
    this.dataSource.data = rootNode;
    this.treeControl.dataNodes = rootNode;
    this.treeControl.expandAll();
  }

  private buildTree(arr: Array<AggregateSolverType>): SolverNode[] {
    return arr.reduce<SolverNode[]>((accumulator, value) => {
      if (isConstraint(value)) {
        const node: SolverNode = {
          name: value.name,
          value: value,
          children: [
            {
              name: 'views',
              aggregateType: AggregateSolverTypeEnum.VIEW,
              children: this.buildTree(value.views),
              value: value,
            },
          ],
        };
        return accumulator.concat(node);
      }
      if (isView(value)) {
        const node: SolverNode = {
          name: value.name,
          value: value,
          children: [
            {
              name: 'groups',
              aggregateType: AggregateSolverTypeEnum.GROUP,
              children: this.buildTree(value.groups),
              value: value,
            },
          ],
        };
        return accumulator.concat(node);
      }
      return accumulator.concat(<SolverNode>{
        name: value.name,
        value: value,
      });
    }, []);
  }

  hasNestedChild(index: number, node: SolverNode) {
    if (node && node.children) {
      return node.children.length > 0;
    }
    return false;
  }

  onClickNode(node: SolverNode, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (node.value) {
      if (isConstraint(node.value)) {
      } else if (isView(node.value)) {
        this.solverState.activeView = node.value;
      } else if (isGroup(node.value)) {
        this.solverState.activeGroup = node.value;
      }
    }
  }

  onConstraintMenuOptionClick(value: string) {
    this.solverState.addConstraint(value);
    this.updateDataSource();
  }

  private openConstraintMenu(event: MouseEvent) {
    this.menuTrigger?.menuOpened.pipe(take(1)).subscribe(() => {
      const menuElem = document.getElementsByClassName(
        'c-menu'
      )[0] as HTMLElement;

      const target = event.target as HTMLElement | null;
      if (menuElem && target) {
        const pos: DOMRect = target.getBoundingClientRect();
        menuElem.style.position = 'absolute';
        menuElem.style.top = `${pos.y + 50}px`;
        menuElem.style.left = `${pos.x}px`;
      }
    });
    this.menuTrigger?.openMenu();
  }

  onClickAdd(node: SolverNode, event: MouseEvent) {
    switch (node.aggregateType) {
      case AggregateSolverTypeEnum.CONSTRAINT: {
        this.openConstraintMenu(event);
        break;
      }
      case AggregateSolverTypeEnum.VIEW: {
        const parentConstraintName = node.value?.name;
        if (parentConstraintName) {
          const viewComponent =
            this.nameToConstraintView.get(parentConstraintName);
          if (viewComponent) {
            this.dialog
              .open(viewComponent)
              .afterClosed()
              .subscribe((settings: LabeledConstraintSettings | undefined) => {
                if (settings && node.value && isConstraint(node.value)) {
                  this.solverState.addView(
                    node.value,
                    settings.label,
                    settings.settings
                  );
                  this.updateDataSource();
                }
              });
          }
        }

        break;
      }
      case AggregateSolverTypeEnum.GROUP: {
        if (node.value && isView(node.value)) {
          this.solverState.addGroup(node.value);
        }
        break;
      }
    }
  }

  onClickDelete(node: SolverNode) {
    if (node.aggregateType === undefined) {
      if (node.value) {
        if (isConstraint(node.value)) {
          this.solverState.deleteConstraint(node.value);
        } else if (isView(node.value)) {
          this.solverState.deleteView(node.value);
        } else {
          this.solverState.deleteGroup(node.value);
        }
      }
    } else {
      switch (node.aggregateType) {
        case AggregateSolverTypeEnum.CONSTRAINT: {
          this.solverState.constraints.forEach((c) =>
            this.solverState.deleteConstraint(c)
          );
          break;
        }
        case AggregateSolverTypeEnum.VIEW: {
          node.children?.forEach((node) => {
            if (node.value && isView(node.value)) {
              this.solverState.deleteView(node.value);
            }
          });
          break;
        }
        case AggregateSolverTypeEnum.GROUP: {
          node.children?.forEach((node) => {
            if (node.value && isGroup(node.value)) {
              this.solverState.deleteGroup(node.value);
            }
          });
          break;
        }
      }
    }
    this.updateDataSource();
  }

  isContainerNode(node: SolverNode): boolean {
    return node.aggregateType !== undefined;
  }
  isView(node: SolverNode): boolean {
    if (node.value) {
      return isView(node.value);
    }
    return false;
  }
}
