export type CanvasGridCellRenderFn = (
  params: CanvasGridCellRenderParams
) => void;

export interface CanvasGridCellRenderParams {
  context: CanvasRenderingContext2D;
  renderTextFn: (params: RenderTextParams) => void;
  cellIndex: number;
  cellRect: Rect;
  deltaTime: number;
  elapsedTime: number;
}

export interface RenderTextParams {
  text: string;
  font: string;
  color: string;
  cellRect: Rect;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
