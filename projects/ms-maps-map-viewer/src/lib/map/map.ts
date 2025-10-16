import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { MapConfig, MapStyleConfig, WKTFeature } from '../interfaces';
import { MapService } from '../services';

@Component({
  selector: 'ms-map',
  standalone: true,
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.css'
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  @Input() wkt: string = '';
  @Input() width: string = '100%';
  @Input() height: string = '400px';
  @Input() zoom: number = 10;
  @Input() center: [number, number] = [0, 0]; // [longitude, latitude]
  @Input() borderColor: string = 'rgba(0, 0, 255, 1)';
  @Input() fillColor: string = 'rgba(255, 255, 255, 0.5)';
  @Input() pointColor: string = 'rgba(0, 0, 255, 1)';
  @Input() pointBorderColor: string = 'rgba(255, 255, 255, 1)';
  @Input() mapConfigObject: any = {};

  private mapConfig: MapConfig = this.getDefaultMapConfig();
  private styleConfig: MapStyleConfig = this.getDefaultStyleConfig();

  constructor(
    private mapService: MapService
  ) {}

  ngOnInit(): void {
    this.updateConfigurations();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateConfigurations();
    
    // Handle input changes after the map is initialized
    if (this.mapService.getMap() && changes['wkt'] && changes['wkt'].currentValue) {
      this.renderWKT();
    }
    
    // Handle center and zoom changes
    if (this.mapService.getMap() && (changes['center'] || changes['zoom'])) {
      this.updateMapView();
    }

    // Handle style changes
    if (this.mapService.getMap() && this.hasStyleChanges(changes)) {
      this.updateMapStyling();
    }

    // Handle mapConfigObject changes - reinitialize map if base layer changes
    if (this.mapService.getMap() && changes['mapConfigObject']) {
      this.reinitializeMap();
    }
  }

  ngAfterViewInit(): void {
    this.initializeMap();
    if (this.wkt) {
      this.renderWKT();
    }
  }

  ngOnDestroy(): void {
    this.mapService.destroyMap();
  }

  private initializeMap(): void {
    this.mapService.initializeMap(this.mapContainer, this.mapConfig, this.styleConfig);
  }

  private reinitializeMap(): void {
    // Destroy current map and reinitialize with new configuration
    this.mapService.destroyMap();
    this.initializeMap();
    if (this.wkt) {
      this.renderWKT();
    }
  }

  private renderWKT(): void {
    if (!this.wkt) {
      return;
    }

    const wktFeature: WKTFeature = {
      wkt: this.wkt,
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    };

    const success = this.mapService.renderWKT(wktFeature);
    if (success) {
      this.mapService.fitToFeatures();
    }
  }

  // Public method to update WKT
  updateWKT(wkt: string): void {
    this.wkt = wkt;
    this.renderWKT();
  }

  // Update map view when center or zoom changes
  private updateMapView(): void {
    this.mapService.updateMapView(this.center, this.zoom);
  }

  // Update map styling when style properties change
  private updateMapStyling(): void {
    this.mapService.updateMapStyling(this.styleConfig);
  }

  // Update configurations from input properties
  private updateConfigurations(): void {
    // Start with default configuration
    const defaultConfig = {
      width: this.width,
      height: this.height,
      zoom: this.zoom,
      center: this.center,
      attribution: true,
      attributionCollapsible: true,
      attributionCollapsed: false
    };

    // Merge with mapConfigObject if provided, only considering baseLayerUrlTpl
    this.mapConfig = this.mapConfigObject ? {
      ...defaultConfig,
      baseLayerUrlTpl: this.mapConfigObject.baseLayerUrlTpl
    } : defaultConfig;

    this.styleConfig = {
      borderColor: this.borderColor,
      fillColor: this.fillColor,
      pointColor: this.pointColor,
      pointBorderColor: this.pointBorderColor,
      pointRadius: 5,
      strokeWidth: 3
    };
  }

  // Check if any style-related inputs have changed
  private hasStyleChanges(changes: SimpleChanges): boolean {
    const styleProperties = ['borderColor', 'fillColor', 'pointColor', 'pointBorderColor'];
    return styleProperties.some(prop => changes[prop] && changes[prop].currentValue !== changes[prop].previousValue);
  }

  // Get default map configuration
  private getDefaultMapConfig(): MapConfig {
    return {
      width: '100%',
      height: '400px',
      zoom: 10,
      center: [0, 0],
      attribution: true,
      attributionCollapsible: true,
      attributionCollapsed: false
    };
  }

  // Get default style configuration
  private getDefaultStyleConfig(): MapStyleConfig {
    return {
      borderColor: 'rgba(0, 0, 255, 1)',
      fillColor: 'rgba(255, 255, 255, 0.5)',
      pointColor: 'rgba(0, 0, 255, 1)',
      pointBorderColor: 'rgba(255, 255, 255, 1)',
      pointRadius: 5,
      strokeWidth: 3
    };
  }
}
