export type Constraint = {
  name: string;
  views: View[];
};

export enum RelationSymbol {
  LESS_THAN = '<',
  LESS_OR_EQUAL = '<=',
  EQUAL = '=',
  GREATER_THAN = '>',
  GREATER_OR_EQUAL = '>=',
}

export type CountConstraintSettings = {
  relation: RelationSymbol;
  amount: number;
  countedValue: number;
};

export type AllDifferentConstraintSettings = {};

export type ConstraintSettings = CountConstraintSettings &
  AllDifferentConstraintSettings;

export type LabeledConstraintSettings = {
  settings?: ConstraintSettings;
  label: string;
};

export type View = {
  name: string;
  groups: Group[];
  cellIndexToGroup: Map<number, Group | null>;
  parent: Constraint;
  settings?: ConstraintSettings;
};

export type Group = {
  name: string;
  backgroundColor: string;
  indices: Set<number>;
  parent: View;
};

export type CellIndex = number;

export enum DisplayTypeEnum {
  CONSTRAINT,
  VIEW,
  GROUP,
  CELL_INDEX,
  SOLUTION,
}

export enum AggregateSolverTypeEnum {
  CONSTRAINT,
  VIEW,
  GROUP,
}

export type DisplayChangeEvent = {
  type: DisplayTypeEnum;
  previous: Display | null;
  current: Display | null;
};

export type SerializedSolverModel = {
  problemName: string;
  values: number[][];
  valueRange: ValueRange;
  gridSize: GridSize;
  solvingMethod: string;
  constraints: SerializedConstraint[];
  timeoutMs: number;
  allSolutions: boolean;
};

export type SerializedConstraint = {
  name: string;
  views: SerializedView[];
};

export type SerializedView = {
  indices: number[][];
  settings?: ConstraintSettings;
};

export type ValueRange = {
  min: number;
  max: number;
};

export type GridSize = {
  rows: number;
  cols: number;
};

export type Solution = {
  name: string;
  values: string[];
  parent: SolvedProblem;
};

export type SolvedProblem = {
  id: string;
  name: string;
  solutions: Solution[];
};

export type SolverOutput = {
  problemId: string;
  problemName: string;
  results?: string[][];
  errorMessage?: string;
  status?: string;
};

export type AggregateSolverType = Constraint | View | Group;
export type Display = AggregateSolverType | CellIndex;

export function isConstraint(x: AggregateSolverType): x is Constraint {
  return (x as Constraint).views !== undefined;
}

export function isView(x: AggregateSolverType): x is View {
  return (x as View).groups !== undefined;
}

export function isGroup(x: AggregateSolverType): x is Group {
  return (x as Group).indices !== undefined;
}

export function isSolvedProblem(
  x: SolvedProblem | Solution
): x is SolvedProblem {
  return (x as SolvedProblem).solutions !== undefined;
}

export function isSolution(x: SolvedProblem | Solution): x is Solution {
  return (x as Solution).values !== undefined;
}
