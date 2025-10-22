import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('testing-libs-app');

  geometryWkt: string = 'POLYGON((0 0, 10 0, 10 10, 0 10, 0 0))';
}
