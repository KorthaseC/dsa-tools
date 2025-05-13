import { Component, input, model } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { SafeUrlPipe } from './safe-url.pipe';


@Component({
  selector: 'app-rule-dialog',
  standalone: true,
  imports: [DialogModule, SafeUrlPipe],
  templateUrl: './rule-dialog.component.html',
  styleUrl: './rule-dialog.component.scss'
})
export class RuleDialogComponent {
  visible = model(false);
  path = input ('');
  title = input('Regelwiki-Eintrag');

  readonly baseUrl = 'https://dsa.ulisses-regelwiki.de/';

  get fullUrl(): string {
    console.log(`${this.baseUrl}${this.path()}`)
    return `${this.baseUrl}${this.path()}`;
  }

  close(): void {
    this.visible.update(_ => false)
  }
}
