export interface EmployeeRole {
  id?: number;
  employee_id?: string;
  role_id: number;
  is_managerial: boolean;
  entry_date: string | null;
  role_title?: string;
}
