import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { APP_ROUTES } from '../app.constants';

@Component({
  selector: 'app-not-found',
  imports: [RouterModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  public readonly routes = APP_ROUTES;
}
