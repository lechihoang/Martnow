// Category constants - chú thích lúc tạo sản phẩm
export const CATEGORIES = [
  'Đồ uống',
  'Bánh kẹo',
  'Gia vị',
  'Lương thực',
  'Thực phẩm chế biến',
  'Đồ dùng vệ sinh',
  'Đồ gia dụng',
] as const;

export type Category = typeof CATEGORIES[number];

// Chú thích cho từng category
export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'Đồ uống': 'Nước ngọt, bia, rượu, nước suối, trà, cà phê',
  'Bánh kẹo': 'Bánh quy, kẹo, chocolate, snack các loại',
  'Gia vị': 'Nước mắm, tương ớt, dầu ăn, giấm, gia vị',
  'Lương thực': 'Gạo, đậu, ngũ cốc, bột mì, thực phẩm khô',
  'Thực phẩm chế biến': 'Mì tôm, cháo gói, thức ăn đóng hộp, đông lạnh',
  'Đồ dùng vệ sinh': 'Bột giặt, nước rửa chén, giấy vệ sinh, xà phòng',
  'Đồ gia dụng': 'Dụng cụ nhà bếp, đồ dùng sinh hoạt, thiết bị gia đình',
};
