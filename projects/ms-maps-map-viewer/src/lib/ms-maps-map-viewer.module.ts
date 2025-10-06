import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './map/map';

@NgModule({
  imports: [
    CommonModule,
    MapComponent
  ],
  exports: [
    MapComponent
  ]
})
export class MsMapsMapViewerModule { }
