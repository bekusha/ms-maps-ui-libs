import { Component, signal, OnInit } from '@angular/core';
import { MapMode, EditToolType, MapDrawEvent, MapConfig } from 'ms-maps-map-viewer';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App implements OnInit{
  protected readonly title = signal('testing-libs-app');

  public wktGeometry = signal<string | null>(null); 
  public wktList = signal<string[]>([]);
  public useWktList = signal<boolean>(false);
  public mapConfig = signal<Partial<MapConfig> | null>(null);
  public mapMode = signal<MapMode>(MapMode.EDIT);
  public readonly MapMode = MapMode;
  public readonly EditToolType = EditToolType;
  // latest draw event from the map component
  public geometryDrawnEvent = signal<MapDrawEvent | null>(null);
  
  public handleGeometryDrawn(event: MapDrawEvent): void {
    this.geometryDrawnEvent.set(event);
    this.wktGeometry.set(event.wkt);
  }
  
  // Default WKT data
  public defaultSingleWkt = 'POLYGON((44.79605 41.72667, 44.79520 41.72742, 44.79345 41.72699, 44.79395 41.72602, 44.79605 41.72667))';
  
  public defaultWktList = [
    'POINT(44.7872 41.7151)', // Tbilisi center
    'POINT(44.8 41.72)', // Nearby point
    'POINT(44.77 41.71)', // Another nearby point
    'LINESTRING(44.78 41.71, 44.79 41.72, 44.80 41.71)', // Line
    'POLYGON((44.79 41.72, 44.80 41.72, 44.80 41.73, 44.79 41.73, 44.79 41.72))', // Square 1
    'POLYGON((44.76 41.71, 44.77 41.71, 44.77 41.72, 44.76 41.72, 44.76 41.71))', // Square 2
    'POLYGON((44.81 41.71, 44.82 41.71, 44.82 41.72, 44.81 41.72, 44.81 41.71))' // Square 3
  ];

  public scatteredWktList = [
    // Tbilisi, Georgia
    'POINT(44.7872 41.7151)',
    'POLYGON((44.79 41.72, 44.80 41.72, 44.80 41.73, 44.79 41.73, 44.79 41.72))',
    
    // New York, USA
    'POINT(-74.006 40.7128)',
    'POLYGON((-74.02 40.70, -74.00 40.70, -74.00 40.72, -74.02 40.72, -74.02 40.70))',

    // London, UK
    'POINT(-0.1276 51.5074)',
    'LINESTRING(-0.13 51.50, -0.12 51.51, -0.11 51.50)',

    // Tokyo, Japan
    'POINT(139.6917 35.6895)',
    'POLYGON((139.68 35.68, 139.70 35.68, 139.70 35.70, 139.68 35.70, 139.68 35.68))',
    
    // Sydney, Australia
    'POINT(151.2093 -33.8688)',
    'LINESTRING(151.20 -33.87, 151.21 -33.86, 151.22 -33.87)',

    // Cairo, Egypt
    'POINT(31.2357 30.0444)',
    'POLYGON((31.23 30.04, 31.24 30.04, 31.24 30.05, 31.23 30.05, 31.23 30.04))'
  ];
  
  ngOnInit() {
    // Since useWktList defaults to false, start with single WKT
    this.wktGeometry.set(this.defaultSingleWkt);
    this.wktList.set([]);
  }

  public copyWKTToClipboard(): void {
    navigator.clipboard.writeText(this.wktGeometry() || '');
  }

  public toggleMapMode(): void {
    this.mapMode.set(
      this.mapMode() === MapMode.VIEW ? MapMode.EDIT : MapMode.VIEW
    );
  }

  public clearGeometry(): void {
    this.wktGeometry.set(null);
    this.wktList.set([]);
    this.geometryDrawnEvent.set(null);
  }

  public toggleWktMode(): void {
    const newMode = !this.useWktList();
    this.useWktList.set(newMode);
    
    // Set appropriate default data based on mode
    if (newMode) {
      // Switching to list mode - clear single WKT and load default list
      this.wktGeometry.set(null);
      this.wktList.set([...this.defaultWktList]);
    } else {
      // Switching to single mode - clear list and load default single WKT
      this.wktList.set([]);
      this.wktGeometry.set(this.defaultSingleWkt);
    }
  }

  // public loadExampleWktList(): void {
  //   // Ensure we're in list mode
  //   this.useWktList.set(true);
  //   // Clear single WKT when loading list
  //   this.wktGeometry.set(null);
  //   // Load default list
  //   this.wktList.set([...this.defaultWktList]);
  // }

  public loadScatteredWktList(): void {
    // Ensure we're in list mode
    this.useWktList.set(true);
    // Clear single WKT when loading list
    this.wktGeometry.set(null);
    // Load scattered geometries from different regions
    this.wktList.set([...this.scatteredWktList]);
  }
}
