# API & Query Examples

## Supabase Client Setup

### Client-Side (Browser)
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
```

### Server-Side (Server Components)
```typescript
import { createServerClient } from '@/lib/supabase/server.server'

const supabase = createServerClient()
```

### Service Role (Server Actions/API Routes Only)
```typescript
import { createServiceRoleClient } from '@/lib/supabase/server.server'

// NEVER expose this to client-side!
const supabase = createServiceRoleClient()
```

## Query Examples

### Get Active Vendors
```typescript
import { getVendors } from '@/lib/supabase/queries'

const vendors = await getVendors({
  category: 'Food',
  deliveryAvailable: true,
  searchQuery: 'artisan',
})
```

### Search Products with Typeahead
```typescript
import { searchProducts } from '@/lib/supabase/queries'

const results = await searchProducts('lavender soap', 10)
```

### Get Vendor with Products
```typescript
import { getVendorBySlug, getVendorProducts } from '@/lib/supabase/queries'

const vendor = await getVendorBySlug('artisan-soaps')
const products = await getVendorProducts(vendor.id)
```

### Get Upcoming Market Days
```typescript
import { getUpcomingMarketDays } from '@/lib/supabase/queries'

const markets = await getUpcomingMarketDays(5)
```

### Create Order (Transaction)
```typescript
import { createOrderWithItems } from '@/lib/supabase/queries'
import { createServiceRoleClient } from '@/lib/supabase/server'

const serviceClient = createServiceRoleClient()

const order = await createOrderWithItems(
  {
    customerId: user.id,
    vendorId: 'vendor-uuid',
    marketDayId: 'market-uuid',
    fulfillmentType: 'pickup',
    items: [
      {
        productId: 'product-uuid',
        quantity: 2,
        unitPrice: 12.99,
      },
    ],
  },
  serviceClient
)
```

## Direct Supabase Queries

### Full-Text Search (Products)
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*, vendors(name, slug)')
  .textSearch('name,description', 'lavender', {
    type: 'plain',
    config: 'english',
  })
  .eq('is_available', true)
```

### Filter Vendors by Market Attendance
```typescript
const { data, error } = await supabase
  .from('market_stalls')
  .select(`
    *,
    vendors(*),
    market_days(*)
  `)
  .eq('market_day_id', marketDayId)
  .eq('attending_physically', true)
```

### Get Orders with Items (Vendor View)
```typescript
const { data, error } = await supabase
  .from('orders')
  .select(`
    *,
    order_items(
      *,
      products(name, image_urls)
    ),
    users(full_name, email)
  `)
  .eq('vendor_id', vendorId)
  .order('created_at', { ascending: false })
```

## Server Actions Example

### Create Order Action
```typescript
// app/actions/orders.ts
'use server'

import { createServiceRoleClient } from '@/lib/supabase/server'
import { createOrderWithItems } from '@/lib/supabase/queries'

export async function createOrder(orderData: OrderData) {
  const serviceClient = createServiceRoleClient()
  
  try {
    const order = await createOrderWithItems(orderData, serviceClient)
    return { success: true, order }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

## RLS Policy Examples

All queries automatically respect Row Level Security policies:

- **Vendors**: Can only update their own vendor profile
- **Products**: Vendors can only manage their own products
- **Orders**: Customers can only view their own orders
- **Market Days**: Only published markets are visible to public

## Performance Tips

1. **Use Indexes**: All commonly filtered columns are indexed
2. **Limit Results**: Always use `.limit()` for lists
3. **Select Specific Fields**: Don't use `*` - select only needed fields
4. **Use RPC Functions**: For complex queries, use database functions
5. **Client-Side Caching**: Use React Query or SWR for client-side caching

## Error Handling

```typescript
try {
  const { data, error } = await supabase.from('products').select('*')
  
  if (error) {
    console.error('Supabase error:', error)
    // Handle error
    return
  }
  
  // Use data
} catch (err) {
  console.error('Unexpected error:', err)
  // Handle unexpected error
}
```


