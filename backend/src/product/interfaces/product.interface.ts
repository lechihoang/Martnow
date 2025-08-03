export interface DeleteProductResponse {
  message: string;
}

export interface ProductQueryParams {
  categoryId?: number;
  sellerId?: number;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
}
