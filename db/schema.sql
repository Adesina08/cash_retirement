create type role_type as enum ('EMPLOYEE', 'MANAGER', 'FINANCE', 'ADMIN');
create type advance_status as enum (
  'DRAFT',
  'PENDING_MANAGER',
  'PENDING_FINANCE',
  'APPROVED',
  'DISBURSED',
  'AWAITING_RETIREMENT',
  'UNDER_REVIEW',
  'SETTLED',
  'REJECTED',
  'OVERDUE'
);

create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role role_type not null,
  dept text,
  created_at timestamptz not null default now()
);

create table policies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  receipt_required_over_amount numeric,
  retirement_deadline_days int not null,
  per_diem_caps jsonb,
  created_at timestamptz not null default now()
);

create table policy_categories (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid not null references policies(id) on delete cascade,
  category text not null,
  per_diem numeric,
  receipt_required_over_amount numeric
);

create table cost_centers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique
);

create table gl_codes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique
);

create table advances (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references users(id),
  purpose text not null,
  amount_requested numeric not null,
  currency text not null,
  project text not null,
  cost_center_id uuid not null references cost_centers(id),
  gl_code_id uuid not null references gl_codes(id),
  status advance_status not null default 'DRAFT',
  expected_start_date date,
  expected_end_date date,
  disbursed_at timestamptz,
  disbursement_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table advance_approvals (
  id uuid primary key default gen_random_uuid(),
  advance_id uuid not null references advances(id) on delete cascade,
  role role_type not null,
  actor_id uuid references users(id),
  status text not null,
  acted_at timestamptz,
  comment text
);

create table advance_items (
  id uuid primary key default gen_random_uuid(),
  advance_id uuid not null references advances(id) on delete cascade,
  type text not null,
  category text not null,
  description text,
  amount numeric not null,
  currency text not null,
  spend_date date not null,
  attachment_url text,
  ocr_text text,
  policy_flags jsonb
);

create table retirements (
  id uuid primary key default gen_random_uuid(),
  advance_id uuid not null references advances(id) on delete cascade,
  submitted_by uuid not null references users(id),
  submitted_at timestamptz not null default now(),
  total_spent numeric not null,
  refund_due_to_company numeric not null,
  topup_due_to_employee numeric not null,
  status text not null,
  finance_notes text
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  advance_id uuid not null references advances(id) on delete cascade,
  direction text not null,
  method text not null,
  amount numeric not null,
  ref text,
  payment_date date not null
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  before_state jsonb,
  after_state jsonb,
  comment text,
  created_at timestamptz not null default now()
);
