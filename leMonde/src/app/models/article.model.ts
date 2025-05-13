export interface Article {
  title: string;
  slug?: string;            // ← facultatif si vous ne l'avez pas encore
  pubDate: string;
  updated: string;
  description: string;
  link: string;
  imageUrl: string;
  mediaDescription: string;
  mediaCredit: string;
}
