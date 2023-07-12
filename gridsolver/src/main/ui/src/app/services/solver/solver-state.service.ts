import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {
  CellIndex,
  Constraint,
  ConstraintSettings,
  DisplayChangeEvent,
  DisplayTypeEnum,
  GridSize,
  Group,
  SerializedConstraint,
  SerializedSolverModel,
  Solution,
  SolvedProblem,
  ValueRange,
  View,
} from 'src/app/interfaces/solver-model';

@Injectable({
  providedIn: 'root',
})
export class SolverStateService {
  private _constraints: Constraint[] = [];
  private _values: Map<number, string> = new Map();
  private _solvedProblems: SolvedProblem[] = [];
  private _activeView: View | null = null;
  private _activeGroup: Group | null = null;
  private _activeCellIndex: CellIndex | null = null;
  private _activeSolution: Solution | null = null;
  private _ereaserActive: boolean = false;
  private _gridSize: GridSize = { rows: 9, cols: 9 };
  private _supportedConstraints: string[] = ['alldifferent', 'count'];
  private _supportedSolvingMethods: string[] = [
    'satisfy',
    'minimize',
    'maximize',
  ];
  private _valueRange: ValueRange = { min: 0, max: 10 };
  private _solvingMethod: string = 'satisfy';
  private _findAllSolutions: boolean = false;
  private _timeout: number = 5;
  private _problemName: string = '';

  private _displayChangeSubject = new Subject<DisplayChangeEvent>();
  private _cellAddedToGroupSubject = new Subject<CellIndex>();
  private _cellRemovedFromGroupSubject = new Subject<CellIndex>();
  private _deleteGroupSubject = new Subject<Group>();
  private _addGroupSubject = new Subject<Group>();
  private _problemSolvedSubject = new Subject<SolvedProblem>();
  private _valueChangeSubject = new Subject<CellIndex>();

  displayChange$ = this._displayChangeSubject.asObservable();
  cellAddedToGroup$ = this._cellAddedToGroupSubject.asObservable();
  cellRemovedFromGroup$ = this._cellRemovedFromGroupSubject.asObservable();
  groupDeleted$ = this._deleteGroupSubject.asObservable();
  groupAdded$ = this._addGroupSubject.asObservable();
  problemSolved$ = this._problemSolvedSubject.asObservable();
  valueChanged$ = this._valueChangeSubject.asObservable();

  addSolvedProblem(solved: SolvedProblem) {
    this._solvedProblems.push(solved);
    this._problemSolvedSubject.next(solved);
  }

  toggleEreaser() {
    this._ereaserActive = !this._ereaserActive;
  }

  setValue(index: number, value: string | null) {
    if (value === null) {
      this._values.delete(index);
    } else {
      this.values.set(index, value);
    }
    this._valueChangeSubject.next(index);
  }

  getValue(index: number) {
    return this.values.get(index);
  }

  get problemName() {
    return this._problemName;
  }

  set problemName(name: string) {
    this._problemName = name;
  }

  set activeSolution(solution: Solution | null) {
    this._activeSolution = solution;
    this.activeView = null;
    this.activeCellIndex = null;
    this._displayChangeSubject.next({
      current: null,
      previous: null,
      type: DisplayTypeEnum.SOLUTION,
    });
  }

  get timeout() {
    return this._timeout;
  }

  set timeout(value: number) {
    this._timeout = value;
  }

  get activeSolution() {
    return this._activeSolution;
  }

  get solvedProblems() {
    return this._solvedProblems;
  }

  get findAllSolutions() {
    return this._findAllSolutions;
  }

  set findAllSolutions(value: boolean) {
    this._findAllSolutions = value;
  }

  get solvingMethod() {
    return this._solvingMethod;
  }

  get supportedSolvingMethods() {
    return this._supportedSolvingMethods;
  }

  set solvingMethod(method: string) {
    if (!this._supportedSolvingMethods.includes(method)) {
      throw Error(`${method} is not supported`);
    }
    this._solvingMethod = method;
  }

  set valueRange(value: ValueRange) {
    this._valueRange = value;
  }

  get valueRange() {
    return this._valueRange;
  }

  get supportedConstraints() {
    return this._supportedConstraints;
  }

  get gridSize() {
    return this._gridSize;
  }

  set gridSize(size: GridSize) {
    this._gridSize = { ...size };
  }

  setRowCount(rows: number) {
    this._gridSize.rows = rows;
  }

  setColCount(cols: number) {
    this._gridSize.cols = cols;
  }

  get ereaserActive() {
    return this._ereaserActive;
  }

  get values(): Map<number, string> {
    return this._values;
  }

  get constraints(): Constraint[] {
    return this._constraints;
  }

  get activeView(): View | null {
    return this._activeView;
  }

  get activeGroup(): Group | null {
    return this._activeGroup;
  }

  get activeCellIndex(): number | null {
    return this._activeCellIndex;
  }

  set activeView(view: View | null) {
    this.setActiveViewImpl(view);
    this.setActiveGroupImpl(null);
    this.activeCellIndex = null;
  }

  private setActiveViewImpl(view: View | null) {
    this._displayChangeSubject.next({
      current: view,
      previous: this._activeView,
      type: DisplayTypeEnum.VIEW,
    });
    this._activeView = view;
  }

  private setActiveGroupImpl(group: Group | null) {
    this._displayChangeSubject.next({
      current: group,
      previous: this._activeGroup,
      type: DisplayTypeEnum.GROUP,
    });
    this._activeGroup = group;
  }

