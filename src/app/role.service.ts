import { Injectable } from '@angular/core';
import { Role } from './entities/Role.model';
import { supabase } from './supabase.client';

@Injectable({ providedIn: 'root' })
export class RoleService {
  async getRoles(): Promise<Role[]> {
    const { data, error } = await supabase.from('roles').select('*').order('id');
    if (error) throw error;
    return data || [];
  }
}
