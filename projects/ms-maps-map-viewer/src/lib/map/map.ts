import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { EditToolType, MapDrawEvent, MapMode, MapConfig, MapStyleConfig, WKTFeature } from '../interfaces';
import { MapService } from '../services';

@Component({
  selector: 'ms-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.html',
  styleUrl: './map.css'
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  @Input() wkt: string = '';
  @Input() width: string = '100%';
  @Input() height: string = '400px';
  @Input() zoom: number = 10;
  @Input() center: [number, number] = [44.7872, 41.7151]; // [longitude, latitude] - Tbilisi by default
  @Input() borderColor: string = 'rgba(0, 0, 255, 1)';
  @Input() fillColor: string = 'rgba(255, 255, 255, 0.5)';
  @Input() pointColor: string = 'rgba(0, 0, 255, 1)';
  @Input() pointBorderColor: string = 'rgba(255, 255, 255, 1)';
  @Input() mapConfigObject: Partial<MapConfig> | null = null;
  @Input() mode: MapMode = MapMode.VIEW;
  @Input() editOptions: EditToolType[] = [EditToolType.POINT];
  @Output() geometryDrawn = new EventEmitter<MapDrawEvent>();

  private mapConfig: MapConfig = this.getDefaultMapConfig();
  private styleConfig: MapStyleConfig = this.getDefaultStyleConfig();
  activeEditTool: EditToolType | null = null;
  readonly MapMode = MapMode;
  readonly EditToolType = EditToolType;

  constructor(
    private mapService: MapService
  ) {}

  ngOnInit(): void {
    this.updateConfigurations();
    this.ensureEditOptions();
    if (this.mode === MapMode.EDIT) {
      this.ensureActiveTool();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateConfigurations();
    this.ensureEditOptions();

    if (changes['mode']) {
      this.handleModeChange();
    }

    if (changes['editOptions'] && this.mode === MapMode.EDIT) {
      this.ensureActiveTool();
      this.refreshDrawingInteraction();
    }
    
    // Handle input changes after the map is initialized
    if (this.shouldRenderWKT(changes)) {
      this.renderWKT();
    } else if (this.shouldClearWKT(changes)) {
      this.mapService.clearFeatures();
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
      const prevBaseLayer = changes['mapConfigObject'].previousValue?.baseLayerUrlTpl;
      const currBaseLayer = changes['mapConfigObject'].currentValue?.baseLayerUrlTpl;
      if (prevBaseLayer !== currBaseLayer) {
        this.reinitializeMap();
      }
    }
  }

  ngAfterViewInit(): void {
    this.initializeMap();
    if (this.mode === MapMode.VIEW && this.wkt) {
      this.renderWKT();
    } else if (this.mode === MapMode.EDIT) {
      this.enterEditMode();
    }
  }

  ngOnDestroy(): void {
    this.mapService.disableDrawing();
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
    if (this.mode === MapMode.VIEW) {
      this.renderWKT();
    }
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
      center: [44.7872, 41.7151], // Tbilisi, Georgia
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

  private handleModeChange(): void {
    if (!this.mapService.getMap()) {
      return;
    }

    if (this.mode === MapMode.EDIT) {
      this.enterEditMode();
    } else {
      this.exitEditMode();
    }
  }

  private enterEditMode(): void {
    this.mapService.clearFeatures();
    // Ensure map is centered on Tbilisi when entering edit mode
    const tbilisiCenter: [number, number] = [44.7872, 41.7151];
    if (this.mapService.getMap()) {
      this.mapService.updateMapView(tbilisiCenter, this.zoom);
    }
    this.ensureActiveTool();
    this.refreshDrawingInteraction();
  }

  private exitEditMode(): void {
    this.mapService.disableDrawing();
    if (this.wkt) {
      this.renderWKT();
    } else {
      this.mapService.clearFeatures();
    }
  }

  private emitGeometryDrawn(event: MapDrawEvent): void {
    this.wkt = event.wkt;
    this.geometryDrawn.emit(event);
  }

  private refreshDrawingInteraction(): void {
    if (!this.mapService.getMap()) {
      return;
    }

    if (this.mode !== MapMode.EDIT || !this.activeEditTool) {
      this.mapService.disableDrawing();
      return;
    }

    this.mapService.enableDrawing(this.activeEditTool, (event) => this.emitGeometryDrawn(event));
  }

  selectEditTool(tool: EditToolType): void {
    if (this.activeEditTool === tool) {
      return;
    }
    this.activeEditTool = tool;
    this.refreshDrawingInteraction();
  }

  get showEditToolbar(): boolean {
    return this.mode === MapMode.EDIT && this.editOptions.length > 1;
  }

  private ensureEditOptions(): void {
    if (!this.editOptions || !this.editOptions.length) {
      this.editOptions = [EditToolType.POINT];
    } else {
      const allowed = new Set(Object.values(EditToolType));
      this.editOptions = this.editOptions.filter((option): option is EditToolType => allowed.has(option));
      if (!this.editOptions.length) {
        this.editOptions = [EditToolType.POINT];
      }
    }
  }

  private ensureActiveTool(): void {
    this.ensureEditOptions();
    if (!this.activeEditTool || !this.editOptions.includes(this.activeEditTool)) {
      this.activeEditTool = this.editOptions[0];
    }
  }

  private shouldRenderWKT(changes: SimpleChanges): boolean {
    const hasWktChange = !!changes['wkt'];
    const hasMap = !!this.mapService.getMap();
    return hasMap &&
      this.mode === MapMode.VIEW &&
      hasWktChange &&
      !!changes['wkt'].currentValue;
  }

  private shouldClearWKT(changes: SimpleChanges): boolean {
    const hasWktChange = !!changes['wkt'];
    const hasMap = !!this.mapService.getMap();
    return hasMap &&
      this.mode === MapMode.VIEW &&
      hasWktChange &&
      !changes['wkt'].currentValue;
  }
}
