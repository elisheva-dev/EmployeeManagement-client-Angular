import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../employee.service';
import { Employee } from '../entities/employee.model';
import { EmployeeRole } from '../entities/employeeRole.model';
import { Role } from '../entities/Role.model';
import { RoleService } from '../role.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-employee.component.html',
  styleUrl: './edit-employee.component.css',
})
export class EditEmployeeComponent implements OnInit {
  form: FormGroup;
  rolesList: Role[] = [];
  employee: Employee | null = null;
  isSaving = false;
  isLoading = true;

  constructor(
    private employeeService: EmployeeService,
    private roleService: RoleService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.loadEmployee(id);
    } else {
      this.isLoading = false;
    }
  }

  async loadRoles(): Promise<void> {
    try {
      this.rolesList = await this.roleService.getRoles();
    } catch (err) {
      console.error('Error loading roles', err);
    }
  }

  async loadEmployee(id: string): Promise<void> {
    try {
      this.employee = await this.employeeService.getEmployeeById(id);
      if (this.employee) {
        this.initForm();
      }
    } catch (err) {
      console.error('Error loading employee', err);
    } finally {
      this.isLoading = false;
    }
  }

  initForm(): void {
    const emp = this.employee!;
    this.form = this.fb.group({
      id: [{ value: emp.id, disabled: true }],
      first_name: [emp.first_name, Validators.required],
      last_name: [emp.last_name, Validators.required],
      beginning_work: [this.toDateValue(emp.beginning_work), Validators.required],
      date_of_birth: [this.toDateValue(emp.date_of_birth), Validators.required],
      gender: [emp.gender.toString(), Validators.required],
      roles: this.fb.array([]),
    });

    if (emp.employee_roles) {
      emp.employee_roles.forEach((role) => {
        this.rolesArray.push(
          this.fb.group({
            role_id: [role.role_id, Validators.required],
            is_managerial: [role.is_managerial],
            entry_date: [this.toDateValue(role.entry_date), Validators.required],
          })
        );
      });
    }
  }

  get rolesArray(): FormArray {
    return this.form.get('roles') as FormArray;
  }

  addRole(): void {
    if (this.form.get('beginning_work').invalid) {
      this.form.get('beginning_work').markAsTouched();
      return;
    }
    this.rolesArray.push(
      this.fb.group({
        role_id: ['', Validators.required],
        is_managerial: [false],
        entry_date: ['', Validators.required],
      })
    );
  }

  removeRole(index: number): void {
    this.rolesArray.removeAt(index);
  }

  isDuplicateRole(): boolean {
    const roles = this.rolesArray.value;
    const ids = roles.map((r: any) => r.role_id).filter((id: any) => id);
    return new Set(ids).size !== ids.length;
  }

  async save(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isDuplicateRole()) return;

    this.isSaving = true;
    try {
      const v = this.form.value;
      const updatedEmployee: Employee = {
        id: this.employee!.id,
        first_name: v.first_name,
        last_name: v.last_name,
        beginning_work: v.beginning_work,
        date_of_birth: v.date_of_birth,
        gender: Number(v.gender),
        employee_roles: v.roles.map((r: any) => ({
          role_id: Number(r.role_id),
          is_managerial: r.is_managerial,
          entry_date: r.entry_date,
        })),
      };

      await this.employeeService.updateEmployee(updatedEmployee);
      this.router.navigate(['/employee']);
    } catch (err: any) {
      alert('שגיאה בשמירת השינויים: ' + (err?.message || err));
    } finally {
      this.isSaving = false;
    }
  }

  cancel(): void {
    this.router.navigate(['/employee']);
  }

  getRoleTitle(roleId: number): string {
    return this.rolesList.find((r) => r.id === Number(roleId))?.title || '';
  }

  private toDateValue(date: string | null | undefined): string {
    if (!date) return '';
    try {
      return new Date(date).toISOString().split('T')[0];
    } catch {
      return '';
    }
  }
}
