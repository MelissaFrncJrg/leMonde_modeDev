import { Component, Input, OnInit } from '@angular/core';

import { ActivatedRoute }     from '@angular/router';

import { CommonModule }       from '@angular/common';

import { RouterModule }       from '@angular/router';

import { Observable }         from 'rxjs';

import { Article }            from '../models/article.model';

import { RssService }         from '../services/parsing.service';

@Component({

  selector: 'app-home-page',

  standalone: true,

  imports: [CommonModule, RouterModule],

  templateUrl: './home-page.component.html',

  styleUrls: ['./home-page.component.scss'],

})

export class HomePageComponent implements OnInit {

  @Input() category?: string;

  articles$!: Observable<Article[]>;

  loading = false;

  error = '';

  constructor(

    private rssService: RssService,

    private route: ActivatedRoute

  ) {}

  ngOnInit(): void {

    // ← ICI : si aucun @Input() n'a été passé, on récupère le param "category" de l'URL

    if (!this.category) {

      this.category = this.route.snapshot.paramMap.get('category') || undefined;

    }

    this.loading = true;

    this.loadArticles();

  }

  private loadArticles(): void {

    this.error = '';

    if (this.category) {

      this.articles$ = this.rssService.getArticlesByCategory(this.category);

    } else {

      this.articles$ = this.rssService.getAllArticles();

    }

    this.loading = false;

  }

  refreshArticles(): void {

    this.loading = true;

    if (this.category) {

      this.articles$ = this.rssService.getArticlesByCategory(this.category, true);

    } else {

      this.articles$ = this.rssService.getAllArticles(true);

    }

    this.loading = false;

  }

  trackByLink(_index: number, article: Article): string {

    return article.link;

  }

}

