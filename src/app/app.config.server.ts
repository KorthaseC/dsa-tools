import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/ssr';
import { appConfig } from './app.config';

// Server-side counterpart of appConfig, used only by the build-time prerender (outputMode: "static").
// There is no runtime Node server — every route is rendered once during `ng build` and written out as
// a plain index.html, so the deployment stays a pure static upload.
const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering()],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
