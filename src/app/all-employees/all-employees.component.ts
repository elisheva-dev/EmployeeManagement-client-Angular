import { Component, OnInit } from '@angular/core';
import { Employee } from '../entities/employee.model';
import { EmployeeRole } from '../entities/employeeRole.model';
import { EmployeeService } from '../employee.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-all-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './all-employees.component.html',
  styleUrls: ['./all-employees.component.css'],
})
export class AllEmployeesComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  searchTerm = '';
  isLoading = false;

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  async loadEmployees(): Promise<void> {
    this.isLoading = true;
    try {
      this.employees = await this.employeeService.getEmployees();
      this.filterEmployees();
    } catch (err) {
      console.error('Error loading employees', err);
    } finally {
      this.isLoading = false;
    }
  }

  filterEmployees(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredEmployees = [...this.employees];
    } else {
      this.filteredEmployees = this.employees.filter(
        (e) =>
          e.first_name.toLowerCase().includes(term) ||
          e.last_name.toLowerCase().includes(term) ||
          e.id.includes(term)
      );
    }
  }

  async deleteEmployee(employee: Employee): Promise<void> {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את ${employee.first_name} ${employee.last_name}?`)) {
      return;
    }
    try {
      await this.employeeService.deleteEmployee(employee.id);
      await this.loadEmployees();
    } catch (err) {
      alert('המחיקה נכשלה');
    }
  }

  getGenderLabel(gender: number): string {
    return gender === 0 ? 'זכר' : 'נקבה';
  }

  formatDate(date: string | null): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('he-IL');
  }

  getRolesText(employee: Employee): string {
    if (!employee.employee_roles || employee.employee_roles.length === 0) return '';
    return employee.employee_roles
      .map((r) => r.role_title + (r.is_managerial ? ' (ניהולי)' : ''))
      .join(', ');
  }
}
