# MS Maps UI Library

A modern Angular library for integrating OpenLayers maps with WKT (Well-Known Text) geometry support.

[![npm version](https://badge.fury.io/js/ms-maps-ui-libs.svg)](https://badge.fury.io/js/ms-maps-ui-libs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🗺️ **Interactive Maps**: Built on OpenLayers 10.x for robust mapping capabilities
- 📐 **WKT Support**: Render POINT, LINESTRING, POLYGON, and other geometry types
- 🎨 **Customizable Styling**: Configure colors, borders, and styling for map features
- ⚡ **Angular 20+**: Modern Angular with standalone components and modern patterns
- 🔧 **TypeScript**: Full type safety with comprehensive interfaces
- 📱 **Responsive**: Flexible sizing and responsive design

## Installation

```bash
npm install ms-maps-ui-libs @angular/common @angular/core ol
```

### Peer Dependencies

Make sure you have the required peer dependencies installed:

```bash
npm install @angular/common@^20.3.0 @angular/core@^20.3.0 ol@^10.6.1
```

## Quick Start

### Basic Setup

1. Import the library module in your Angular application:

```typescript
import { MsMapsUiLibsModule } from 'ms-maps-ui-libs';

@NgModule({
  imports: [MsMapsUiLibsModule],
  // ... other module configuration
})
export class YourModule { }
```

2. Use the map component in your template:

```html
<ms-map 
  [wkt]="sampleWKT"
  [center]="[2.3522, 48.8566]"
  [zoom]="15"
  [width]="'100%'"
  [height]="'500px'">
</ms-map>
```

### Standalone Component Usage (Angular 14+)

```typescript
import { Component } from '@angular/core';
import { MapComponent } from 'ms-maps-ui-libs';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [MapComponent],
  template: `
    <ms-map 
      [wkt]="polygonWKT"
      [center]="[2.3522, 48.8566]"
      [zoom]="15"
      [width]="'100%'"
      [height]="'500px'"
      [borderColor]="'#ff0000'"
      [fillColor]="'rgba(255, 0, 0, 0.3)'">
    </ms-map>
  `
})
export class ExampleComponent {
  polygonWKT = 'POLYGON((2.3522 48.8566, 2.3522 48.8576, 2.3532 48.8576, 2.3532 48.8566, 2.3522 48.8566))';
}
```

## Component API

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `wkt` | `string` | `''` | WKT geometry string to render (single geometry). If `wktList` is provided, this is ignored. |
| `wktList` | `string[]` | `[]` | Array of WKT geometry strings to render multiple geometries. Takes priority over `wkt`. |
| `zoomToWkt` | `string` | `''` | WKT geometry string to zoom to without rendering. The map will automatically zoom to fit this geometry when the value changes. |
| `center` | `[number, number]` | `[0, 0]` | Map center coordinates [longitude, latitude] |
| `zoom` | `number` | `10` | Initial zoom level |
| `width` | `string` | `'100%'` | Map container width |
| `height` | `string` | `'400px'` | Map container height |
| `borderColor` | `string` | `'rgba(0, 0, 255, 1)'` | Border color for features |
| `fillColor` | `string` | `'rgba(255, 255, 255, 0.5)'` | Fill color for features |
| `pointColor` | `string` | `'rgba(0, 0, 255, 1)'` | Color for point features |
| `pointBorderColor` | `string` | `'rgba(255, 255, 255, 1)'` | Border color for point features |

### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `updateWKT(wkt: string)` | `wkt: WKT string` | Programmatically update the displayed geometry |

## Supported WKT Geometry Types

- `POINT`
- `LINESTRING`
- `POLYGON`
- `MULTIPOINT`
- `MULTILINESTRING`
- `MULTIPOLYGON`
- `GEOMETRYCOLLECTION`

## WKT Examples

### Single Geometry

```typescript
// Point
const pointWKT = 'POINT(-74.006 40.7128)';

// LineString
const lineWKT = 'LINESTRING(-74.006 40.7128, -73.935 40.730, -73.990 40.750)';

// Polygon
const polygonWKT = 'POLYGON((-74.020 40.700, -74.000 40.700, -74.000 40.720, -74.020 40.720, -74.020 40.700))';
```

### Multiple Geometries

You can render multiple geometries using the `wktList` input:

```typescript
@Component({
  template: `
    <ms-map [wktList]="geometries" [zoom]="12"></ms-map>
  `
})
export class MyComponent {
  geometries = [
    'POINT(-74.006 40.7128)',
    'POINT(-73.935 40.730)',
    'POLYGON((-74.020 40.700, -74.000 40.700, -74.000 40.720, -74.020 40.720, -74.020 40.700))'
  ];
}
```

**Note**: `wktList` takes priority over `wkt`. If both are provided, only `wktList` will be rendered.

## Browser Support

This library supports all modern browsers that are compatible with:
- Angular 20+
- OpenLayers 10.x
- ES2022

## Links

- **npm Package**: https://www.npmjs.com/package/ms-maps-ui-libs
- **GitLab Repository**: https://gitlab.municipal.gov.ge/map/ms-maps-ui-libs
- **Issues**: https://gitlab.municipal.gov.ge/map/ms-maps-ui-libs/-/issues

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request