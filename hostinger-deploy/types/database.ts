// Database types will be generated from Supabase
// For now, this is a placeholder structure
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          role: 'customer' | 'vendor' | 'admin' | 'super_user'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      businesses: {
        Row: {
          id: string
          owner_id: string
          name: string
          slug: string
          category: string
          description: string | null
          contact_phone: string | null
          contact_email: string | null
          address: string | null
          location_coords: unknown | null
          website_url: string | null
          opening_hours: any | null // JSONB
          social_links: any | null // JSONB
          logo_url: string | null
          images: string[] | null
          hero_image_url: string | null
          tagline: string | null
          delivery_available: boolean
          pickup_available: boolean
          is_verified: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['businesses']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['businesses']['Insert']>
      }
      vendors: {
        Row: {
          id: string
          user_id: string | null
          business_id: string | null // NEW: Link to parent business
          name: string
          slug: string
          tagline: string | null
          bio: string | null
          logo_url: string | null
          hero_image_url: string | null
          category: string | null
          is_verified: boolean
          is_active: boolean
          contact_email: string | null
          contact_phone: string | null
          website_url: string | null
          instagram_handle: string | null
          facebook_url: string | null
          delivery_available: boolean
          pickup_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['vendors']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['vendors']['Insert']>
      }
      products: {
        Row: {
          id: string
          vendor_id: string
          name: string
          slug: string
          description: string | null
          price: number
          compare_at_price: number | null
          sku: string | null
          stock_quantity: number
          is_available: boolean
          requires_preorder: boolean
          preorder_lead_days: number
          image_urls: string[] | null
          category: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      market_days: {
        Row: {
          id: string
          market_date: string
          location_name: string
          location_address: string | null
          location_coords: unknown | null
          start_time: string | null
          end_time: string | null
          is_published: boolean
          stall_map: unknown | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['market_days']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['market_days']['Insert']>
      }
      market_stalls: {
        Row: {
          id: string
          market_day_id: string
          vendor_id: string
          stall_number: string
          attending_physically: boolean
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['market_stalls']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['market_stalls']['Insert']>
      }
      user_event_intent: {
        Row: {
          id: string
          user_id: string
          event_id: string
          intent_type: 'favourite' | 'planning_to_attend'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_event_intent']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['user_event_intent']['Insert']>
      }
      user_event_intents: {
        Row: {
          user_id: string
          event_id: string | null
          market_day_id: string | null
          status: 'going' | 'interested' | 'not_going'
          notes: string | null
          agreed_to_policy: boolean
          attendee_count: number
          display_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_event_intents']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_event_intents']['Insert']>
      }
      event_counts: {
        Row: {
          event_id: string
          market_day_id: string | null
          events_table_id: string | null
          going_count: number
          interested_count: number
          not_going_count: number
          total_attendees: number
        }
      }
      orders: {
        Row: {
          id: string
          customer_id: string
          market_day_id: string | null
          vendor_id: string
          order_number: string
          status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
          fulfillment_type: 'pickup' | 'delivery'
          delivery_address: string | null
          delivery_notes: string | null
          total_amount: number
          subtotal: number
          tax_amount: number
          shipping_amount: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          line_total: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>
      }
      deals: {
        Row: {
          id: string
          title: string
          description: string | null
          vendor_id: string
          event_id: string | null
          valid_from: string | null
          valid_to: string | null
          status: 'active' | 'expired' | 'draft'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['deals']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['deals']['Insert']>
      }
      vendor_change_requests: {
        Row: {
          id: string
          vendor_id: string
          requested_by_user_id: string
          requested_changes: Record<string, any>
          status: 'pending' | 'approved' | 'rejected' | 'modified'
          admin_notes: string | null
          reviewed_by_user_id: string | null
          reviewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['vendor_change_requests']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['vendor_change_requests']['Insert']>
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          subject_id: string
          subject_type: 'business' | 'vendor' | 'market_day'
          rating: number
          comment: string | null
          images: string[] | null
          is_verified: boolean
          status: 'published' | 'reported' | 'hidden'
          helpful_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at' | 'updated_at' | 'helpful_count'>
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
      properties: {
        Row: {
          id: string
          owner_id: string
          business_id: string | null
          address: string
          type: 'apartment' | 'house' | 'condo' | 'villa' | 'commercial' | 'land' | 'other'
          property_type: 'rental' | 'event_space'
          availability: 'available' | 'rented' | 'sold' | 'pending' | 'unavailable'
          price: number // Monthly rental price (for rental properties)
          bedrooms: number | null // NULL for event spaces
          bathrooms: number | null // NULL for event spaces
          square_meters: number | null
          capacity: number | null // For event spaces only
          hourly_rate: number | null // For event spaces only
          daily_rate: number | null // For event spaces only
          description: string | null
          images: string[] | null
          location_coords: unknown | null // POINT type
          contact_phone: string | null
          contact_email: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['properties']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['properties']['Insert']>
      }
      review_helpful_votes: {
        Row: {
          id: string
          review_id: string
          user_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['review_helpful_votes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['review_helpful_votes']['Insert']>
      }
      review_summaries: {
        Row: {
          subject_id: string
          subject_type: 'business' | 'vendor' | 'market_day'
          total_reviews: number
          average_rating: number
          five_star_count: number
          four_star_count: number
          three_star_count: number
          two_star_count: number
          one_star_count: number
          verified_reviews_count: number
          latest_review_at: string | null
        }
      }
    }
    Views: {
      review_summaries: {
        Row: Database['public']['Tables']['review_summaries']['Row']
      }
    }
  }
}





