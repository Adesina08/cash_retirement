import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Role } from '@lib/types';
import { DataClient, DataClientFactory } from './data-client';

// Placeholder interface aligning with Supabase tables.
export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function createSupabaseDataClient(config: SupabaseConfig): DataClient {
  const client = createClient(config.url, config.anonKey, {
    auth: {
      persistSession: true
    }
  });
  return new SupabaseDataClient(client);
}

class SupabaseDataClient implements DataClient {
  constructor(private supabase: SupabaseClient) {}

  async currentUser() {
    const { data, error } = await this.supabase.auth.getUser();
    if (error || !data.user) throw error ?? new Error('No user session');
    const { data: userProfile } = await this.supabase.from('users').select('*').eq('id', data.user.id).single();
    return userProfile;
  }

  async listUsers(role?: Role) {
    const query = this.supabase.from('users').select('*');
    if (role) query.eq('role', role);
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }

  async listPolicies() {
    const { data, error } = await this.supabase.from('policies').select('*');
    if (error) throw error;
    return data ?? [];
  }

  async listCostCenters() {
    const { data, error } = await this.supabase.from('cost_centers').select('*');
    if (error) throw error;
    return data ?? [];
  }

  async listGlCodes() {
    const { data, error } = await this.supabase.from('gl_codes').select('*');
    if (error) throw error;
    return data ?? [];
  }

  async listAdvances(params?: { status?: string; employeeId?: string; search?: string }) {
    const query = this.supabase.from('advances_view').select('*');
    if (params?.status) query.eq('status', params.status);
    if (params?.employeeId) query.eq('employee_id', params.employeeId);
    if (params?.search) query.ilike('purpose', `%${params.search}%`);
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }

  async getAdvance(id: string) {
    const { data, error } = await this.supabase.from('advances_view').select('*, items:advance_items(*)').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async createAdvance(payload: any) {
    const { data, error } = await this.supabase.from('advances').insert(payload).select().single();
    if (error) throw error;
    return data;
  }

  async submitAdvanceForApproval(id: string) {
    const { data, error } = await this.supabase.rpc('submit_advance', { advance_id: id });
    if (error) throw error;
    return data;
  }

  async approveAdvance(id: string, payload: any) {
    const { data, error } = await this.supabase.rpc('advance_approve', {
      advance_id: id,
      approver_role: payload.role,
      approve: payload.approve,
      comment: payload.comment
    });
    if (error) throw error;
    return data;
  }

  async recordDisbursement(id: string, payload: any) {
    const { data, error } = await this.supabase.rpc('advance_disburse', { advance_id: id, payload });
    if (error) throw error;
    return data;
  }

  async submitRetirement(id: string, payload: any) {
    const { data, error } = await this.supabase.rpc('retirement_submit', { advance_id: id, payload });
    if (error) throw error;
    return data;
  }

  async verifyRetirement(id: string, payload: any) {
    const { data, error } = await this.supabase.rpc('retirement_verify', { advance_id: id, payload });
    if (error) throw error;
    return data;
  }

  async listAuditLogs(entityId: string, entityType: string) {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('entity_id', entityId)
      .eq('entity_type', entityType)
      .order('at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  async listPayments(advanceId: string) {
    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .eq('advance_id', advanceId)
      .order('date', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  async recordPayment(advanceId: string, payment: any) {
    const { data, error } = await this.supabase
      .from('payments')
      .insert({ ...payment, advance_id: advanceId })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getFinanceDashboard(params: { range: string; department?: string; costCenterId?: string }) {
    const { data, error } = await this.supabase.rpc('finance_dashboard', params);
    if (error) throw error;
    return data;
  }

  async exportAdvances(format: 'csv' | 'json', params: { status?: string }) {
    const { data, error } = await this.supabase.rpc('export_advances', { format, filters: params });
    if (error) throw error;
    return data;
  }
}

export const createSupabaseClientFactory = (config: SupabaseConfig): DataClientFactory => () =>
  createSupabaseDataClient(config);
