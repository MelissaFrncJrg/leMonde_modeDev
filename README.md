# leMonde_modeDev
ybvgbu
# Consommation des flux RSS de LeMonde.fr avec Angular (TypeScript)

Ce projet Angular permet de récupérer et d’afficher les articles issus des flux RSS du site [LeMonde.fr](https://www.lemonde.fr), à l’aide de TypeScript et de l’API `HttpClient`.

---

## Objectifs

- Intégrer des flux RSS XML dans une application Angular.
- Parser le XML en TypeScript pour afficher les titres, liens et dates.
- Contourner les restrictions CORS à l’aide d’un proxy Angular.

---

## Flux RSS disponibles

Voici quelques flux RSS publics proposés par LeMonde.fr :

| Thématique      | URL |
|-----------------|-----|
| À la Une        | https://www.lemonde.fr/rss/une.xml |
| International   | https://www.lemonde.fr/international/rss_full.xml |
| Politique       | https://www.lemonde.fr/politique/rss_full.xml |
| Économie        | https://www.lemonde.fr/economie/rss_full.xml |
| Culture         | https://www.lemonde.fr/culture/rss_full.xml |

Liste complète : [https://www.lemonde.fr/rss/](https://www.lemonde.fr/rss/)

---

## Technologies utilisées

- Angular 17+
- TypeScript
- `HttpClient` d’Angular
