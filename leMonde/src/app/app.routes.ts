import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomePageComponent },

  {
    path: 'article-detail',
    loadComponent: () =>
      import('./article-detail/article-detail.component').then(
        (m) => m.ArticleDetailComponent
      ),
  },
  { path: '**', redirectTo: 'home' },
];