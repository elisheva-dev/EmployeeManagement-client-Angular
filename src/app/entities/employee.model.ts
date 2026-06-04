import { EmployeeRole } from './employeeRole.model';

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  beginning_work: string;
  date_of_birth: string;
  gender: number;
  created_at?: string;
  employee_roles?: EmployeeRole[];
}

export enum Gender {
  Male = 0,
  Female = 1,
}
