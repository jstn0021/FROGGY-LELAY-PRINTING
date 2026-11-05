-- Run once in Supabase -> SQL Editor -> New query -> Run. Safe to run again.
-- Adds: customer file uploads (100 MB), order-received email tracking, admin management.

-- 1) New columns on orders -------------------------------------------------
alter table public.orders
  add column if not exists file_path text check (char_length(file_path) <= 500);
alter table public.orders
  add column if not exists confirmation_sent_at timestamptz;

drop policy if exists "anyone can place an order" on public.orders;
create policy "anyone can place an order"
  on public.orders for insert
  to anon, authenticated
  with check (
    status = 'pending' and discount_pct = 0
    and notified_at is null and confirmation_sent_at is null
  );

-- 2) Private bucket for customer files (100 MB = 104857600 bytes) ----------
insert into storage.buckets (id, name, public, file_size_limit)
values ('order-files', 'order-files', false, 104857600)
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit, public = false;

-- Customers can only ADD a file inside a folder named after a uuid.
-- Only admins can read or delete.
drop policy if exists "anyone can upload order files" on storage.objects;
create policy "anyone can upload order files"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'order-files'
    and name ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[A-Za-z0-9._-]{1,100}$'
  );

drop policy if exists "admin can read order files" on storage.objects;
create policy "admin can read order files"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'order-files' and public.is_admin());

drop policy if exists "admin can delete order files" on storage.objects;
create policy "admin can delete order files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'order-files' and public.is_admin());

-- 3) Let existing admins approve new sign-ups from the dashboard -----------
drop policy if exists "admin can read admins" on public.admins;
create policy "admin can read admins"
  on public.admins for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admin can add admins" on public.admins;
create policy "admin can add admins"
  on public.admins for insert
  to authenticated
  with check (public.is_admin() and email = lower(email));

drop policy if exists "admin can remove admins" on public.admins;
create policy "admin can remove admins"
  on public.admins for delete
  to authenticated
  using (public.is_admin() and email <> lower(coalesce(auth.jwt() ->> 'email', '')));
