import { Component } from '@angular/core';
import { AttributesHeaderComponent } from '../attributes-header/attributes-header.component';
import { DetailsComponent } from '../details/details.component';

@Component({
  selector: 'app-character-header',
  imports: [AttributesHeaderComponent, DetailsComponent],
  templateUrl: './character-header.component.html',
  styleUrl: './character-header.component.scss',
})
export class CharacterHeaderComponent {}
