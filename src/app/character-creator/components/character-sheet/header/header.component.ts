import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DetailsComponent } from './details/details.component';
import { AttributesComponent } from './attributes/attributes.component';

@Component({
  selector: 'app-cs-header',
  imports: [DetailsComponent, AttributesComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {}
