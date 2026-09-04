import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

// Angular 21 requires the BootstrapContext to be forwarded when bootstrapping on the server;
// dropping it fails route extraction with NG0401 ("Missing Platform").
const bootstrap = (context: BootstrapContext) => bootstrapApplication(AppComponent, config, context);

export default bootstrap;
