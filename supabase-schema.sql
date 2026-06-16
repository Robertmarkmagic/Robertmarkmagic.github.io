create table if not exists public.saved_games (
  user_id uuid not null references auth.users(id) on delete cascade,
  slot text not null default 'main',
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, slot)
);

alter table public.saved_games enable row level security;

drop policy if exists "Players can read their own saves" on public.saved_games;
create policy "Players can read their own saves"
on public.saved_games for select
using (auth.uid() = user_id);

drop policy if exists "Players can create their own saves" on public.saved_games;
create policy "Players can create their own saves"
on public.saved_games for insert
with check (auth.uid() = user_id);

drop policy if exists "Players can update their own saves" on public.saved_games;
create policy "Players can update their own saves"
on public.saved_games for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Players can delete their own saves" on public.saved_games;
create policy "Players can delete their own saves"
on public.saved_games for delete
using (auth.uid() = user_id);

create table if not exists public.email_subscribers (
  email text primary key,
  user_id uuid references auth.users(id) on delete set null,
  source text not null default 'signup-form',
  subscribed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.email_subscribers enable row level security;

drop policy if exists "Anyone can join the email list" on public.email_subscribers;
create policy "Anyone can join the email list"
on public.email_subscribers for insert
with check (subscribed = true);

drop policy if exists "Anyone can refresh their subscription" on public.email_subscribers;
create policy "Anyone can refresh their subscription"
on public.email_subscribers for update
using (subscribed = true)
with check (subscribed = true);

drop policy if exists "Signed in users can read their own email subscription" on public.email_subscribers;
create policy "Signed in users can read their own email subscription"
on public.email_subscribers for select
using (auth.uid() = user_id);
