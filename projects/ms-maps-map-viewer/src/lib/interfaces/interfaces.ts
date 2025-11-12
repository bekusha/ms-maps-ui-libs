export interface MapConfig {
  width: string;
  height: string;
  zoom: number;
  center: [number, number]; // [longitude, latitude]
  attribution?: boolean;
  attributionCollapsible?: boolean;
  attributionCollapsed?: boolean;
  baseLayerUrlTpl?: string; // Custom base layer URL template
}

export interface MapStyleConfig {
  borderColor: string;
  fillColor: string;
  pointColor: string;
  pointBorderColor: string;
  pointRadius?: number;
  strokeWidth?: number;
}

export interface MapViewOptions {
  padding?: [number, number, number, number];
  maxZoom?: number;
  duration?: number;
}

export interface WKTFeature {
  wkt: string;
  dataProjection?: string;
  featureProjection?: string;
}

export enum MapMode {
  VIEW = 'VIEW',
  EDIT = 'EDIT'
}

export enum EditToolType {
  POINT = 'POINT',
  LINE = 'LINE',
  POLYGON = 'POLYGON'
}

export interface MapDrawEvent {
  wkt: string;
  tool: EditToolType;
}
