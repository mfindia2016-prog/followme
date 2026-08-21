create extension if not exists pgcrypto;

create type public.user_role as enum ('admin','agent');
create type public.lead_status as enum ('new','followup','won','lost');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  role public.user_role not null default 'agent',
  active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  sku text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  company_name text,
  phone text,
  email text,
  product_id uuid references public.products(id) on delete set null,
  assigned_agent uuid references public.profiles(id) on delete set null,
  status public.lead_status not null default 'new',
  source text,
  remarks text,
  next_followup_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.followups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  agent_id uuid references public.profiles(id) on delete set null,
  scheduled_at timestamptz not null,
  notes text,
  outcome text,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.login_logs (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete set null,
  login_at timestamptz not null default now(),
  logout_at timestamptz,
  ip_address inet
);

create index leads_status_idx on public.leads(status);
create index leads_agent_idx on public.leads(assigned_agent);
create index leads_followup_idx on public.leads(next_followup_at);
create index followups_schedule_idx on public.followups(scheduled_at, completed);

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.leads enable row level security;
alter table public.followups enable row level security;
alter table public.login_logs enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin' and active=true); $$;

create policy "profiles self or admin read" on public.profiles for select to authenticated using (id=auth.uid() or public.is_admin());
create policy "profiles admin write" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "products authenticated read" on public.products for select to authenticated using (true);
create policy "products admin write" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "leads read" on public.leads for select to authenticated using (assigned_agent=auth.uid() or created_by=auth.uid() or public.is_admin());
create policy "leads insert" on public.leads for insert to authenticated with check (created_by=auth.uid() or public.is_admin());
create policy "leads update" on public.leads for update to authenticated using (assigned_agent=auth.uid() or created_by=auth.uid() or public.is_admin()) with check (assigned_agent=auth.uid() or created_by=auth.uid() or public.is_admin());
create policy "leads delete admin" on public.leads for delete to authenticated using (public.is_admin());

create policy "followups read" on public.followups for select to authenticated using (agent_id=auth.uid() or public.is_admin());
create policy "followups insert" on public.followups for insert to authenticated with check (agent_id=auth.uid() or public.is_admin());
create policy "followups update" on public.followups for update to authenticated using (agent_id=auth.uid() or public.is_admin()) with check (agent_id=auth.uid() or public.is_admin());
create policy "followups delete admin" on public.followups for delete to authenticated using (public.is_admin());

create policy "login logs admin read" on public.login_logs for select to authenticated using (public.is_admin());
create policy "login logs self insert" on public.login_logs for insert to authenticated with check (user_id=auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public
as $$
begin
  insert into public.profiles(id,full_name,email)
  values(new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), new.email);
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

-- After creating the first user in Supabase Authentication, run:
-- update public.profiles set role='admin' where email='YOUR_ADMIN_EMAIL';
