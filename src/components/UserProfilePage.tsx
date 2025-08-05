import React from 'react';
import { useEnhancedUser, useUserManagement } from '../hooks/useEnhancedUser';
import { UserRole, OrderStatus } from '../types/entities';

interface UserProfilePageProps {
  userId: number;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({ userId }) => {
  const {
    user,
    reviews,
    buyerOrders,
    sellerOrders,
    loading,
    error,
    isBuyer,
    isSeller,
  } = useEnhancedUser(userId);

  const { becomeSeller, becomeBuyer, loading: managementLoading } = useUserManagement();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>User not found</div>;

  const handleBecomeSeller = async () => {
    const success = await becomeSeller(userId, {
      shopName: 'My New Shop',
      description: 'Welcome to my shop!',
    });
    if (success) {
      // Refresh data or show success message
      window.location.reload();
    }
  };

  const handleBecomeBuyer = async () => {
    const success = await becomeBuyer(userId);
    if (success) {
      // Refresh data or show success message
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* User Basic Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-4">
          {user.avatar && (
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-600">@{user.username}</p>
            <p className="text-sm text-blue-600 capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Role Management */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Account Type</h2>
        <div className="flex space-x-4">
          {!isBuyer && (
            <button
              onClick={handleBecomeBuyer}
              disabled={managementLoading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              Become a Buyer
            </button>
          )}
          {!isSeller && (
            <button
              onClick={handleBecomeSeller}
              disabled={managementLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Become a Seller
            </button>
          )}
        </div>
      </div>

      {/* Seller Info */}
      {isSeller && user.sellerInfo && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Seller Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Shop Name:</strong> {user.sellerInfo.shopName || 'Not set'}</p>
              <p><strong>Shop Address:</strong> {user.sellerInfo.shopAddress || 'Not set'}</p>
            </div>
            <div>
              <p><strong>Phone:</strong> {user.sellerInfo.shopPhone || 'Not set'}</p>
              <p><strong>Description:</strong> {user.sellerInfo.description || 'Not set'}</p>
            </div>
          </div>
        </div>
      )}

      {/* User Reviews */}
      {reviews && reviews.reviews.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">My Reviews</h2>
          <div className="space-y-4">
            {reviews.reviews.map((review) => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{review.productName}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-500">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 mt-2">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buyer Orders */}
      {isBuyer && buyerOrders && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">My Orders (as Buyer)</h2>
          <div className="space-y-4">
            {buyerOrders.orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">Order #{order.id}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${order.totalPrice}</p>
                    <span className={`text-sm px-2 py-1 rounded ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span>{item.productName} x{item.quantity}</span>
                      <span>${item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seller Orders */}
      {isSeller && sellerOrders && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Orders Received (as Seller)</h2>
          <div className="space-y-4">
            {sellerOrders.orders.map((order) => (
              <div key={order.orderId} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">Order #{order.orderId}</h3>
                    <p className="text-sm text-gray-600">
                      Customer: {order.buyerName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${order.totalPrice}</p>
                    <span className={`text-sm px-2 py-1 rounded ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span>{item.productName} x{item.quantity}</span>
                      <span>${item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
