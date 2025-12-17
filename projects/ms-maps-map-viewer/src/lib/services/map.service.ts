import { Injectable, ElementRef } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import { fromLonLat } from 'ol/proj';
import WKT from 'ol/format/WKT';
import Attribution from 'ol/control/Attribution';
import { isEmpty } from 'ol/extent';
import { Style, Stroke, Fill, Circle } from 'ol/style';
import Draw from 'ol/interaction/Draw';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';
import { EditToolType, MapConfig, MapDrawEvent, MapStyleConfig, MapViewOptions, WKTFeature } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private map?: Map;
  private vectorLayer?: VectorLayer<VectorSource>;
  private currentConfig?: MapConfig;
  private currentStyleConfig?: MapStyleConfig;
  private drawInteraction?: Draw;
  private drawListeners: EventsKey[] = [];

  constructor() {}

  /**
   * Initialize the map with the given configuration
   */
  initializeMap(
    mapContainer: ElementRef,
    config: MapConfig,
    styleConfig: MapStyleConfig
  ): Map | undefined {
    try {
      this.currentConfig = config;
      this.currentStyleConfig = styleConfig;

      // Create vector source and layer for WKT features
      const vectorSource = new VectorSource();
      this.vectorLayer = new VectorLayer({
        source: vectorSource,
        style: this.createStyleFunction(styleConfig),
      });

      // Create attribution control
      const attributionControl = this.createAttributionControl(config);

      // Create base layer based on configuration
      const baseLayer = this.createBaseLayer(config);

      // Create the map
      this.map = new Map({
        target: mapContainer.nativeElement,
        layers: [
          baseLayer,
          this.vectorLayer,
        ],
        view: new View({
          center: fromLonLat(config.center),
          zoom: config.zoom,
        }),
        controls: [attributionControl],
      });

      return this.map;
    } catch (error) {
      console.error('Failed to initialize map:', error);
      return undefined;
    }
  }

  /**
   * Render WKT data on the map
   */
  renderWKT(wktFeature: WKTFeature): boolean {
    if (!wktFeature || !this.vectorLayer || !this.map) {
      console.warn('Cannot render WKT: map, vector layer, or WKT not available');
      return false;
    }

    try {
      const format = new WKT();
      const feature = format.readFeature(wktFeature.wkt, {
        dataProjection: wktFeature.dataProjection || 'EPSG:4326',
        featureProjection: wktFeature.featureProjection || 'EPSG:3857',
      });

      const vectorSource = this.vectorLayer.getSource();
      if (vectorSource) {
        // Clear existing features
        vectorSource.clear();
        // Add the new feature
        vectorSource.addFeature(feature);

        return true;
      }
      return false;
    } catch (error) {
      console.error('Error parsing WKT:', error);
      return false;
    }
  }

  /**
   * Render multiple WKT geometries on the map
   */
  renderWKTList(wktFeatures: WKTFeature[]): boolean {
    if (!wktFeatures || !Array.isArray(wktFeatures) || wktFeatures.length === 0 || !this.vectorLayer || !this.map) {
      console.warn('Cannot render WKT list: map, vector layer, or WKT list not available');
      return false;
    }

    try {
      const format = new WKT();
      const vectorSource = this.vectorLayer.getSource();
      if (!vectorSource) {
        return false;
      }

      // Clear existing features
      vectorSource.clear();

      // Add all features
      let hasValidFeature = false;
      for (const wktFeature of wktFeatures) {
        if (!wktFeature || !wktFeature.wkt) {
          continue;
        }
        try {
          const feature = format.readFeature(wktFeature.wkt, {
            dataProjection: wktFeature.dataProjection || 'EPSG:4326',
            featureProjection: wktFeature.featureProjection || 'EPSG:3857',
          });
          vectorSource.addFeature(feature);
          hasValidFeature = true;
        } catch (error) {
          console.error('Error parsing WKT:', error, wktFeature);
        }
      }

      return hasValidFeature;
    } catch (error) {
      console.error('Error rendering WKT list:', error);
      return false;
    }
  }

  /**
   * Fit the map view to the current features
   */
  fitToFeatures(options?: MapViewOptions): void {
    if (!this.map || !this.vectorLayer) {
      console.warn('Cannot fit to features: map or vector layer not available');
      return;
    }

    const vectorSource = this.vectorLayer.getSource();
    if (vectorSource) {
      const extent = vectorSource.getExtent();
      
      // Validate extent: check if it's valid and not empty
      // isEmpty returns true if extent is infinite or invalid
      if (isEmpty(extent)) {
        console.warn('Cannot fit to features: extent is empty or invalid (no features in source)');
        return;
      }

      this.map.getView().fit(extent, {
        padding: options?.padding || [20, 20, 20, 20],
        maxZoom: options?.maxZoom || 16,
        duration: options?.duration || 1000,
      });
    }
  }

  /**
   * Zoom to a WKT geometry without rendering it on the map
   */
  zoomToWkt(wkt: string, options?: MapViewOptions): boolean {
    if (!wkt || !this.map) {
      console.warn('Cannot zoom to WKT: map not available or WKT is empty');
      return false;
    }

    try {
      // Clear any existing drawn features before zooming
      this.clearFeatures();

      const format = new WKT();
      const geometry = format.readGeometry(wkt, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      });

      const extent = geometry.getExtent();
      
      if (isEmpty(extent)) {
        console.warn('Cannot zoom to WKT: extent is empty or invalid');
        return false;
      }

      this.map.getView().fit(extent, {
        padding: options?.padding || [20, 20, 20, 20],
        maxZoom: options?.maxZoom || 16,
        duration: options?.duration || 1000,
      });

      return true;
    } catch (error) {
      console.error('Error zooming to WKT:', error);
      return false;
    }
  }

  /**
   * Update map view with new center and zoom
   */
  updateMapView(center: [number, number], zoom: number): void {
    if (!this.map) {
      console.warn('Cannot update map view: map not initialized');
      return;
    }
    
    const view = this.map.getView();
    view.setCenter(fromLonLat(center));
    view.setZoom(zoom);
  }

  /**
   * Update map styling
   */
  updateMapStyling(styleConfig: MapStyleConfig): void {
    if (!this.vectorLayer) {
      console.warn('Cannot update styling: vector layer not available');
      return;
    }

    this.currentStyleConfig = styleConfig;
    this.vectorLayer.setStyle(this.createStyleFunction(styleConfig));
  }


  /**
   * Destroy the map instance
   */
  destroyMap(): void {
    this.disableDrawing();
    if (this.map) {
      this.map.setTarget(undefined);
      this.map = undefined;
      this.vectorLayer = undefined;
    }
  }

  /**
   * Get the current map instance
   */
  getMap(): Map | undefined {
    return this.map;
  }


  private createAttributionControl(config: MapConfig): Attribution {
    return new Attribution({
      collapsible: config.attributionCollapsible !== false,
      collapsed: config.attributionCollapsed || false,
      className: 'custom-attribution'
    });
  }

  /**
   * Creates the base layer based on configuration
   * Uses custom URL template if provided, otherwise defaults to OSM
   */
  private createBaseLayer(config: MapConfig): TileLayer<XYZ | OSM> {
    if (config.baseLayerUrlTpl) {
      return new TileLayer({
        source: new XYZ({
          url: config.baseLayerUrlTpl
        }),
      });
    } else {
      return new TileLayer({
        source: new OSM(),
      });
    }
  }

  /**
   * Creates a style for a point geometry
   */
  private createPointStyle(config: MapStyleConfig): Style {
    return new Style({
      image: new Circle({
        radius: config.pointRadius || 5,
        fill: new Fill({
          color: config.pointColor,
        }),
        stroke: new Stroke({
          color: config.pointBorderColor,
          width: 2,
        }),
      }),
    });
  }

  /**
   * Creates a style for polygon and line geometries
   */
  private createGeometryStyle(config: MapStyleConfig): Style {
    return new Style({
      stroke: new Stroke({
        color: config.borderColor,
        width: config.strokeWidth || 3,
      }),
      fill: new Fill({
        color: config.fillColor,
      }),
    });
  }

  /**
   * Creates a dynamic style function based on geometry type
   */
  private createStyleFunction(config: MapStyleConfig) {
    return (feature: any) => {
      const geometry = feature.getGeometry();
      const geometryType = geometry?.getType();
      
      if (geometryType === 'Point') {
        return this.createPointStyle(config);
      } else {
        return this.createGeometryStyle(config);
      }
    };
  }

  clearFeatures(): void {
    const vectorSource = this.vectorLayer?.getSource();
    vectorSource?.clear();
  }

  enableDrawing(tool: EditToolType, onComplete: (event: MapDrawEvent) => void): void {
    if (!this.map || !this.vectorLayer) {
      console.warn('Cannot enable drawing: map or vector layer not available');
      return;
    }

    const vectorSource = this.vectorLayer.getSource();
    if (!vectorSource) {
      console.warn('Cannot enable drawing: vector source not available');
      return;
    }

    this.disableDrawing();
    vectorSource.clear();

    const geometryType = this.mapToolToGeometry(tool);
    this.drawInteraction = new Draw({
      source: vectorSource,
      type: geometryType
    });

    this.drawListeners.push(this.drawInteraction.on('drawstart', () => {
      vectorSource.clear();
    }));

    this.drawListeners.push(this.drawInteraction.on('drawend', (event) => {
      const feature = event.feature as Feature;
      const format = new WKT();
      const wkt = format.writeFeature(feature, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      });
      onComplete({ wkt, tool });
    }));

    this.map.addInteraction(this.drawInteraction);
  }

  disableDrawing(): void {
    if (this.map && this.drawInteraction) {
      this.map.removeInteraction(this.drawInteraction);
    }

    if (this.drawListeners.length) {
      this.drawListeners.forEach(listener => unByKey(listener));
      this.drawListeners = [];
    }

    this.drawInteraction = undefined;
  }

  private mapToolToGeometry(tool: EditToolType): 'Point' | 'LineString' | 'Polygon' {
    switch (tool) {
      case EditToolType.LINE:
        return 'LineString';
      case EditToolType.POLYGON:
        return 'Polygon';
      case EditToolType.POINT:
      default:
        return 'Point';
    }
  }
}
