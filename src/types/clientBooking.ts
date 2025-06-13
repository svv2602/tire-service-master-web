export interface ClientBookingRequest {
  booking_date: string;
  start_time: string;
  end_time: string;
  service_point_id: string | number;
  car_type_id: string | number;
  client_name: string;
  client_phone: string;
  client_email?: string;
  receive_notifications?: boolean;
  car_id?: string | number;
  license_plate?: string;
  notes?: string;
} 