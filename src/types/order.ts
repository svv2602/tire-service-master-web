// Типы для системы заказов интернет-магазинов

export interface OrderItem {
  id: number;
  artikul: string;
  quantity: number;
  price: number;
  sum: number;
  bas_id: string;
  name?: string;
  description?: string;
  category?: string;
  brand?: string;
  model?: string;
  attributes?: Record<string, any>;
  formatted_price: string;
  formatted_sum: string;
  unit_description: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  status: 'received' | 'processing' | 'ready' | 'delivered' | 'canceled';
  order_date: string;
  ttn: string;
  number?: string;
  customer_name: string;
  customer_phone: string;
  point_name: string;
  point_id: string;
  third_party_point: boolean;
  status_kod: string;
  bas_id: string;
  separate: number;
  ttn_status?: string;
  ttn_status_kod?: string;
  total_amount: number;
  total_quantity: number;
  processed_at?: string;
  ready_at?: string;
  delivered_at?: string;
  canceled_at?: string;
  cancellation_reason?: string;
  notes?: string;
  metadata?: Record<string, any>;
  
  // Вычисляемые поля
  status_label: string;
  status_color: string;
  can_mark_as_ready: boolean;
  can_mark_as_delivered: boolean;
  can_cancel: boolean;
  formatted_order_date: string;
  formatted_phone: string;
  
  // Связи
  service_point?: any;
  order_items: OrderItem[];
  
  created_at: string;
  updated_at: string;
}

export interface OrderCreateData {
  status?: string;
  date: string;
  ttn: string;
  number?: string;
  phone: string;
  klient: string;
  status_kod: string;
  bas_id: string;
  separate?: number;
  ttn_status?: string;
  ttn_status_kod?: string;
  point: string;
  point_id: string;
  third_party_point?: string;
  goods: {
    artikul: string;
    quantity: number;
    price: number;
    sum: number;
    bas_id: string;
  }[];
}

export interface OrderFilters {
  status?: string;
  from_date?: string;
  to_date?: string;
  ttn?: string;
  customer?: string;
  phone?: string;
  service_point_id?: number;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface OrderUpdateData {
  notes?: string;
  cancellation_reason?: string;
}

export interface OrderResponse {
  orders: Order[];
  meta: {
    current_page: number;
    per_page: number;
    total_pages: number;
    total_count: number;
  };
} 