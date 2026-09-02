-- Initial schema with tenant isolation, roles, and audit logging
-- Run via Supabase CLI: supabase db push

create extension if not exists "uuid-ossp";

-- Organizations (top-level tenant)
create table if not exists public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz default now()
);

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz default now()
);

-- Memberships (user–org with role)
create table if not exists public.memberships (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('firm_admin','attorney','paralegal','client','reviewer')),
  created_at timestamptz default now(),
  unique (org_id, user_id)
);

-- Cases
create table if not exists public.cases (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  matter_id uuid,
  user_id uuid references auth.users(id),
  title text not null,
  client text not null,
  client_email text,
  client_phone text,
  type text not null default 'Other',
  status text not null default 'Active' check (status in ('Active','Pending','Closed','On Hold')),
  filed date,
  next_deadline date,
  next_deadline_label text,
  notes text,
  estimated_value text,
  attorney text,
  priority text not null default 'Medium' check (priority in ('High','Medium','Low')),
  department text,
  war_room_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Matters
create table if not exists public.matters (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  case_id uuid references public.cases(id) on delete cascade,
  title text not null,
  status text not null default 'open',
  created_at timestamptz default now()
);

-- Documents (file metadata, storage_path points to storage)
create table if not exists public.documents (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  matter_id uuid references public.matters(id) on delete cascade,
  case_id uuid references public.cases(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  file_hash text not null,  -- immutable hash
  uploader_id uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Audit log
create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id),
  action text not null,
  details jsonb,
  created_at timestamptz default now()
);

-- Enable Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matters        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs     ENABLE ROW LEVEL SECURITY;

-- Policies: SELECT (read) – only users who belong to the org
create policy "users see their organizations" on public.organizations
  for select using (
    exists (select 1 from public.memberships m where m.org_id = organizations.id and m.user_id = auth.uid())
  );

create policy "users see own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "users see memberships of their orgs" on public.memberships
  for select using (
    exists (select 1 from public.memberships m where m.org_id = memberships.org_id and m.user_id = auth.uid())
  );

create policy "users see cases in their orgs" on public.cases
  for select using (
    exists (select 1 from public.memberships m where m.org_id = cases.org_id and m.user_id = auth.uid())
  );

create policy "users see matters in their orgs" on public.matters
  for select using (
    exists (select 1 from public.memberships m where m.org_id = matters.org_id and m.user_id = auth.uid())
  );

create policy "users see documents in their orgs" on public.documents
  for select using (
    exists (select 1 from public.memberships m where m.org_id = documents.org_id and m.user_id = auth.uid())
  );

create policy "users see audit logs in their orgs" on public.audit_logs
  for select using (
    exists (select 1 from public.memberships m where m.org_id = audit_logs.org_id and m.user_id = auth.uid())
  );

-- Policies: INSERT – any authenticated user can create an org (can be restricted later)
create policy "authenticated users can insert organizations" on public.organizations
  for insert to authenticated with check (true);

create policy "authenticated users can insert profiles" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

-- Memberships: only org admins can add members (we'll allow for now, but can refine)
create policy "authenticated users can insert memberships" on public.memberships
  for insert to authenticated with check (
    exists (
      select 1 from public.memberships m
      where m.org_id = memberships.org_id and m.user_id = auth.uid() and m.role = 'firm_admin'
    ) or
    (select count(*) from public.memberships where org_id = memberships.org_id) = 0  -- first user becomes admin
  );

-- Cases/Matters/Documents: any member can insert
create policy "members can insert cases" on public.cases
  for insert with check (
    exists (select 1 from public.memberships m where m.org_id = cases.org_id and m.user_id = auth.uid())
  );

create policy "members can insert matters" on public.matters
  for insert with check (
    exists (select 1 from public.memberships m where m.org_id = matters.org_id and m.user_id = auth.uid())
  );

create policy "members can insert documents" on public.documents
  for insert with check (
    exists (select 1 from public.memberships m where m.org_id = documents.org_id and m.user_id = auth.uid())
  );

create policy "members can insert audit logs" on public.audit_logs
  for insert with check (
    exists (select 1 from public.memberships m where m.org_id = audit_logs.org_id and m.user_id = auth.uid())
  );

-- Update policies (similarly scoped)
create policy "members can update cases" on public.cases
  for update using (
    exists (select 1 from public.memberships m where m.org_id = cases.org_id and m.user_id = auth.uid())
  );

create policy "members can update matters" on public.matters
  for update using (
    exists (select 1 from public.memberships m where m.org_id = matters.org_id and m.user_id = auth.uid())
  );

create policy "members can update memberships" on public.memberships
  for update using (
    exists (select 1 from public.memberships m where m.org_id = memberships.org_id and m.user_id = auth.uid() and m.role = 'firm_admin')
  );

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_cases_updated_at before update on public.cases
  for each row execute function public.handle_updated_at();
