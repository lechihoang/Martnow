// ✅ Simplified SellerStatsDto - Plain data object without business logic
export class SellerStatsDto {
  id: number;
  sellerId: string;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  pendingOrders: number;
  completedOrders: number;
  averageRating: number;
  totalReviews: number;
  completionRate: number; // ✅ Computed once when creating DTO
  
  constructor(stats: any) {
    this.id = stats.id || 0;
    this.sellerId = stats.sellerId || '';
    this.totalOrders = stats.totalOrders || 0;
    this.totalRevenue = Number(stats.totalRevenue || 0);
    this.totalProducts = stats.totalProducts || 0;
    this.pendingOrders = stats.pendingOrders || 0;
    this.completedOrders = stats.completedOrders || 0;
    this.averageRating = Number(stats.averageRating || 0);
    this.totalReviews = stats.totalReviews || 0;
    
    // ✅ Calculate completion rate once in constructor
    this.completionRate = this.totalOrders > 0 
      ? Number(((this.completedOrders / this.totalOrders) * 100).toFixed(2))
      : 0;
  }
}
