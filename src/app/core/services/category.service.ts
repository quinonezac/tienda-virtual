import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getAll() {
    return this.http.get<Category[]>(`${this.api}/categories`);
  }

  create(name: string) {
    return this.http.post<Category>(`${this.api}/categories`, { name });
  }
}