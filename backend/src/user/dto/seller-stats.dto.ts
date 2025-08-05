export class SellerStatsDto {
  id: number;
  sellerId: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  pendingOrders: number;
  completedOrders: number;
  averageRating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: number = 0,
    sellerId: number = 0,
    totalOrders: number = 0,
    totalRevenue: number = 0,
    totalProducts: number = 0,
    pendingOrders: number = 0,
    completedOrders: number = 0,
    averageRating: number = 0,
    totalReviews: number = 0,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.sellerId = sellerId;
    this.totalOrders = totalOrders;
    this.totalRevenue = totalRevenue;
    this.totalProducts = totalProducts;
    this.pendingOrders = pendingOrders;
    this.completedOrders = completedOrders;
    this.averageRating = averageRating;
    this.totalReviews = totalReviews;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromEntity(stats: any): SellerStatsDto {
    return new SellerStatsDto(
      stats.id || 0,
      stats.sellerId || 0,
      stats.totalOrders || 0,
      stats.totalRevenue || 0,
      stats.totalProducts || 0,
      stats.pendingOrders || 0,
      stats.completedOrders || 0,
      stats.averageRating || 0,
      stats.totalReviews || 0,
      stats.createdAt || new Date(),
      stats.updatedAt || new Date()
    );
  }

  // Method to calculate completion rate
  getCompletionRate(): number {
    if (this.totalOrders === 0) return 0;
    return Number(((this.completedOrders / this.totalOrders) * 100).toFixed(2));
  }

  // Method to get performance summary
  getPerformanceSummary(): {
    totalOrders: number;
    completionRate: number;
    averageRating: number;
    totalRevenue: number;
  } {
    return {
      totalOrders: this.totalOrders,
      completionRate: this.getCompletionRate(),
      averageRating: this.averageRating,
      totalRevenue: this.totalRevenue,
    };
  }
}
