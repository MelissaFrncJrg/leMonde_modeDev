import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';      
import { Article } from '../models/article.model';
@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.scss'],
})
export class ArticleDetailComponent implements OnInit {
  article?: Article;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.article =
      this.router.getCurrentNavigation()?.extras.state?.['article'] ??
      history.state['article'];

    if (!this.article) {
      this.location.back();
    }
  }

  back(): void {
    this.location.back();
  }
}
