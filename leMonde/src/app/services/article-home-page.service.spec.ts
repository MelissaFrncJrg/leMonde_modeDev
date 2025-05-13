import { TestBed } from '@angular/core/testing';

import { ArticleHomePageService } from './article-home-page.service';

describe('ArticleHomePageService', () => {
  let service: ArticleHomePageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArticleHomePageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
