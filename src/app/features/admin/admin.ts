import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService, Product } from '../../core/services/product.service';
import { CategoryService, Category } from '../../core/services/category.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    DecimalPipe, FormsModule,ReactiveFormsModule, RouterLink, CurrencyPipe,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatSelectModule, MatIconModule,
    MatTableModule, MatChipsModule, MatSnackBarModule,
    MatTabsModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="min-h-screen bg-gray-50">

      <!-- Header -->
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button mat-icon-button routerLink="/">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1 class="text-xl font-bold text-gray-800 flex-1">Panel de Administración</h1>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 py-6">
        <mat-tab-group>

          <!-- TAB: Productos -->
          <mat-tab label="Productos">
            <div class="py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

              <!-- Formulario -->
              <mat-card class="lg:col-span-1">
                <mat-card-header>
                  <mat-card-title>
                    {{ editing() ? 'Editar Producto' : 'Nuevo Producto' }}
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-3 mt-4">

                    <mat-form-field appearance="outline">
                      <mat-label>Nombre del producto</mat-label>
                      <input matInput formControlName="name">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Descripción</mat-label>
                      <textarea matInput formControlName="description" rows="3"></textarea>
                    </mat-form-field>

                    <div class="grid grid-cols-2 gap-3">
                      <mat-form-field appearance="outline">
                        <mat-label>Precio (S/)</mat-label>
                        <input matInput formControlName="price" type="number" min="0">
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Stock</mat-label>
                        <input matInput formControlName="stock" type="number" min="0">
                      </mat-form-field>
                    </div>

                    <mat-form-field appearance="outline">
                      <mat-label>Categoría</mat-label>
                      <mat-select formControlName="categoryId">
                        @for (cat of categories(); track cat.id) {
                          <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>URL de imagen</mat-label>
                      <input matInput formControlName="imageUrl"
                        placeholder="https://...">
                      <mat-hint>Pega una URL de imagen por ahora</mat-hint>
                    </mat-form-field>

                    <!-- Preview imagen -->
                    @if (productForm.get('imageUrl')?.value) {
                      <div class="rounded-lg overflow-hidden h-40 bg-gray-100">
                        <img [src]="productForm.get('imageUrl')?.value"
                          loading="lazy"
						  class="w-full h-full object-cover"
                          onerror="this.style.display='none'">
                      </div>
                    }

                    <div class="flex gap-2">
                      <button mat-flat-button color="primary" type="submit"
                        [disabled]="productForm.invalid || saving()" class="flex-1">
                        @if (saving()) { <mat-spinner diameter="20"></mat-spinner> }
                        @else { {{ editing() ? 'Actualizar' : 'Crear Producto' }} }
                      </button>
                      @if (editing()) {
                        <button mat-stroked-button type="button" (click)="cancelEdit()">
                          Cancelar
                        </button>
                      }
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>

              <!-- Lista de productos -->
              <mat-card class="lg:col-span-2">
                <mat-card-header>
                  <mat-card-title>Mis productos ({{ products().length }})</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  @if (loadingProducts()) {
                    <div class="flex justify-center py-10">
                      <mat-spinner diameter="36"></mat-spinner>
                    </div>
                  }
                  @if (!loadingProducts() && products().length === 0) {
                    <div class="text-center py-10 text-gray-400">
                      <mat-icon>inventory_2</mat-icon>
                      <p>No hay productos aún</p>
                    </div>
                  }
                  <div class="flex flex-col gap-3 mt-4">
                    @for (product of products(); track product.id) {
                      <div class="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                        <div class="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          @if (product.images.length > 0) {
                            <img [src]="product.images[0]" loading="lazy" class="w-full h-full object-cover">
                          } @else {
                            <div class="w-full h-full flex items-center justify-center">
                              <mat-icon class="text-gray-300">image</mat-icon>
                            </div>
                          }
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="font-medium text-gray-800 truncate">{{ product.name }}</p>
                          <p class="text-sm text-indigo-600 font-bold">
                            {{ product.price | currency:'PEN':'S/ ' }}
                          </p>
                          <p class="text-xs text-gray-400">Stock: {{ product.stock }}</p>
                        </div>
                        <div class="flex gap-1">
                          <button mat-icon-button color="primary" (click)="editProduct(product)">
                            <mat-icon>edit</mat-icon>
                          </button>
                          <button mat-icon-button color="warn" (click)="deleteProduct(product.id)">
                            <mat-icon>delete</mat-icon>
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- TAB: Categorías -->
          <mat-tab label="Categorías">
            <div class="py-6 max-w-md">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Nueva Categoría</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="flex gap-2 mt-4">
                    <mat-form-field appearance="outline" class="flex-1">
                      <mat-label>Nombre</mat-label>
                      <input matInput [(ngModel)]="newCategory"
                        [ngModelOptions]="{standalone: true}">
                    </mat-form-field>
                    <button mat-flat-button color="primary" (click)="createCategory()">
                      Crear
                    </button>
                  </div>
                  <div class="flex flex-wrap gap-2 mt-4">
                    @for (cat of categories(); track cat.id) {
                      <mat-chip>{{ cat.name }}</mat-chip>
                    }
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

		<!-- TAB: Dashboard -->
		<mat-tab label="Dashboard">
		  <div class="py-6">

			<!-- Tarjetas métricas -->
			<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
			  <mat-card class="text-center p-6">
				<p class="text-4xl font-bold text-indigo-600">{{ products().length }}</p>
				<p class="text-gray-500 mt-2">Productos activos</p>
			  </mat-card>
			  <mat-card class="text-center p-6">
				<p class="text-4xl font-bold text-green-600">{{ categories().length }}</p>
				<p class="text-gray-500 mt-2">Categorías</p>
			  </mat-card>
			  <mat-card class="text-center p-6">
				<p class="text-4xl font-bold text-orange-500">
				  {{ products().length > 0 ? (getTotalViews() | number) : 0 }}
				</p>
				<p class="text-gray-500 mt-2">Vistas totales</p>
			  </mat-card>
			</div>

			<!-- Top productos más vistos -->
			<mat-card>
			  <mat-card-header>
				<mat-card-title>Productos más vistos</mat-card-title>
			  </mat-card-header>
			  <mat-card-content class="mt-4">
				@for (product of topProducts(); track product.id; let i = $index) {
				  <div class="flex items-center gap-4 py-3 border-b last:border-0">
					<span class="text-2xl font-bold text-gray-300 w-8">{{ i + 1 }}</span>
					<div class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
					  @if (product.images.length > 0) {
						<img [src]="product.images[0]" loading="lazy" class="w-full h-full object-cover">
					  }
					</div>
					<div class="flex-1">
					  <p class="font-medium text-gray-800">{{ product.name }}</p>
					  <p class="text-sm text-gray-500">{{ product.category?.name }}</p>
					</div>
					<div class="text-right">
					  <p class="font-bold text-indigo-600">
						{{ product.price | currency:'PEN':'S/ ' }}
					  </p>
					  <p class="text-sm text-gray-400">{{ product.views }} vistas</p>
					</div>
				  </div>
				}
				@if (topProducts().length === 0) {
				  <p class="text-center text-gray-400 py-8">Sin datos aún</p>
				}
			  </mat-card-content>
			</mat-card>
		  </div>
		</mat-tab>
		
        </mat-tab-group>
      </main>
    </div>
  `
})
export class AdminComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  topProducts = signal<any[]>([]);
  totalOrders = signal(0);
  totalRevenue = signal(0);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(false);
  loadingProducts = signal(false);
  saving = signal(false);
  editing = signal<string | null>(null);
  newCategory = '';

  // ID temporal del vendedor — en Fase 3 completa vendrá del JWT
  private SELLER_ID = '76d6e1d7-d35f-485a-94fc-d03ebab1ba87';

  productForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    categoryId: ['', Validators.required],
    imageUrl: [''],
  });

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
	this.loadDashboard();
  }

  loadProducts() {
    this.loadingProducts.set(true);
    this.productService.getAll().subscribe({
      next: (data) => { this.products.set(data); this.loadingProducts.set(false); },
      error: () => this.loadingProducts.set(false)
    });
  }

  loadCategories() {
    this.categoryService.getAll().subscribe({
      next: (data) => this.categories.set(data)
    });
  }

  onSubmit() {
	if (this.productForm.invalid) return;
	  this.saving.set(true);

	  const val = this.productForm.value;
	  const data = {
		name: val.name ?? '',
		description: val.description ?? '',
		price: Number(val.price ?? 0),
		stock: Number(val.stock ?? 0),
		images: val.imageUrl ? [val.imageUrl] : [],
		categoryId: val.categoryId ?? '',
		sellerId: this.SELLER_ID,
	  };

	  if (this.editing()) {
		this.productService.update(this.editing()!, data).subscribe({
		  next: () => {
			this.snackBar.open('Producto actualizado', 'OK', { duration: 3000 });
			this.loadProducts();
			this.cancelEdit();
			this.saving.set(false);
		  },
		  error: () => this.saving.set(false)
		});
	  } else {
		this.productService.create(data).subscribe({
		  next: () => {
			this.snackBar.open('Producto creado', 'OK', { duration: 3000 });
			this.productForm.reset({ price: 0, stock: 0 });
			this.loadProducts();
			this.saving.set(false);
		  },
		  error: () => this.saving.set(false)
		});
	  }
  }

  editProduct(product: Product) {
    this.editing.set(product.id);
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.category?.id,
      imageUrl: product.images[0] || '',
    });
  }

  cancelEdit() {
    this.editing.set(null);
    this.productForm.reset({ price: 0, stock: 0 });
  }

  deleteProduct(id: string) {
    if (!confirm('¿Eliminar este producto?')) return;
    this.productService.delete(id).subscribe({
      next: () => {
        this.snackBar.open('Producto eliminado', 'OK', { duration: 3000 });
        this.loadProducts();
      }
    });
  }

  createCategory() {
    if (!this.newCategory.trim()) return;
    this.categoryService.create(this.newCategory).subscribe({
      next: () => {
        this.snackBar.open('Categoría creada', 'OK', { duration: 3000 });
        this.newCategory = '';
        this.loadCategories();
      }
    });
  }
  
  loadDashboard() {
  this.productService.getAll().subscribe(products => {
    const sorted = [...products].sort((a, b) => b.views - a.views);
    this.topProducts.set(sorted.slice(0, 5));
  });
  }
  
  getTotalViews(): number {
  return this.products().reduce((sum, p) => sum + (p.views || 0), 0);
  }
}