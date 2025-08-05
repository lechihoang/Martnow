export class UserReviewsDto {
  userId: number;
  reviews: {
    id: number;
    productId: number;
    productName: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }[];
}

export class BuyerOrdersDto {
  buyerId: number;
  orders: {
    id: number;
    totalPrice: number;
    status: string;
    createdAt: Date;
    items: {
      productId: number;
      productName: string;
      quantity: number;
      price: number;
    }[];
  }[];
}

export class SellerOrdersDto {
  sellerId: number;
  orders: {
    orderId: number;
    buyerName: string;
    totalPrice: number;
    status: string;
    createdAt: Date;
    items: {
      productId: number;
      productName: string;
      quantity: number;
      price: number;
    }[];
  }[];
}
