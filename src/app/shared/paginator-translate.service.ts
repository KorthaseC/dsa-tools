import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class PaginationTranslateService extends MatPaginatorIntl {
  constructor(private translateService: TranslateService) {
    super();

    // React whenever the language is changed
    this.translateService.onLangChange.subscribe((_event: Event) => {
      this.translateLabels();
    });

    // Initialize the translations once at construction time
    this.translateLabels();
  }

  override getRangeLabel = (
    page: number,
    pageSize: number,
    length: number
  ): string => {
    const of = this.translateService
      ? this.translateService.instant('shared.paginator.of')
      : 'of';
    if (length === 0 || pageSize === 0) {
      return '0 ' + of + ' ' + length;
    }
    length = Math.max(length, 0);
    const startIndex =
      page * pageSize > length
        ? (Math.ceil(length / pageSize) - 1) * pageSize
        : page * pageSize;

    const endIndex = Math.min(startIndex + pageSize, length);
    return startIndex + 1 + ' - ' + endIndex + ' ' + of + ' ' + length;
  };

  injectTranslateService(translate: TranslateService): void {
    this.translateService = translate;

    this.translateService.onLangChange.subscribe(() => {
      this.translateLabels();
    });

    this.translateLabels();
  }

  private translateLabels(): void {
    this.firstPageLabel = this.translateService.instant(
      'shared.paginator.firstPageLabel'
    );
    this.itemsPerPageLabel = this.translateService.instant(
      'shared.paginator.itemsPerPageLabel'
    );
    this.lastPageLabel = this.translateService.instant(
      'shared.paginator.lastPageLabel'
    );
    this.nextPageLabel = this.translateService.instant(
      'shared.paginator.nextPageLabel'
    );
    this.previousPageLabel = this.translateService.instant(
      'shared.paginator.previousPageLabel'
    );
    this.changes.next(); // Fire a change event to make sure that the labels are refreshed
  }
}
