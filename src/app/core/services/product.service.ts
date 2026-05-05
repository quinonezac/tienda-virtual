import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  isActive: boolean;
  views: number;
  category: { id: string; name: string; slug: string };
  seller: { id: string; name: string; phone: string };
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getAll(search?: string, categoryId?: string): Observable<Product[]> {
    let url = `${this.api}/products`;
    const params: string[] = [];
    if (search) params.push(`search=${search}`);
    if (categoryId) params.push(`category=${categoryId}`);
    if (params.length) url += `?${params.join('&')}`;
    return this.http.get<Product[]>(url);
  }

  getOne(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.api}/products/${id}`);
  }

  create(data: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.api}/products`, data);
  }

  update(id: string, data: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.api}/products/${id}`, data);
  }

  delete(id: string): Observable<Product> {
    return this.http.delete<Product>(`${this.api}/products/${id}`);
  }
}