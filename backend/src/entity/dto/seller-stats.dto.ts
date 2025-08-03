export class SellerStatsDto {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  pendingOrders: number;

  constructor(
    totalOrders: number = 0,
    totalRevenue: number = 0,
    totalProducts: number = 0,
    pendingOrders: number = 0
  ) {
    this.totalOrders = totalOrders;
    this.totalRevenue = totalRevenue;
    this.totalProducts = totalProducts;
    this.pendingOrders = pendingOrders;
  }

  static fromEntity(stats: any): SellerStatsDto {
    return new SellerStatsDto(
      stats.totalOrders || 0,
      stats.totalRevenue || 0,
      stats.totalProducts || 0,
      stats.pendingOrders || 0
    );
  }
}
