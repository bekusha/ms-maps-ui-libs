# MS Maps Map Viewer

An Angular library for interactive maps using OpenLayers. This library provides Angular components for displaying maps with WKT geometry support.

## Features

- 🗺️ Interactive OpenLayers-based maps
- 📍 WKT (Well-Known Text) geometry support
- ✏️ Edit mode with drawing tools (Point, Line, Polygon)
- 🎨 Customizable styling for points, lines, and polygons
- 📱 Responsive design
- 🔧 Easy integration with Angular applications
- 🚀 Both standalone and module-based usage

## Installation

In your consuming Angular project, install the library and its peer dependencies:

```bash
npm install ms-maps-map-viewer @angular/common @angular/core ol
```

## Usage

### Option 1: Using the Standalone Component (Recommended for Angular 14+)

```typescript
import { Component } from '@angular/core';
import { MapComponent } from 'ms-maps-map-viewer';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [MapComponent],
  template: `
    <ms-map 
      [wkt]="geometryWkt"
      [center]="[longitude, latitude]"
      [zoom]="12"
      width="100%"
      height="500px"
      borderColor="rgba(255, 0, 0, 1)"
      fillColor="rgba(255, 0, 0, 0.2)">
    </ms-map>
  `
})
export class MyComponent {
  geometryWkt = 'POINT(-74.006 40.7128)'; // New York City
}
```

### Option 2: Using the Angular Module

```typescript
// In your app.module.ts or feature module
import { MsMapsMapViewerModule } from 'ms-maps-map-viewer';

@NgModule({
  imports: [
    // ... other imports
    MsMapsMapViewerModule
  ],
  // ...
})
export class AppModule { }
```

Then use in your component template:

```html
<ms-map 
  [wkt]="geometryWkt"
  [center]="[longitude, latitude]"
  [zoom]="12"
  width="100%"
  height="500px">
</ms-map>
```

## Component API

### Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `wkt` | `string` | `''` | Well-Known Text geometry string |
| `width` | `string` | `'100%'` | Map container width |
| `height` | `string` | `'400px'` | Map container height |
| `zoom` | `number` | `10` | Initial zoom level |
| `center` | `[number, number]` | `[44.7872, 41.7151]` | Initial center coordinates [longitude, latitude] (Tbilisi by default) |
| `borderColor` | `string` | `'rgba(0, 0, 255, 1)'` | Color for geometry borders/strokes |
| `fillColor` | `string` | `'rgba(255, 255, 255, 0.5)'` | Fill color for polygon geometries |
| `pointColor` | `string` | `'rgba(0, 0, 255, 1)'` | Color for point geometries |
| `pointBorderColor` | `string` | `'rgba(255, 255, 255, 1)'` | Border color for point geometries |
| `mode` | `MapMode` | `MapMode.VIEW` | Map mode: `VIEW` (display only) or `EDIT` (drawing enabled) |
| `editOptions` | `EditToolType[]` | `[EditToolType.POINT]` | Available drawing tools in edit mode: `POINT`, `LINE`, `POLYGON` |
| `mapConfigObject` | `Partial<MapConfig> \| null` | `null` | Advanced map configuration (e.g., custom base layer URL) |

### Outputs

| Event | Type | Description |
|-------|------|-------------|
| `geometryDrawn` | `EventEmitter<MapDrawEvent>` | Emitted when a geometry is drawn in edit mode. Contains `wkt` string and `tool` type. |

### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `updateWKT(wkt: string)` | `wkt`: WKT string | Programmatically update the displayed geometry |

## Edit Mode

The component supports two modes: `VIEW` (default) and `EDIT`. In edit mode, users can draw geometries directly on the map.

### Basic Edit Mode Usage

```typescript
import { Component } from '@angular/core';
import { MapComponent, MapMode, EditToolType, MapDrawEvent } from 'ms-maps-map-viewer';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [MapComponent],
  template: `
    <ms-map 
      [mode]="MapMode.EDIT"
      [editOptions]="[EditToolType.POINT, EditToolType.LINE, EditToolType.POLYGON]"
      (geometryDrawn)="onGeometryDrawn($event)"
      width="100%"
      height="500px">
    </ms-map>
  `
})
export class MyComponent {
  readonly MapMode = MapMode;
  readonly EditToolType = EditToolType;

  onGeometryDrawn(event: MapDrawEvent): void {
    console.log('Drawn geometry:', event.wkt);
    console.log('Tool used:', event.tool);
  }
}
```

### Edit Mode Features

- **Toolbar**: When multiple edit options are provided, a toolbar appears on the map with buttons to switch between tools
- **Auto-centering**: When entering edit mode, the map automatically centers on Tbilisi (44.7872, 41.7151)
- **Drawing**: Click on the map to start drawing. For polygons and lines, click to add points and double-click to finish
- **Event emission**: After completing a drawing, the `geometryDrawn` event is emitted with the WKT string

### Available Drawing Tools

- **POINT**: Draw single points
- **LINE**: Draw line strings (LINESTRING)
- **POLYGON**: Draw polygons

## Types and Enums

The library exports the following types and enums:

```typescript
import { 
  MapMode, 
  EditToolType, 
  MapDrawEvent, 
  MapConfig, 
  MapStyleConfig,
  WKTFeature 
} from 'ms-maps-map-viewer';

// Enums
enum MapMode {
  VIEW = 'VIEW',
  EDIT = 'EDIT'
}

enum EditToolType {
  POINT = 'POINT',
  LINE = 'LINE',
  POLYGON = 'POLYGON'
}

// Interfaces
interface MapDrawEvent {
  wkt: string;
  tool: EditToolType;
}

interface MapConfig {
  width: string;
  height: string;
  zoom: number;
  center: [number, number];
  attribution?: boolean;
  attributionCollapsible?: boolean;
  attributionCollapsed?: boolean;
  baseLayerUrlTpl?: string;
}
```

## WKT Examples

### Point
```typescript
wkt = 'POINT(-74.006 40.7128)';
```

### LineString
```typescript
wkt = 'LINESTRING(-74.006 40.7128, -73.935 40.730, -73.990 40.750)';
```

### Polygon
```typescript
wkt = 'POLYGON((-74.020 40.700, -74.000 40.700, -74.000 40.720, -74.020 40.720, -74.020 40.700))';
```

## Styling

The component includes OpenLayers CSS automatically. You can customize the appearance using the component's input properties for colors.

## Troubleshooting

### Map Not Visible

If the map is not visible in your consuming project, ensure:

1. **OpenLayers CSS is loaded**: The library includes OpenLayers CSS automatically, but make sure there are no CSS conflicts.

2. **Container has dimensions**: Ensure the parent container has defined width and height:
   ```css
   .map-container {
     width: 100%;
     height: 500px; /* Define explicit height */
   }
   ```

3. **Proper imports**: Make sure you're importing the component or module correctly.

4. **Peer dependencies**: Ensure `ol` and `@types/ol` are installed in your consuming project.

### Common Issues

- **Component not found**: Verify the import path and that the library is properly installed
- **Styling issues**: Check that there are no CSS conflicts with your global styles
- **WKT parsing errors**: Verify your WKT string is valid and properly formatted

## Development

To build the library:

```bash
ng build ms-maps-map-viewer
```

The built library will be available in `dist/ms-maps-map-viewer/`.

## Dependencies

- Angular 20.3.0+
- OpenLayers 10.6.1+
- TypeScript 5.9.2+

## License

MIT