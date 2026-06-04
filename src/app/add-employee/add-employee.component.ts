import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../employee.service';
import { Employee } from '../entities/employee.model';
import { EmployeeRole } from '../entities/employeeRole.model';
import { Role } from '../entities/Role.model';
import { RoleService } from '../role.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-employee.component.html',
  styleUrl: './add-employee.component.css',
})
export class AddEmployeeComponent implements OnInit {
  form: FormGroup;
  rolesList: Role[] = [];
  isSaving = false;

  constructor(
    private employeeService: EmployeeService,
    private roleService: RoleService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(9), Validators.pattern(/^\d+$/)]],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      beginning_work: ['', Validators.required],
      date_of_birth: ['', Validators.required],
      gender: [null, Validators.required],
      roles: this.fb.array([]),
    });

    this.loadRoles();
  }

  async loadRoles(): Promise<void> {
    try {
      this.rolesList = await this.roleService.getRoles();
    } catch (err) {
      console.error('Error loading roles', err);
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
      const employee: Employee = {
        id: v.id,
        first_name: v.first_name,
        last_name: v.last_name,
        beginning_work: v.beginning_work,
        date_of_birth: v.date_of_birth,
        gender: Number(v.gender),
      };

      await this.employeeService.addEmployee(employee);

      const roles: EmployeeRole[] = v.roles.map((r: any) => ({
        role_id: Number(r.role_id),
        is_managerial: r.is_managerial,
        entry_date: r.entry_date,
      }));

      if (roles.length > 0) {
        await this.employeeService.addEmployeeRoles(v.id, roles);
      }

      this.router.navigate(['/employee']);
    } catch (err: any) {
      if (err?.message?.includes('duplicate') || err?.message?.includes('unique')) {
        alert('עובד עם תעודת זהות זו כבר קיים במערכת');
      } else {
        alert('שגיאה בשמירת העובד: ' + (err?.message || err));
      }
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
}
