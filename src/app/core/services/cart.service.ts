import { Injectable, signal, computed } from '@angular/core';
import { Product } from './product.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private items = signal<CartItem[]>(this.loadFromStorage());

  totalItems = computed(() =>
    this.items().reduce((sum, i) => sum + i.quantity, 0)
  );

  totalPrice = computed(() =>
    this.items().reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  );

  getItems() {
    return this.items;
  }

  add(product: Product) {
    const current = this.items();
    const existing = current.find(i => i.product.id === product.id);
    if (existing) {
      this.items.set(current.map(i =>
        i.product.id === product.id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      this.items.set([...current, { product, quantity: 1 }]);
    }
    this.saveToStorage();
  }

  remove(productId: string) {
    this.items.set(this.items().filter(i => i.product.id !== productId));
    this.saveToStorage();
  }

  updateQty(productId: string, quantity: number) {
    if (quantity <= 0) { this.remove(productId); return; }
    this.items.set(this.items().map(i =>
      i.product.id === productId ? { ...i, quantity } : i
    ));
    this.saveToStorage();
  }

  clear() {
    this.items.set([]);
    this.saveToStorage();
  }

  private saveToStorage() {
    localStorage.setItem('cart', JSON.stringify(this.items()));
  }

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem('cart');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }
}