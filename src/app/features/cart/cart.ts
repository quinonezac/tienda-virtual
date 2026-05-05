import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CartService } from '../../core/services/cart.service';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    RouterLink, CurrencyPipe,
    MatCardModule, MatButtonModule, MatIconModule,
    MatDividerModule, MatSnackBarModule,
  ],
  template: `
    <div class="min-h-screen bg-gray-50">

      <!-- Header -->
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <div class="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <button mat-icon-button routerLink="/">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1 class="text-xl font-bold text-gray-800 flex-1">
            Mi Carrito
          </h1>
          @if (items().length > 0) {
            <button mat-stroked-button color="warn" (click)="clearCart()">
              <mat-icon>delete_sweep</mat-icon>
              Vaciar
            </button>
          }
        </div>
      </header>

      <main class="max-w-4xl mx-auto px-4 py-6">

        <!-- Carrito vacío -->
        @if (items().length === 0) {
          <div class="text-center py-24 text-gray-400">
            <mat-icon style="font-size:80px;width:80px;height:80px">
              shopping_cart
            </mat-icon>
            <p class="text-xl mt-4 font-medium">Tu carrito está vacío</p>
            <p class="text-sm mt-2">Agrega productos desde el catálogo</p>
            <button mat-flat-button color="primary" class="mt-6" routerLink="/">
              Ver catálogo
            </button>
          </div>
        }

        <!-- Lista de items -->
        @if (items().length > 0) {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <!-- Items -->
            <div class="lg:col-span-2 flex flex-col gap-4">
              @for (item of items(); track item.product.id) {
                <mat-card>
                  <div class="flex gap-4 p-4">

                    <!-- Imagen -->
                    <div class="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      @if (item.product.images.length > 0) {
                        <img [src]="item.product.images[0]"
                          [alt]="item.product.name"
						  loading="lazy"
                          class="w-full h-full object-cover">
                      } @else {
                        <div class="w-full h-full flex items-center justify-center">
                          <mat-icon class="text-gray-300">image</mat-icon>
                        </div>
                      }
                    </div>

                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                      <h3 class="font-semibold text-gray-800 truncate">
                        {{ item.product.name }}
                      </h3>
                      <p class="text-sm text-gray-500 mt-1">
                        {{ item.product.price | currency:'PEN':'S/ ' }} c/u
                      </p>
                      <p class="text-indigo-600 font-bold mt-1">
                        {{ item.product.price * item.quantity | currency:'PEN':'S/ ' }}
                      </p>

                      <!-- Controles cantidad -->
                      <div class="flex items-center gap-3 mt-3">
                        <button mat-icon-button
                          (click)="updateQty(item.product.id, item.quantity - 1)">
                          <mat-icon>remove_circle_outline</mat-icon>
                        </button>
                        <span class="text-lg font-bold w-8 text-center">
                          {{ item.quantity }}
                        </span>
                        <button mat-icon-button
                          (click)="updateQty(item.product.id, item.quantity + 1)">
                          <mat-icon>add_circle_outline</mat-icon>
                        </button>
                        <button mat-icon-button color="warn" class="ml-auto"
                          (click)="removeItem(item.product.id)">
                          <mat-icon>delete</mat-icon>
                        </button>
                      </div>
                    </div>
                  </div>
                </mat-card>
              }
            </div>

            <!-- Resumen del pedido -->
            <div class="lg:col-span-1">
              <mat-card class="sticky top-20">
                <mat-card-header>
                  <mat-card-title>Resumen del pedido</mat-card-title>
                </mat-card-header>
                <mat-card-content class="mt-4">

                  <!-- Detalle items -->
                  @for (item of items(); track item.product.id) {
                    <div class="flex justify-between text-sm py-1">
                      <span class="text-gray-600 truncate flex-1 mr-2">
                        {{ item.product.name }} x{{ item.quantity }}
                      </span>
                      <span class="font-medium">
                        {{ item.product.price * item.quantity | currency:'PEN':'S/ ' }}
                      </span>
                    </div>
                  }

                  <mat-divider class="my-4"></mat-divider>

                  <div class="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span class="text-indigo-600">
                      {{ totalPrice() | currency:'PEN':'S/ ' }}
                    </span>
                  </div>

                  <div class="flex justify-between text-sm text-gray-500 mt-1">
                    <span>{{ totalItems() }} producto(s)</span>
                  </div>

                  <mat-divider class="my-4"></mat-divider>

                  <!-- Botón WhatsApp -->
                  <button mat-flat-button class="w-full text-white font-bold py-3"
                    style="background-color: #25D366"
                    (click)="sendWhatsApp()">
                    <mat-icon>whatsapp</mat-icon>
                    Enviar pedido por WhatsApp
                  </button>

                  <p class="text-xs text-gray-400 text-center mt-3">
                    Se abrirá WhatsApp con el detalle de tu pedido listo para enviar
                  </p>

                  <button mat-stroked-button class="w-full mt-3" routerLink="/">
                    Seguir comprando
                  </button>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        }
      </main>
    </div>
  `
})
export class CartComponent {
  private cartService = inject(CartService);
  private snackBar = inject(MatSnackBar);
  private analytics = inject(AnalyticsService);

  items = this.cartService.getItems();
  totalItems = this.cartService.totalItems;
  totalPrice = this.cartService.totalPrice;

  // Número WhatsApp del vendedor — configurable
  private WHATSAPP_NUMBER = '+51922779532'; // Peru +51, cambia por el número real

  updateQty(productId: string, quantity: number) {
    this.cartService.updateQty(productId, quantity);
  }

  removeItem(productId: string) {
    this.cartService.remove(productId);
    this.snackBar.open('Producto eliminado del carrito', 'OK', { duration: 2000 });
  }

  clearCart() {
    this.cartService.clear();
    this.snackBar.open('Carrito vaciado', 'OK', { duration: 2000 });
  }

  sendWhatsApp() {
    const items = this.items();
    if (items.length === 0) return;
	this.analytics.trackWhatsAppClick(this.totalPrice(), this.totalItems());

    // Generar mensaje formateado
    const lines = items.map(i =>
      `▪ ${i.product.name} x${i.quantity} = S/ ${(i.product.price * i.quantity).toFixed(2)}`
    );

    const message = [
      '🛍️ *NUEVO PEDIDO*',
      '─────────────────',
      ...lines,
      '─────────────────',
      `*TOTAL: S/ ${this.totalPrice().toFixed(2)}*`,
      '',
      '📦 Por favor confirmar disponibilidad y coordinar entrega.',
    ].join('\n');

    const url = `https://wa.me/${this.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }
}