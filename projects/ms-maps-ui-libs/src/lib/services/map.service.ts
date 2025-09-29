import { Injectable, ElementRef } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import { fromLonLat } from 'ol/proj';
import WKT from 'ol/format/WKT';
import Attribution from 'ol/control/Attribution';
import { MapConfig, MapStyleConfig, MapViewOptions, WKTFeature } from '../interfaces';
import { Style, Stroke, Fill, Circle } from 'ol/style';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private map?: Map;
  private vectorLayer?: VectorLayer<VectorSource>;
  private currentConfig?: MapConfig;
  private currentStyleConfig?: MapStyleConfig;

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

      // Create the map
      this.map = new Map({
        target: mapContainer.nativeElement,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          this.vectorLayer,
        ],
        view: new View({
          center: fromLonLat(config.center),
          zoom: config.zoom,
        }),
        controls: [attributionControl],
      });

      console.info('Map initialized successfully');
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
        
        console.info('WKT feature rendered successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error parsing WKT:', error);
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
      this.map.getView().fit(extent, {
        padding: options?.padding || [20, 20, 20, 20],
        maxZoom: options?.maxZoom || 16,
        duration: options?.duration || 1000,
      });
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
    if (this.map) {
      this.map.setTarget(undefined);
      this.map = undefined;
      this.vectorLayer = undefined;
      console.info('Map destroyed');
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
}
