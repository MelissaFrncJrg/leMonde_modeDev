import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Article {
  title: string;
  pubDate: string;
  updated: string;
  description: string;
  link: string;
  imageUrl?: string;
}



@Injectable({
  providedIn: 'root'
})
export class ArticleDetailService {
  private rssUrl = 'https://www.lemonde.fr/jeux-video/rss_full.xml'; 

  constructor(private http: HttpClient) {}

  getArticles(): Observable<Article[]> {
    return this.http.get(this.rssUrl, { responseType: 'text' }).pipe(
      map(xmlString => this.parseRss(xmlString))
    );
  }

  getArticleByTitle(searchTitle: string): Observable<Article | undefined> {
    return this.getArticles().pipe(
      map(articles =>
        articles.find(article => article.title.includes(searchTitle))
      )
    );
  }

  private parseRss(xml: string): Article[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'application/xml');
    const items = Array.from(xmlDoc.getElementsByTagName('item'));

    return items.map(item => {
      const get = (tag: string) =>
        item.getElementsByTagName(tag)?.[0]?.textContent?.trim() ?? '';

      const mediaContent = item.getElementsByTagName('media:content')[0];
      const imageUrl = mediaContent?.getAttribute('url') ?? '';

      return {
        title: get('title'),
        pubDate: get('pubDate'),
        updated: get('updated'),
        description: get('description'),
        link: get('link'),
        imageUrl: imageUrl
      };
    });
  }
}
