import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of, forkJoin } from 'rxjs';
import { map, catchError, shareReplay, tap } from 'rxjs/operators';
import { Article } from '../models/article.model';
import { FeedSource } from '../models/feed-source.model';

@Injectable({ providedIn: 'root' })
export class RssService {
  private sources: FeedSource[] = [
    {
      id: 'gastronomy',
      name: 'Gastronomy',
      url: 'https://www.lemonde.fr/gastronomie/rss_full.xml',
      category: 'gastronomy',
    },
    {
      id: 'videogames',
      name: 'Video Games',
      url: 'https://www.lemonde.fr/jeux-video/rss_full.xml',
      category: 'videogames',
    },
  ];

  private articlesCache: {
    [sourceId: string]: { articles: Article[]; timestamp: number };
  } = {};

  private cacheDuration = 30 * 60 * 1000;

  constructor(private http: HttpClient) {}

  getSources(): FeedSource[] {
    return [...this.sources];
  }

  getSourcesByCategory(category: string): FeedSource[] {
    return this.sources.filter((source) => source.category === category);
  }

  addSource(source: FeedSource): void {
    if (!this.sources.some((s) => s.id === source.id)) {
      this.sources.push(source);
    }
  }

  getArticlesBySource(sourceId: string, forceRefresh = false): Observable<Article[]> {
    const source = this.sources.find((s) => s.id === sourceId);
    if (!source) {
      return throwError(() => new Error(`Source avec l'ID ${sourceId} non trouvée`));
    }

    const now = Date.now();
    if (
      !forceRefresh &&
      this.articlesCache[sourceId] &&
      now - this.articlesCache[sourceId].timestamp < this.cacheDuration
    ) {
      return of(this.articlesCache[sourceId].articles);
    }

    return this.fetchAndParseRss(source.url).pipe(
      tap((articles) => {
        this.articlesCache[sourceId] = {
          articles,
          timestamp: Date.now(),
        };
      })
    );
  }

  getAllArticles(forceRefresh = false): Observable<Article[]> {
    const requests = this.sources.map((source) =>
      this.getArticlesBySource(source.id, forceRefresh)
    );

    return forkJoin(requests).pipe(
      map((articlesArrays) =>
        articlesArrays.flat().sort((a, b) => {
          const dateA = new Date(a.pubDate || a.updated).getTime();
          const dateB = new Date(b.pubDate || b.updated).getTime();
          return dateB - dateA;
        })
      ),
      catchError((error) => {
        console.error('Erreur lors de la récupération de tous les articles:', error);
        return throwError(() => new Error('Impossible de récupérer tous les articles'));
      })
    );
  }

  getArticlesByCategory(category: string, forceRefresh = false): Observable<Article[]> {
    const sourcesInCategory = this.getSourcesByCategory(category);
    if (sourcesInCategory.length === 0) {
      return of([]);
    }

    const requests = sourcesInCategory.map((source) =>
      this.getArticlesBySource(source.id, forceRefresh)
    );

    return forkJoin(requests).pipe(
      map((articlesArrays) =>
        articlesArrays.flat().sort((a, b) => {
          const dateA = new Date(a.pubDate || a.updated).getTime();
          const dateB = new Date(b.pubDate || b.updated).getTime();
          return dateB - dateA;
        })
      )
    );
  }

  private fetchAndParseRss(url: string): Observable<Article[]> {
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const finalUrl = url.startsWith('http') ? `${corsProxy}${url}` : url;

    return this.http.get(finalUrl, { responseType: 'text' }).pipe(
      map((response) => this.parseRssToArticles(response)),
      catchError((error) => {
        console.error(`Erreur lors de la récupération du flux RSS (${url}):`, error);
        return throwError(() => new Error(`Impossible de charger le flux RSS: ${url}`));
      }),
      shareReplay(1)
    );
  }

  private parseRssToArticles(xml: string): Article[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');
    const isRss = xmlDoc.querySelector('rss, channel') !== null;

    if (!isRss) {
      throw new Error('Format de flux non reconnu');
    }

    const itemElements = isRss
      ? Array.from(xmlDoc.querySelectorAll('item'))
      : Array.from(xmlDoc.querySelectorAll('entry'));

    return itemElements.map((item) => this.parseItemToArticle(item, isRss));
  }

  private parseItemToArticle(itemElement: Element, isRss: boolean): Article {
    const article: Article = {
      title: '',
      pubDate: '',
      updated: '',
      description: '',
      link: '',
      imageUrl: '',
      mediaDescription: '',
      mediaCredit: '',
    };

    if (isRss) {
      article.title = this.getElementTextContent(itemElement, 'title');
      article.pubDate = this.getElementTextContent(itemElement, 'pubDate');
      article.updated = this.getElementTextContent(itemElement, 'lastBuildDate') || article.pubDate;
      article.description = this.getElementTextContent(itemElement, 'description');
      article.link = this.getElementTextContent(itemElement, 'link');

      const enclosure = itemElement.querySelector('enclosure[type^="image"]');
      if (enclosure && enclosure.hasAttribute('url')) {
        article.imageUrl = enclosure.getAttribute('url') || '';
      } else {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = article.description;
        const firstImg = tempDiv.querySelector('img');
        if (firstImg && firstImg.hasAttribute('src')) {
          article.imageUrl = firstImg.getAttribute('src') || '';
        }
      }

      // ✅ CORRECT handling of media:* tags
      article.mediaDescription = this.getElementTextContent(itemElement, 'media:description');
      article.mediaCredit = this.getElementTextContent(itemElement, 'media:credit');
    }

    return article;
  }

  private getElementTextContent(parentElement: Element, tagName: string): string {
    const elements = parentElement.getElementsByTagName(tagName);
    if (elements.length > 0) {
      return elements[0].textContent?.trim() || '';
    }
    return '';
  }
}
