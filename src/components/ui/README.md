# UI Components

Reusable UI components for handling common page states and user interactions.

## LoadingSpinner

A configurable loading spinner with different sizes and custom messages.

```tsx
import { LoadingSpinner } from '@/components/ui';

// Basic usage
<LoadingSpinner />

// With custom size and message
<LoadingSpinner 
  size="lg" 
  message="Đang tải sản phẩm..." 
/>

// Small spinner for inline use
<LoadingSpinner 
  size="sm" 
  className="min-h-[100px]" 
/>
```

## ErrorDisplay

An error display component with retry functionality and customizable styling.

```tsx
import { ErrorDisplay } from '@/components/ui';

// Basic error display
<ErrorDisplay error="Không thể tải dữ liệu" />

// With retry button
<ErrorDisplay 
  error="Kết nối thất bại"
  onRetry={() => refetchData()}
  retryText="Thử lại"
/>

// Without icon
<ErrorDisplay 
  error="Lỗi nhỏ"
  showIcon={false}
  className="min-h-[150px]"
/>
```

## PageState

A comprehensive component that handles loading, error, empty, and success states.

```tsx
import { PageState } from '@/components/ui';

// Complete page state management
<PageState
  loading={isLoading}
  error={errorMessage}
  empty={data.length === 0}
  emptyMessage="Không có sản phẩm nào"
  onRetry={refetchData}
  loadingMessage="Đang tải..."
>
  <YourContent data={data} />
</PageState>

// With custom empty icon
<PageState
  empty={products.length === 0}
  emptyMessage="Chưa có sản phẩm"
  emptyIcon={
    <ShoppingCartIcon className="w-16 h-16 text-gray-400" />
  }
>
  <ProductList products={products} />
</PageState>
```

## Usage Patterns

### 1. Simple Loading State
```tsx
const MyComponent = () => {
  const [loading, setLoading] = useState(true);
  
  return (
    <PageState loading={loading}>
      <MyContent />
    </PageState>
  );
};
```

### 2. With Error Handling
```tsx
const MyComponent = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      await apiCall();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <PageState 
      loading={loading} 
      error={error}
      onRetry={fetchData}
    >
      <MyContent />
    </PageState>
  );
};
```

### 3. Complete State Management
```tsx
const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  return (
    <PageState
      loading={loading}
      error={error}
      empty={products.length === 0 && !loading && !error}
      emptyMessage="Chưa có sản phẩm nào"
      onRetry={fetchProducts}
      loadingMessage="Đang tải sản phẩm..."
      emptyIcon={<ShoppingIcon />}
    >
      <ProductGrid products={products} />
    </PageState>
  );
};
```

## State Priority

PageState handles states in this priority order:
1. **Loading** - Shows spinner while data is being fetched
2. **Error** - Shows error message if something went wrong  
3. **Empty** - Shows empty state if no data available
4. **Children** - Renders the actual content

This ensures a consistent and predictable user experience across the application.
