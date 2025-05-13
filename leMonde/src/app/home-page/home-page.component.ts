import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Article } from '../models/article.model';
import { RssService } from '../services/parsing.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
  @Input() sourceId?: string;
  @Input() category?: string;

  articles$!: Observable<Article[]>;
  loading = false;
  error = '';

  constructor(private rssService: RssService) {}

  ngOnInit(): void {
    this.loading = true;
    this.loadArticles();
  }

  loadArticles(): void {
    this.error = '';

    try {
      if (this.sourceId) {
        this.articles$ = this.rssService.getArticlesBySource(this.sourceId);
      } else if (this.category) {
        this.articles$ = this.rssService.getArticlesByCategory(this.category);
      } else {
        this.articles$ = this.rssService.getAllArticles();
      }

      this.loading = false;
    } catch (err) {
      this.error = 'Erreur lors du chargement des articles';
      this.loading = false;
    }
  }

  refreshArticles(): void {
    this.loading = true;

    if (this.sourceId) {
      this.articles$ = this.rssService.getArticlesBySource(this.sourceId, true);
    } else if (this.category) {
      this.articles$ = this.rssService.getArticlesByCategory(
        this.category,
        true
      );
    } else {
      this.articles$ = this.rssService.getAllArticles(true);
    }

    this.loading = false;
  }

  trackByLink(index: number, article: Article): string {
    return article.link;
  }
}
