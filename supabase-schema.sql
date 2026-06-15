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
