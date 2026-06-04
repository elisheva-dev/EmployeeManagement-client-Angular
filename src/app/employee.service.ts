import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';
import { Employee } from './entities/employee.model';
import { EmployeeRole } from './entities/employeeRole.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  async getEmployees(): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('*, employee_roles(*, roles(title))')
      .order('last_name');
    if (error) throw error;

    return (data || []).map((emp: any) => ({
      ...emp,
      employee_roles: (emp.employee_roles || []).map((er: any) => ({
        ...er,
        role_title: er.roles?.title,
      })),
    }));
  }

  async getEmployeeById(id: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from('employees')
      .select('*, employee_roles(*, roles(title))')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      ...data,
      employee_roles: (data.employee_roles || []).map((er: any) => ({
        ...er,
        role_title: er.roles?.title,
      })),
    };
  }

  async addEmployee(employee: Employee): Promise<Employee> {
    const { id, first_name, last_name, beginning_work, date_of_birth, gender } = employee;
    const { data, error } = await supabase
      .from('employees')
      .insert({ id, first_name, last_name, beginning_work, date_of_birth, gender })
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async addEmployeeRoles(employeeId: string, roles: EmployeeRole[]): Promise<void> {
    const rows = roles.map((r) => ({
      employee_id: employeeId,
      role_id: r.role_id,
      is_managerial: r.is_managerial,
      entry_date: r.entry_date,
    }));
    if (rows.length === 0) return;
    const { error } = await supabase.from('employee_roles').insert(rows);
    if (error) throw error;
  }

  async updateEmployee(employee: Employee): Promise<Employee> {
    const { id, first_name, last_name, beginning_work, date_of_birth, gender } = employee;
    const { data, error } = await supabase
      .from('employees')
      .update({ first_name, last_name, beginning_work, date_of_birth, gender })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;

    await supabase.from('employee_roles').delete().eq('employee_id', id);
    if (employee.employee_roles && employee.employee_roles.length > 0) {
      await this.addEmployeeRoles(id, employee.employee_roles);
    }

    return data;
  }

  async deleteEmployee(id: string): Promise<void> {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) throw error;
  }
}
