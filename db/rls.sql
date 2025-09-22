alter table advances enable row level security;
alter table retirements enable row level security;
alter table payments enable row level security;
alter table audit_logs enable row level security;

create policy "Employees see their advances" on advances for select using (auth.uid() = employee_id);
create policy "Employees manage drafts" on advances for update using (
  auth.uid() = employee_id and status = 'DRAFT'
);
create policy "Managers review pending" on advances for select using (
  exists(select 1 from advance_approvals a where a.advance_id = advances.id and a.role = 'MANAGER')
);
create policy "Finance full access" on advances for all using (
  exists(select 1 from user_roles ur where ur.user_id = auth.uid() and ur.role = 'FINANCE')
);

create policy "Employees see their retirements" on retirements for select using (
  auth.uid() = submitted_by
);
create policy "Finance verifies retirements" on retirements for update using (
  exists(select 1 from user_roles ur where ur.user_id = auth.uid() and ur.role = 'FINANCE')
);

create policy "Audit logs readable by finance" on audit_logs for select using (
  exists(select 1 from user_roles ur where ur.user_id = auth.uid() and ur.role in ('FINANCE','ADMIN'))
);
