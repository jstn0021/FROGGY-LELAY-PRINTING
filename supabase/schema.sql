-- Lelay Store: run this whole file once in Supabase -> SQL Editor -> New query -> Run.

-- 1) Who is an admin ------------------------------------------------------
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;
-- No policies on purpose: nobody can read this table through the public API.

-- IMPORTANT: replace with the admin's real login email (use lowercase).
insert into public.admins (email) values ('YOUR_ADMIN_EMAIL@example.com')
on conflict do nothing;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- 2) Orders ---------------------------------------------------------------
create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  customer_name  text not null check (char_length(customer_name) between 1 and 120),
  customer_email text not null check (char_length(customer_email) between 5 and 200),
  customer_phone text check (char_length(customer_phone) <= 40),
  service_id     text not null,
  service_name   text not null,
  option_label   text not null,
  quantity       integer not null check (quantity between 1 and 9999),
  unit_price     numeric(10,2) not null check (unit_price >= 0),
  discount_pct   numeric(5,2) not null default 0 check (discount_pct between 0 and 100),
  total          numeric(10,2) not null default 0,
  description    text check (char_length(description) <= 1500),
  file_link      text check (char_length(file_link) <= 500),
  status         text not null default 'pending'
                 check (status in ('pending', 'ongoing', 'ready', 'finished')),
  notified_at    timestamptz
);

create index if not exists orders_status_created_idx
  on public.orders (status, created_at desc);

-- The total is always computed by the database, never trusted from the browser.
create or replace function public.set_order_totals()
returns trigger
language plpgsql
as $$
begin
  new.total := round(new.unit_price * new.quantity * (1 - new.discount_pct / 100), 2);
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists orders_set_totals on public.orders;
create trigger orders_set_totals
  before insert or update on public.orders
  for each row execute function public.set_order_totals();

alter table public.orders enable row level security;

drop policy if exists "anyone can place an order" on public.orders;
create policy "anyone can place an order"
  on public.orders for insert
  to anon, authenticated
  with check (status = 'pending' and discount_pct = 0 and notified_at is null);

drop policy if exists "admin can read orders" on public.orders;
create policy "admin can read orders"
  on public.orders for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admin can update orders" on public.orders;
create policy "admin can update orders"
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admin can delete orders" on public.orders;
create policy "admin can delete orders"
  on public.orders for delete
  to authenticated
  using (public.is_admin());

-- 3) Editable cover page --------------------------------------------------
create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;

drop policy if exists "anyone can read settings" on public.site_settings;
create policy "anyone can read settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "admin can insert settings" on public.site_settings;
create policy "admin can insert settings"
  on public.site_settings for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "admin can update settings" on public.site_settings;
create policy "admin can update settings"
  on public.site_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 4) Live updates on the dashboard ---------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null;
end $$;

-- 5) OPTIONAL: auto-delete finished orders after 7 days to keep the database small.
-- Turn on the pg_cron extension first (Database -> Extensions), then run:
--
-- select cron.schedule(
--   'delete-old-finished-orders',
--   '0 3 * * *',
--   $$ delete from public.orders
--      where status = 'finished' and updated_at < now() - interval '7 days' $$
-- );