  set activeGroup(group: Group | null) {
    if (group === this.activeGroup) {
      return;
    }
    this.setActiveGroupImpl(group);
    if (group) {
      this.setActiveViewImpl(group.parent);
    }
    this.activeCellIndex = null;
  }

  set activeCellIndex(index: number | null) {
    this._displayChangeSubject.next({
      current: index,
      previous: this._activeCellIndex,
      type: DisplayTypeEnum.CELL_INDEX,
    });
    this._activeCellIndex = index;

    if (index !== null) {
      if (this._ereaserActive) {
        this.removeCellIndexFromGroup(index);
        this.values.delete(index);
      } else {
        if (this.activeGroup) {
          this.addCellIndexToGroup(this.activeGroup, index);
        }
      }
    }
  }

  deleteSolution(solution: Solution) {
    if (this._activeSolution === solution) {
      this.activeSolution = null;
    }
    solution.parent.solutions = solution.parent.solutions.filter(
      (s) => s !== solution
    );
  }

  deleteSolvedProblem(solved: SolvedProblem) {
    solved.solutions.forEach((solution) => this.deleteSolution(solution));
    this._solvedProblems = this._solvedProblems.filter((p) => p !== solved);
  }

  addConstraint(name: string): Constraint | null {
    if (!this._constraints.find((value) => value.name === name)) {
      const constraint: Constraint = { name: name, views: [] };
      this._constraints.push(constraint);
      return constraint;
    }
    return null;
  }

  addView(
    constraint: Constraint,
    name: string,
    settings?: ConstraintSettings
  ): View {
    const view: View = {
      cellIndexToGroup: new Map(),
      groups: [],
      name: name,
      parent: constraint,
      settings: settings,
    };
    constraint.views.push(view);
    return view;
  }

  addGroup(view: View) {
    const group: Group = {
      indices: new Set(),
      backgroundColor: this.getRandomColor(),
      name: view.name + ' | group',
      parent: view,
    };
    view.groups.push(group);
    this._addGroupSubject.next(group);
  }

  addGroupToActiveView(indices: Set<number>) {
    const view = this.activeView;
    if (view) {
      const group: Group = {
        indices: new Set(),
        backgroundColor: this.getRandomColor(),
        name: view.name + ' | group',
        parent: view,
      };

      view.groups.push(group);
      indices.forEach((i) => this.addCellIndexToGroup(group, i));
      this._addGroupSubject.next(group);
    }
  }

  addCellIndexToGroup(group: Group, cellIndex: number) {
    group.parent.cellIndexToGroup.get(cellIndex)?.indices.delete(cellIndex);
    group.parent.cellIndexToGroup.set(cellIndex, group);
    group.indices.add(cellIndex);
    this._cellAddedToGroupSubject.next(cellIndex);
  }

  removeCellIndexFromGroup(cellIndex: number) {
    const view = this.activeView;
    if (view) {
      view.cellIndexToGroup.get(cellIndex)?.indices.delete(cellIndex);
      view.cellIndexToGroup.delete(cellIndex);
      this._cellRemovedFromGroupSubject.next(cellIndex);
    }
  }

  deleteConstraint(constraint: Constraint) {
    if (this._activeView?.parent === constraint) {
      this.activeView = null;
    }
    this._constraints = this._constraints.filter((c) => c !== constraint);
  }

  deleteView(view: View) {
    if (view === this.activeView) {
      this.activeView = null;
    }
    const index = view.parent.views.indexOf(view);
    if (index >= 0) {
      const groups = [...view.groups];
      groups.forEach((g) => this.deleteGroup(g));
      view.parent.views.splice(index, 1);
    }
  }

  deleteGroup(group: Group) {
    if (group === this.activeGroup) {
      this.activeGroup = null;
    }
    const index = group.parent.groups.indexOf(group);
    if (index >= 0) {
      group.indices.forEach((index) =>
        group.parent.cellIndexToGroup.delete(index)
      );
      group.parent.groups.splice(index, 1);
      this._deleteGroupSubject.next(group);
    }
  }

  deleteEmptyGroups(view: View) {
    const empty: Group[] = [];
    view.groups.forEach((g) => g.indices.size === 0 && empty.push(g));
    empty.forEach((g) => this.deleteGroup(g));
  }

  changeActiveView(view?: View) {
    if (view) {
      this.activeView = view;
    }
  }

  changeActiveGroup(group?: Group) {
    if (group) {
      this.activeGroup = group;
    }
  }

  private getRandomColor() {
    return `rgb(${Math.random() * 255} ${Math.random() * 255} ${
      Math.random() * 255
    })`;
  }

  serialize(): SerializedSolverModel {
    const model: SerializedSolverModel = {
      problemName: this.problemName,
      timeoutMs: this.timeout * 1000,
      allSolutions: this.findAllSolutions,
      constraints: this.constraints.map<SerializedConstraint>((constraint) => {
        return {
          name: constraint.name,
          views: constraint.views.map((view) => {
            return {
              indices: view.groups.reduce<number[][]>((accumulator, group) => {
                if (group.indices.size > 0) {
                  accumulator.push(Array.from(group.indices));
                }
                return accumulator;
              }, []),
              settings: view.settings,
            };
          }),
        };
      }),
      gridSize: this.gridSize,
      valueRange: this.valueRange,
      solvingMethod: this.solvingMethod,
      values: Array.from(this.values.entries()).map(([index, value]) => [
        index,
        Number(value),
      ]),
    };
    return model;
  }
}
