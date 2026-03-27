import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { APP_ROUTES } from '../../../app.constants';

@Component({
  selector: 'app-character-loader',
  imports: [],
  templateUrl: './character-loader.component.html',
  styleUrl: './character-loader.component.scss',
})
export class CharacterLoaderComponent {
  constructor(private router: Router) {}

  goToWizard(): void {
    this.router.navigate([APP_ROUTES.characterCreator]);
  }

  goToImporter(): void {
    this.router.navigate([APP_ROUTES.characterImporter]);
  }
}
