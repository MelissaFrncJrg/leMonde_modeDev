import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArticleDetailService } from './article-detail.service';
import { Article } from '../models/article.model';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-article-detail',
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.scss'],
  imports: [CommonModule, NgIf]
})
export class ArticleDetailComponent implements OnInit {
  article?: Article;

  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleDetailService
  ) {}

  ngOnInit(): void {
    // Récupération du paramètre de route (l'id dans l'URL)
    const title = this.route.snapshot.paramMap.get('id');

    if (title) {
      // Récupération de l'article par le titre
      this.articleService.getArticleByTitle(title).subscribe((data) => {
        this.article = data;
      });
    }
  }
}
