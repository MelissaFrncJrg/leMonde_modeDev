import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { ArticleDetailComponent } from './article-detail/article-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: 'home', component:HomePageComponent},
  { path: 'article', component: ArticleDetailComponent },
];
