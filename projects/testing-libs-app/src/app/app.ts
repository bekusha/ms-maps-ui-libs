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
  ngOnInit() {
    this.wktGeometry.set('POLYGON((44.79605 41.72667, 44.79520 41.72742, 44.79345 41.72699, 44.79395 41.72602, 44.79605 41.72667))');
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
    this.geometryDrawnEvent.set(null);
  }
}
