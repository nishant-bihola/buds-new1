-- ============================================================
-- Bud N' Buddies — Supabase Schema
-- Run this entire file in Supabase SQL Editor (one-shot)
-- ============================================================

-- Products (source of truth, replaces Firebase + INITIAL_PRODUCTS constant)
create table if not exists products (
  id            text primary key,
  name          text not null,
  price         numeric(10,2) not null,
  image         text,
  description   text,
  category      text not null,
  is_best_seller boolean default false,
  color         text,
  splash_image  text,
  in_stock      boolean default true,
  sort_order    integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Customers
create table if not exists customers (
  id                  uuid primary key default gen_random_uuid(),
  email               text unique not null,
  name                text,
  phone               text,
  address             text,
  stripe_customer_id  text,
  sms_opt_in          boolean default false,
  total_orders        integer default 0,
  total_spent         numeric(10,2) default 0,
  created_at          timestamptz default now(),
  last_order_at       timestamptz
);

-- Orders
create table if not exists orders (
  id                       uuid primary key default gen_random_uuid(),
  stripe_session_id        text unique not null,
  stripe_payment_intent_id text,
  customer_id              uuid references customers(id),
  customer_email           text not null,
  customer_name            text,
  customer_phone           text,
  shipping_address         text,
  items                    jsonb not null,
  subtotal                 numeric(10,2) not null,
  total                    numeric(10,2) not null,
  currency                 text default 'cad',
  status                   text default 'pending',
  stripe_status            text,
  notes                    text,
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);

-- Abandoned carts
create table if not exists abandoned_carts (
  id               uuid primary key default gen_random_uuid(),
  session_key      text unique not null,
  email            text,
  phone            text,
  name             text,
  items            jsonb not null,
  total            numeric(10,2),
  reminder_sent    boolean default false,
  reminder_sent_at timestamptz,
  converted        boolean default false,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- Automation settings
create table if not exists automation_settings (
  key        text primary key,
  enabled    boolean default true,
  updated_at timestamptz default now()
);

-- Seed automation settings
insert into automation_settings (key, enabled) values
  ('order_confirm_email',  true),
  ('order_confirm_sms',    false),
  ('abandoned_cart_email', true),
  ('abandoned_cart_sms',   false)
on conflict (key) do nothing;

-- Auto-update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create or replace trigger products_updated_at       before update on products       for each row execute procedure set_updated_at();
create or replace trigger orders_updated_at         before update on orders         for each row execute procedure set_updated_at();
create or replace trigger abandoned_carts_updated_at before update on abandoned_carts for each row execute procedure set_updated_at();

-- ============================================================
-- Row-Level Security
-- ============================================================
alter table products          enable row level security;
alter table customers         enable row level security;
alter table orders            enable row level security;
alter table abandoned_carts   enable row level security;
alter table automation_settings enable row level security;

-- Products: public read (anon key), write via service role only
create policy "public products read" on products for select using (true);

-- All other tables: service role only (serverless API routes use service role key)

-- ============================================================
-- Seed Products (all 16 from the menu)
-- ============================================================
insert into products (id, name, price, image, description, category, is_best_seller, sort_order) values
  ('flower-01', 'Nano Banana Kush',  35.00, '/images/nano_banana_kush.png',   'Ultra-smooth, high potency, tropical banana notes. Great for creative afternoons.',          'Dried Flower', true,  1),
  ('flower-02', 'Island Pink Kush',  32.00, '/images/island_pink_kush.png',   'Classic BC bud. Heavy resin, floral terpenes, deep body relaxation.',                        'Dried Flower', false, 2),
  ('preroll-01','Signature Pre-Roll Fan', 25.00, '/images/signature_preroll_fan.png', 'A premium fan of curated pre-rolled joints. Our most popular product.',               'Pre-Roll',     true,  3),
  ('preroll-02','Space Race Single Joint', 14.00, '/images/space_race_single.png', 'Premium single pre-roll in a protective tube.',                                          'Pre-Roll',     false, 4),
  ('preroll-03','Multi-Pack Pre-Rolls', 45.00, '/images/multi_pack_prerolls.png', 'Large pack for sharing with the crew. Best value.',                                       'Pre-Roll',     true,  5),
  ('preroll-04','Blue Tip Classic', 12.00, '/images/blue_tip_classic.png', 'Hand-rolled with a signature blue tip for style and smooth airflow.',                           'Pre-Roll',     false, 6),
  ('vape-01',   'High Voltage HTFSE Cartridge', 45.00, '/images/high_voltage_vape.png', 'Full-spectrum extract cart. Ultimate flavor and entourage effect.',                 'Vape',         true,  7),
  ('edible-01', 'Sour Peach Rings',  19.99, '/images/sour_peach_rings.png',   'Consistent THC dosing, fan favorite. Great for discreet consumption.',                       'Edible',       true,  8),
  ('edible-02', 'Chowie Wowie Soft Caramel Milk Chocolate', 12.99, '/images/chowie_wowie_caramel.png', 'Decadent caramel chocolate. Perfectly balanced.',                    'Edible',       true,  9),
  ('edible-04', 'Bhang Cookies and Cream White Chocolate', 11.50, '/images/bhang_cookies_cream.png', 'Creamy white chocolate with cookie crunch. Consistent dosing.',        'Edible',       true,  10),
  ('bev-01',    'Solei Mango Passionfruit', 7.50, '/images/solei_mango_passionfruit.png', '10mg THC, tropical and refreshing.',                                              'Beverage',     true,  11),
  ('bev-02',    "Punchy's Fruit Punch", 8.00, '/images/punchys_fruit_punch.png', 'Classic fruit punch, 10mg THC kick.',                                                     'Beverage',     false, 12),
  ('bev-03',    'Snapback Blackberry Creamsicle', 8.50, '/images/snapback_blackberry_creamsicle.png', 'Blackberry creamsicle soda with premium THC.',                        'Beverage',     false, 13),
  ('bev-04',    'Bubble Kush Tahiti Trip Soda', 7.99, '/images/bubble_kush_soda.png', 'Tropical soda infused with premium THC.',                                            'Beverage',     false, 14),
  ('accessory-06','Premium Buds Grinder', 24.99, '/images/premium_grinder.png', 'Heavy duty 4-piece with pollen catcher.',                                                  'Accessories',  false, 15),
  ('accessory-01','Randy''s Stainless Screens', 0.99, '/images/stainless_screens.png', '20-pack essential kit.',                                                             'Accessories',  false, 16)
on conflict (id) do nothing;
