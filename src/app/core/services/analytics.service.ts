import { Injectable } from '@angular/core';

declare let gtag: Function;

@Injectable({ providedIn: 'root' })
export class AnalyticsService {

  // Rastrear vista de página
  trackPage(path: string, title: string) {
    try {
      gtag('event', 'page_view', {
        page_path: path,
        page_title: title,
      });
    } catch (e) {}
  }

  // Rastrear vista de producto
  trackProductView(product: { id: string; name: string; price: number }) {
    try {
      gtag('event', 'view_item', {
        currency: 'PEN',
        value: product.price,
        items: [{
          item_id: product.id,
          item_name: product.name,
          price: product.price,
        }]
      });
    } catch (e) {}
  }

  // Rastrear agregar al carrito
  trackAddToCart(product: { id: string; name: string; price: number }, quantity: number) {
    try {
      gtag('event', 'add_to_cart', {
        currency: 'PEN',
        value: product.price * quantity,
        items: [{
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          quantity,
        }]
      });
    } catch (e) {}
  }

  // Rastrear click en WhatsApp
  trackWhatsAppClick(total: number, itemCount: number) {
    try {
      gtag('event', 'whatsapp_order', {
        currency: 'PEN',
        value: total,
        item_count: itemCount,
      });
    } catch (e) {}
  }

  // Rastrear búsqueda
  trackSearch(term: string) {
    try {
      gtag('event', 'search', { search_term: term });
    } catch (e) {}
  }
}