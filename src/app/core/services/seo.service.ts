import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private meta = inject(Meta);
  private title = inject(Title);

  setPage(title: string, description: string) {
    this.title.setTitle(`${title} | Tienda Virtual`);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
  }

  setProduct(name: string, description: string, image: string, price: number) {
    this.title.setTitle(`${name} | Tienda Virtual`);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: name });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:price:amount', content: price.toString() });
    this.meta.updateTag({ property: 'og:price:currency', content: 'PEN' });
  }
}