export interface BrandMini { name: string; slug: string; }
export interface CategoryMini { name: string; slug: string; icon?: string; }
export interface Country { id: number; name: string; code: string; flag_emoji: string; }

export interface Brand { id: number; name: string; slug: string; logo: string; car_count: number; }
export interface Category { id: number; name: string; slug: string; icon: string; car_count: number; }

export interface CarImage { url: string; is_primary: boolean; }

export interface Car {
  id: number; stock_id: string; slug: string; title: string;
  make: string; model: string; year: number;
  price: string; fob_price: string | null; cif_price: string | null;
  mileage: number; condition: string; condition_display: string;
  transmission: string; fuel_type: string; location: string;
  featured: boolean; views_count: number;
  thumbnail: string; brand: BrandMini | null; category: CategoryMini | null;
  origin_country: Country | null;
}

export interface CarDetail extends Car {
  images: CarImage[]; description: string; features: string[];
  engine_cc: number | null; color: string; doors: number; seats: number;
  drivetrain: string; steering: string; steering_display: string;
  related: Car[];
}

export interface Product {
  id: number; stock_id: string; slug: string; name: string; model: string;
  price: string; condition: string; condition_display: string; location: string;
  featured: boolean; views_count: number;
  thumbnail: string; brand: BrandMini | null; category: CategoryMini | null;
}
export interface ProductDetail extends Product {
  images: CarImage[]; description: string; specifications: [string, string][];
  related: Product[];
}

export interface Bid { id: number; username: string; initials: string; amount: string; created: string; }
export interface Auction {
  id: number; title: string; slug: string; image: string;
  current_bid: string; starting_price: string; bid_increment: string;
  total_bids: number; next_min_bid: string; start_date: string; end_date: string;
  status: "live" | "scheduled" | "ended"; featured: boolean;
  car: { slug: string; title: string } | null;
}
export interface AuctionDetail extends Auction { description: string; bids: Bid[]; }

export interface Slide { title: string; subtitle: string; button_text: string; link: string; image: string; }
export interface Testimonial { name: string; country: string; role: string; quote: string; rating: number; }

export interface Site {
  site_name: string; tagline: string; site_description: string;
  contact_email: string; contact_phone: string; whatsapp_number: string;
  company_address: string; social_links: Record<string, string>;
}

export interface User {
  id: number; username: string; email: string; first_name: string; last_name: string;
  display_name: string; initials: string; phone: string; country: string;
}

export interface SavedSearch {
  id: number; name: string; query: string; alerts: boolean;
  matches: number; new_matches: number; last_seen: string; created: string;
}

export interface Paginated<T> { count: number; next: string | null; previous: string | null; results: T[]; }

export interface HomeData {
  slides: Slide[]; featured_cars: Car[]; new_arrivals: Car[]; popular_cars: Car[];
  categories: Category[]; brands: Brand[]; featured_products: Product[];
  live_auctions: Auction[]; testimonials: Testimonial[];
  stats: { total_cars: number; total_brands: number; total_products: number; countries_served: number };
}
