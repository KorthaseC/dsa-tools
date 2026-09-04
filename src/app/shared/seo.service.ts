import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { APP_TITLE, HOME_TITLE, META_DESCRIPTIONS, ROUTE_TITLES, OG_IMAGE, SITE_URL } from '../app.constants';

/** The SEO-relevant slice of a route's `data`. */
export interface SeoRouteData {
  title?: string;
  description?: string;
  /** Keep this page out of the index (thin or duplicate content). Links are still followed. */
  noindex?: boolean;
  /** Home page: use HOME_TITLE verbatim instead of the "DSA Tools - {x}" pattern. */
  isHome?: boolean;
}

/**
 * Writes every per-page tag a crawler or link-preview bot reads: title, description, canonical,
 * Open Graph and Twitter Card, plus a robots directive for noindex pages.
 *
 * Deliberately free of any isPlatformBrowser guard — this must also run during the build-time
 * prerender, which is what puts these tags into the served HTML in the first place.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly doc = inject(DOCUMENT);
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);

  update(data: SeoRouteData | undefined, url: string): void {
    const title = this.resolveTitle(data);
    const description = (data?.description && META_DESCRIPTIONS[data.description]) || META_DESCRIPTIONS['home'];
    const canonical = this.canonicalUrl(url);

    this.titleService.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });

    if (data?.noindex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex,follow' });
    } else {
      this.meta.removeTag("name='robots'");
    }

    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: canonical });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: APP_TITLE });
    this.meta.updateTag({ property: 'og:locale', content: 'de_DE' });
    this.meta.updateTag({ property: 'og:image', content: OG_IMAGE });
    this.meta.updateTag({ property: 'og:image:width', content: '256' });
    this.meta.updateTag({ property: 'og:image:height', content: '256' });
    this.meta.updateTag({ property: 'og:image:alt', content: 'DSA Tools Logo' });

    // 'summary', not 'summary_large_image': the preview image is the square 256x256 logo. Declaring
    // a large card would make scrapers crop/stretch it into a 1.91:1 banner.
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: OG_IMAGE });
    this.meta.updateTag({ name: 'twitter:image:alt', content: 'DSA Tools Logo' });

    this.setCanonical(canonical);
    this.setStructuredData('page', this.buildPageGraph(data, title, description, canonical));
  }

  /**
   * Per-page JSON-LD: the tool itself as a free SoftwareApplication plus a breadcrumb trail.
   * Skipped for noindex pages and for the home page (index.html already carries the WebSite node).
   */
  private buildPageGraph(data: SeoRouteData | undefined, title: string, description: string, canonical: string): object | null {
    if (data?.noindex || data?.isHome) return null;

    const pageName = (data?.title && ROUTE_TITLES[data.title]) || title;
    const isTool = !!data?.title && !['legalTitle', 'imprintTitle', 'notFoundTitle'].includes(data.title);

    const breadcrumb = {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Startseite', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: pageName, item: canonical },
      ],
    };

    if (!isTool) return { '@context': 'https://schema.org', ...breadcrumb };

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'SoftwareApplication',
          name: `${pageName} – DSA Tools`,
          url: canonical,
          description,
          applicationCategory: 'GameApplication',
          operatingSystem: 'Web',
          inLanguage: 'de-DE',
          isAccessibleForFree: true,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        },
        breadcrumb,
      ],
    };
  }

  /** Replaces the page-level JSON-LD block (BreadcrumbList / SoftwareApplication). */
  setStructuredData(id: string, data: object | null): void {
    const head = this.doc.head;
    head.querySelector(`script[data-seo="${id}"]`)?.remove();
    if (!data) return;

    const script = this.doc.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('data-seo', id);
    script.textContent = JSON.stringify(data);
    head.appendChild(script);
  }

  private resolveTitle(data: SeoRouteData | undefined): string {
    if (data?.isHome) return HOME_TITLE;
    if (!data?.title) return APP_TITLE;
    return `${APP_TITLE} - ${ROUTE_TITLES[data.title] ?? data.title}`;
  }

  /** Absolute, query- and fragment-free URL; '/' keeps its trailing slash, others drop it. */
  private canonicalUrl(url: string): string {
    const path = url.split(/[?#]/)[0];
    if (path === '/' || path === '') return `${SITE_URL}/`;
    return `${SITE_URL}${path.replace(/\/+$/, '')}`;
  }

  private setCanonical(href: string): void {
    let link = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }
}
