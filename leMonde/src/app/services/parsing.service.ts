import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import {

  Observable,

  throwError,

  of,

  forkJoin

} from 'rxjs';

import {

  map,

  catchError,

  shareReplay,

  tap

} from 'rxjs/operators';

import { Article } from '../models/article.model';

import { FeedSource } from '../models/feed-source.model';

@Injectable({

  providedIn: 'root',

})

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

    // ajoutez d'autres sources si besoin…

  ];

  private articlesCache: {

    [sourceId: string]: { articles: Article[]; timestamp: number };

  } = {};

  private cacheDuration = 30 * 60 * 1000; // 30 minutes

  // Proxy CORS pour développement

  private corsProxy = 'https://cors-anywhere.herokuapp.com/';

  constructor(private http: HttpClient) {}

  /** Renvoie toutes les sources */

  getSources(): FeedSource[] {

    return [...this.sources];

  }

  /** Sources filtrées par catégorie */

  getSourcesByCategory(category: string): FeedSource[] {

    return this.sources.filter(s => s.category === category);

  }

  /** Ajoute une source si elle n'existe pas */

  addSource(source: FeedSource): void {

    if (!this.sources.some(s => s.id === source.id)) {

      this.sources.push(source);

    }

  }

  /**

   * Recupère et met en cache les articles d'une source

   */

  getArticlesBySource(

    sourceId: string,

    forceRefresh = false

  ): Observable<Article[]> {

    const source = this.sources.find(s => s.id === sourceId);

    if (!source) {

      return throwError(() => new Error(`Source ${sourceId} non trouvée`));

    }

    const now = Date.now();

    const cached = this.articlesCache[sourceId];

    if (!forceRefresh && cached && now - cached.timestamp < this.cacheDuration) {

      return of(cached.articles);

    }

    return this.fetchAndParseRss(source.url).pipe(

      tap(arts => {

        this.articlesCache[sourceId] = { articles: arts, timestamp: Date.now() };

      })

    );

  }

  /**

   * Récupère tous les articles de toutes les sources

   */

  getAllArticles(forceRefresh = false): Observable<Article[]> {

    const reqs = this.sources.map(s =>

      this.getArticlesBySource(s.id, forceRefresh)

    );

    return forkJoin(reqs).pipe(

      map(arrays =>

        arrays

          .flat()

          .sort((a, b) =>

            new Date(b.pubDate || b.updated).getTime() -

            new Date(a.pubDate || a.updated).getTime()

          )

      ),

      catchError(err => {

        console.error('Erreur getAllArticles', err);

        return throwError(() => new Error('Impossible de récupérer tous les articles'));

      })

    );

  }

  /**

   * Récupère les articles d'une catégorie

   */

  getArticlesByCategory(

    category: string,

    forceRefresh = false

  ): Observable<Article[]> {

    const feeds = this.getSourcesByCategory(category);

    if (!feeds.length) {

      return of([]);

    }

    const reqs = feeds.map(f => this.getArticlesBySource(f.id, forceRefresh));

    return forkJoin(reqs).pipe(

      map(arrays =>

        arrays

          .flat()

          .sort((a, b) =>

            new Date(b.pubDate || b.updated).getTime() -

            new Date(a.pubDate || a.updated).getTime()

          )

      )

    );

  }

  /**

   * Renvoie un seul article identifié par son slug

   */

  getArticleBySlug(

    category: string,

    slug: string,

    forceRefresh = false

  ): Observable<Article | undefined> {

    return this.getArticlesByCategory(category, forceRefresh).pipe(

      map(list => list.find(a => a.slug === slug))

    );

  }

  /**

   * Fetch et parse le RSS en Article[]

   */

  private fetchAndParseRss(url: string): Observable<Article[]> {

    const finalUrl = `${this.corsProxy}${url}`;

    return this.http.get(finalUrl, { responseType: 'text' }).pipe(

      map(xml => this.parseRssToArticles(xml)),

      catchError(err => {

        console.error(`Erreur RSS ${url}`, err);

        return throwError(() => new Error(`Impossible de charger RSS ${url}`));

      }),

      shareReplay(1)

    );

  }

  /** Parse tout le XML en liste d’items */

  private parseRssToArticles(xml: string): Article[] {

    const doc = new DOMParser().parseFromString(xml, 'application/xml');

    const items = Array.from(doc.querySelectorAll('item'));

    return items.map(item => this.parseItem(item));

  }

  /** Génère un slug URL-friendly à partir d’un texte */

  private slugify(text: string): string {

    return text

      .normalize('NFD')

      .replace(/[\u0300-\u036f]/g, '')  // retire accents

      .toLowerCase()

      .replace(/[^a-z0-9]+/g, '-')      // tout non-alphanum en ‘-’

      .replace(/(^-|-$)/g, '');         // supprime tirets en début/fin

  }

  /** Parse un <item> en Article, avec titre, slug, etc. */

  private parseItem(item: Element): Article {

    const txt = (sel: string) => item.querySelector(sel)?.textContent?.trim() || '';

    const title = txt('title');

    // trouver l'image

    let img = item.querySelector('enclosure[type^="image"]')?.getAttribute('url') || '';

    if (!img) {

      const tmp = document.createElement('div');

      tmp.innerHTML = txt('description');

      img = tmp.querySelector('img')?.getAttribute('src') || '';

    }

    return {

      title,

      slug: this.slugify(title),          // ← slug ajouté ici

      pubDate: txt('pubDate'),

      updated: txt('updated') || txt('pubDate'),

      description: txt('description'),

      link: txt('link'),

      imageUrl: img,

      mediaDescription: txt('media\\:description'),

      mediaCredit: txt('media\\:credit')

    };

  }

}

