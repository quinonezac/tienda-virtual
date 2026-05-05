import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { CurrencyPipe } from '@angular/common';
import { ProductService, Product } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    RouterLink, FormsModule, CurrencyPipe,
    MatCardModule, MatButtonModule, MatInputModule,
    MatFormFieldModule, MatIconModule, MatChipsModule,
    MatProgressSpinnerModule, MatBadgeModule,
  ],
  template: `
    <div class="min-h-screen bg-gray-50">

      <!-- NAVBAR -->
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <h1 class="text-xl font-bold text-indigo-600 flex-1">🛍️ Tienda Virtual</h1>

          <!-- Búsqueda -->
          <mat-form-field appearance="outline" class="flex-1 max-w-md" subscriptSizing="dynamic">
            <mat-icon matPrefix>search</mat-icon>
            <input matInput placeholder="Buscar productos..." [(ngModel)]="searchTerm"
              (ngModelChange)="onSearch()">
            @if (searchTerm) {
              <button matSuffix mat-icon-button (click)="clearSearch()">
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>

          <!-- Carrito -->
          <button mat-icon-button routerLink="/cart"
            [matBadge]="cartCount()" matBadgeColor="warn"
            [matBadgeHidden]="cartCount() === 0">
            <mat-icon>shopping_cart</mat-icon>
          </button>

          <!-- Admin -->
          <button mat-stroked-button routerLink="/admin">
            <mat-icon>admin_panel_settings</mat-icon>
          </button>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 py-6">

        <!-- Filtros por categoría -->
        <div class="flex gap-2 flex-wrap mb-6">
          <mat-chip-set>
            <mat-chip [highlighted]="!selectedCategory()"
              (click)="selectCategory(null)">Todos</mat-chip>
            @for (cat of categories(); track cat.id) {
              <mat-chip [highlighted]="selectedCategory() === cat.id"
                (click)="selectCategory(cat.id)">{{ cat.name }}</mat-chip>
            }
          </mat-chip-set>
        </div>

        <!-- Loading -->
        @if (loading()) {
          <div class="flex justify-center py-20">
            <mat-spinner diameter="48"></mat-spinner>
          </div>
        }

        <!-- Sin resultados -->
        @if (!loading() && products().length === 0) {
          <div class="text-center py-20 text-gray-400">
            <mat-icon class="text-6xl">inventory_2</mat-icon>
            <p class="mt-4 text-lg">No se encontraron productos</p>
            @if (searchTerm) {
              <button mat-stroked-button class="mt-4" (click)="clearSearch()">
                Limpiar búsqueda
              </button>
            }
          </div>
        }

        <!-- Grid de productos -->
        @if (!loading() && products().length > 0) {
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            @for (product of products(); track product.id) {
              <mat-card class="cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col">

                <!-- Imagen -->
                <div class="relative overflow-hidden bg-gray-100" style="height:200px"
                  [routerLink]="['/product', product.id]">
                  @if (product.images.length > 0) {
                    <img [src]="product.images[0]" [alt]="product.name"
                      loading="lazy"
					  class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
                  } @else {
                    <div class="w-full h-full flex items-center justify-center text-gray-300">
                      <mat-icon style="font-size:64px;width:64px;height:64px">image</mat-icon>
                    </div>
                  }

                  @if (product.stock === 0) {
                    <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span class="text-white font-bold text-sm bg-red-500 px-3 py-1 rounded-full">
                        Agotado
                      </span>
                    </div>
                  }
                </div>

                <mat-card-content class="flex-1 pt-4">
                  <p class="text-xs text-indigo-500 font-medium mb-1 uppercase tracking-wide">
                    {{ product.category.name }}
                  </p>
                  <h3 class="font-semibold text-gray-800 mb-1 line-clamp-2">{{ product.name }}</h3>
                  <p class="text-gray-500 text-sm line-clamp-2 mb-3">{{ product.description }}</p>
                  <p class="text-2xl font-bold text-indigo-600">
                    {{ product.price | currency:'PEN':'S/ ' }}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">{{ product.views }} vistas</p>
                </mat-card-content>

                <mat-card-actions class="p-4 pt-0">
                  <button mat-flat-button color="primary" class="w-full"
                    [disabled]="product.stock === 0"
                    (click)="addToCart(product)">
                    <mat-icon>add_shopping_cart</mat-icon>
                    Agregar al carrito
                  </button>
                </mat-card-actions>
              </mat-card>
            }
          </div>
        }
      </main>
    </div>
  `
})
export class CatalogComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private analytics = inject(AnalyticsService);
  private seo = inject(SeoService);
  
  products = signal<Product[]>([]);
  loading = signal(true);
  searchTerm = '';
  selectedCategory = signal<string | null>(null);
  cartCount = computed(() => this.cartService.totalItems());

  categories = computed(() => {
    const cats = new Map<string, { id: string; name: string }>();
    this.products().forEach(p => {
      if (p.category) cats.set(p.category.id, p.category);
    });
    return Array.from(cats.values());
  });

  ngOnInit() {
    this.seo.setPage('Catálogo', 'Encuentra los mejores productos en nuestra tienda');
	this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.productService.getAll(
      this.searchTerm || undefined,
      this.selectedCategory() || undefined
    ).subscribe({
      next: (data) => { this.products.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onSearch() {
    if (this.searchTerm) this.analytics.trackSearch(this.searchTerm);
	this.loadProducts();
  }

  clearSearch() {
    this.searchTerm = '';
    this.loadProducts();
  }

  selectCategory(id: string | null) {
    this.selectedCategory.set(id);
    this.loadProducts();
  }

  addToCart(product: Product) {
    this.cartService.add(product);
	this.analytics.trackAddToCart(product, 1);
  }
}