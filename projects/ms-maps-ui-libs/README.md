# MS Maps UI Libs

An Angular library for interactive maps using OpenLayers. This library provides Angular components for displaying maps with WKT geometry support.

## Features

- 🗺️ Interactive OpenLayers-based maps
- 📍 WKT (Well-Known Text) geometry support
- 🎨 Customizable styling for points, lines, and polygons
- 📱 Responsive design
- 🔧 Easy integration with Angular applications
- 🚀 Both standalone and module-based usage

## Installation

In your consuming Angular project, install the library and its peer dependencies:

```bash
npm install ol @types/ol
```

Then install this library locally (since it's not published to npm yet):

```bash
npm install path/to/your/dist/ms-maps-ui-libs
```

## Usage

### Option 1: Using the Standalone Component (Recommended for Angular 14+)

```typescript
import { Component } from '@angular/core';
import { MapComponent } from 'ms-maps-ui-libs';

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
import { MsMapsUiLibsModule } from 'ms-maps-ui-libs';

@NgModule({
  imports: [
    // ... other imports
    MsMapsUiLibsModule
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
| `center` | `[number, number]` | `[0, 0]` | Initial center coordinates [longitude, latitude] |
| `borderColor` | `string` | `'rgba(0, 0, 255, 1)'` | Color for geometry borders/strokes |
| `fillColor` | `string` | `'rgba(255, 255, 255, 0.5)'` | Fill color for polygon geometries |
| `pointColor` | `string` | `'rgba(0, 0, 255, 1)'` | Color for point geometries |
| `pointBorderColor` | `string` | `'rgba(255, 255, 255, 1)'` | Border color for point geometries |

### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `updateWKT(wkt: string)` | `wkt`: WKT string | Programmatically update the displayed geometry |

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
ng build ms-maps-ui-libs
```

The built library will be available in `dist/ms-maps-ui-libs/`.

## Dependencies

- Angular 20.3.0+
- OpenLayers 10.6.1+
- TypeScript 5.9.2+

## License

MIT