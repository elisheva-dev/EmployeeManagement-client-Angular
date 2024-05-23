import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EmployeeService } from '../employee.service';
import { Employee } from '../entities/employee.model';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Role } from '../entities/Role.model';
import { RoleService } from '../role.service';
import Swal from 'sweetalert2';
import {  CommonModule } from '@angular/common';
import {  ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-employee',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule  ],
  templateUrl: './edit-employee.component.html',
  styleUrl: './edit-employee.component.css'
})
export class EditEmployeeComponent {
  employeeToUpdate: Employee;
  employeeForm: FormGroup;
  rolesList: Role[];

  constructor(
    private _employeeService: EmployeeService,
    private _roleService: RoleService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditEmployeeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.employeeToUpdate = data.employee;
  }
  ngOnInit() {
    this.initializeForm();
    this.loadRolesList();
  }
  
  initializeForm() {
    const existingRoles = this.employeeToUpdate.roles;
    this.employeeForm = this.fb.group({
      id: [this.employeeToUpdate ? this.employeeToUpdate.id : '', [Validators.required, Validators.minLength(9), Validators.pattern(/^\d+$/)]],
      firstName: [this.employeeToUpdate ? this.employeeToUpdate.firstName : '', Validators.required],
      lastName: [this.employeeToUpdate ? this.employeeToUpdate.lastName : '', Validators.required],
      beginningWork: [this.employeeToUpdate ? this.employeeToUpdate.beginningWork : null, Validators.required],
      dateOfBirth: [this.employeeToUpdate ? this.employeeToUpdate.dateOfBirth : null, Validators.required],
      gender: [this.employeeToUpdate ? this.employeeToUpdate.gender.toString() : null, Validators.required], // וולידציה עבור שדה המין
      roles: this.fb.array([]),
    });
    console.log(this.employeeToUpdate.roles)
  
    if (this.employeeToUpdate && this.employeeToUpdate.roles) {
      const rolesFormArray = this.employeeForm.get('roles') as FormArray;
      this.employeeToUpdate.roles.forEach(role => {
        rolesFormArray.push(this.fb.group(role));
      });
      this.employeeForm.setControl('roles', rolesFormArray);
    }
  }
  
  loadRolesList() {
    this._roleService.getRoleList().subscribe({
      next: (res: Role[]) => {
        console.log("success");
        this.rolesList = res;
      },
      error: (err) => {
        console.log(err, "error");
      }
    });
  }
  
  async addRole() {
    // בדיקה של כל השדות בטופס
    for (const controlName in this.employeeForm.controls) {
      if (this.employeeForm.controls.hasOwnProperty(controlName)) {
        const control = this.employeeForm.get(controlName);
        // אם השדה ריק, הוסף סימון שגיאה
        if (!control.value) {
          control.markAsTouched();
          control.setErrors({ 'required': true });
        }
      }
    }
    // בדיקה אם יש שדות ריקים והצגת הודעת שגיאה
    if (this.employeeForm.invalid) {
      return;
    }
    const { value: dateAndRoleId } = await Swal.fire({
      title: "הוספת פרטי תפקיד",
      html: `
        <input type="date" id="start" name="trip-start" [min]="employeeForm.get('beginningWork').value" style="margin-bottom: 10px; width: 100%;">
        <select id="role" name="role" style="margin-bottom: 10px; width: 100%;">
            <option value="" disabled selected>בחר תפקיד</option>
            ${this.rolesList.map(role => `<option value="${role.id}">${role.title}</option>`).join('')}
        </select>
        <select id="management" name="management" style="margin-bottom: 10px; width: 100%;">
            <option value="" disabled selected>ניהולי/ללא ניהול</option>
            <option value="ניהולי">ניהולי</option>
            <option value="ללא ניהול">ללא ניהול</option>
        </select>
        `,
      focusConfirm: false,
      preConfirm: () => {
        return [
          (document.getElementById('start') as HTMLInputElement).value,
          (document.getElementById('role') as HTMLSelectElement).value,
          (document.getElementById('management') as HTMLSelectElement).value
        ];
      }
    });

    if (dateAndRoleId) {
      const startDate = dateAndRoleId[0];
      const beginningWorkDate = this.employeeForm.get('beginningWork').value;
      const selectedRoleId = dateAndRoleId[1];

      if (startDate < beginningWorkDate) {
        Swal.fire('Error', 'תאריך הכניסה לתפקיד חייב להיות לפני או באותו יום כמו תאריך תחילת העבודה', 'error');
        return;
      }
      if (this.employeeForm.get('roles').value.some(role => role.roleId === selectedRoleId)) {
        Swal.fire('Error', 'לא ניתן להוסיף תפקיד פעמיים', 'error');
        return;
      }
      const selectedRole = this.rolesList.find(role => role.id === selectedRoleId);

      const role: any = {
        startDate: startDate,
        roleId: selectedRoleId,
        title: selectedRole?.title,
        isManagerial: dateAndRoleId[2] === "ניהולי" ? true : false
      };

      const rolesFormArray = this.employeeForm.get('roles') as FormArray;
      rolesFormArray.push(this.fb.group(role));

      this.employeeForm.setControl('roles', rolesFormArray);
      this.employeeToUpdate.roles.push(role);
      const title=this.rolesList.find(r=>r.id==selectedRoleId)

      Swal.fire(`Selected date: ${startDate}\nSelected role: ${title.title}\nManagement: ${dateAndRoleId[2]}`);
    }
  }
  async editRole(id: number) {
    // בדיקה של כל השדות בטופס
    for (const controlName in this.employeeForm.controls) {
      if (this.employeeForm.controls.hasOwnProperty(controlName)) {
        const control = this.employeeForm.get(controlName);
        // אם השדה ריק, הוסף סימון שגיאה
        if (!control.value) {
          control.markAsTouched();
          control.setErrors({ 'required': true });
        }
      }
    }

    // בדיקה אם יש שדות ריקים והצגת הודעת שגיאה
    if (this.employeeForm.invalid) {
      return;
    }
    const roleIndex = this.employeeToUpdate.roles.findIndex(role => role.roleId === id);
    if (roleIndex === -1) {
      Swal.fire('Error', 'Role not found for editing', 'error');
      return;
    }
    const role = this.employeeToUpdate.roles[roleIndex];
    const formattedDate = role.entryDate ? new Date(role.entryDate).toLocaleDateString('en-CA') : '';
    const { value: toEdit } = await Swal.fire({
      title: "עריכת פרטי תפקיד",
      html: `
        <input type="date" id="start" name="trip-start" value="${formattedDate}" style="margin-bottom: 10px; width: 100%;">
        <select id="role" name="role" style="margin-bottom: 10px; width: 100%;">
                ${this.rolesList.map(r => `<option value="${r.id}" ${r.id === role.roleId ? 'selected' : ''}>${r.title}</option>`).join('')}
            </select>
            <select id="management" name="management" style="margin-bottom: 10px; width: 100%;">
                <option value="Managerial" ${role.isManagerial ? 'selected' : ''}>Managerial</option>
                <option value="Non-Managerial" ${!role.isManagerial ? 'selected' : ''}>Non-Managerial</option>
            </select>
        `,
      focusConfirm: false,
      preConfirm: () => {
        return [
          (document.getElementById('start') as HTMLInputElement).value,
          (document.getElementById('role') as HTMLSelectElement).value,
          (document.getElementById('management') as HTMLSelectElement).value
        ];
      }
    });
    if (!toEdit) return;

    const [entryDate, roleId, management] = toEdit;
    const isManagerial = management === "Managerial";

    const selectedRole = this.rolesList.find(role => role.id === roleId);
    if (entryDate < this.employeeForm.get('beginningWork').value) {
      Swal.fire('Error', 'תאריך הכניסה לתפקיד חייב להיות לפני או באותו יום כמו תאריך תחילת העבודה', 'error');
      return;
    }
    if (this.employeeForm.get('roles').value.some(role => role.roleId === roleId)) {
      Swal.fire('Error', 'לא ניתן להוסיף תפקיד פעמיים', 'error');
      return;
    }
    const newRole = {
      entryDate: entryDate,
      roleId: roleId,
      isManagerial: isManagerial
    };

    this.employeeToUpdate.roles[roleIndex] = newRole;

    const rolesFormArray = this.employeeForm.get('roles') as FormArray;
    const roleControl = rolesFormArray.at(roleIndex);
    roleControl.patchValue({
      entryDate: entryDate,
      roleId: roleId,
      isManagerial: isManagerial
    });
    const title=this.rolesList.find(r=>r.id==roleId)
    Swal.fire(`Employee: ${this.employeeToUpdate.firstName}\nStart Date: ${entryDate}\nRole: ${title.title}\nManagerial: ${isManagerial ? 'Yes' : 'No'}`);
  }
  deleteRole(role) {
  const rolesFormArray = this.employeeForm.get('roles') as FormArray;
  const index = rolesFormArray.controls.indexOf(role);
  rolesFormArray.removeAt(index);

  if (index !== -1) {
    this.employeeToUpdate.roles.splice(index, 1);
  }
  const i = this.employeeToUpdate.roles.indexOf(role);
  if (i !== -1) {
      this.employeeToUpdate.roles.splice(i, 1);
  }
  // עדכון הטופס ללא התפקיד שנמחק
  const controlIndex = rolesFormArray.controls.indexOf(role);
  if (controlIndex !== -1) {
      rolesFormArray.removeAt(controlIndex);
  }
  Swal.fire('התפקיד הוסר בהצלחה', 'success');
  }
  getRoleName(roleId: number): string {
    if (this.employeeToUpdate && this.employeeToUpdate.roles && this.rolesList) {
      const role = this.rolesList.find(role => role.id === roleId);
      return role ? role.title : 'התפקיד עודכן';
    }
    return 'Unknown';
  }
  closeDialog() {
    this.dialogRef.close();
  }
  saveEmployee() {
    const formData = this.employeeForm?.value;
    const newRolesArray = formData.roles.map((role: any) => {
      return {
        roleId: role.roleId,
        isManagerial: role.isManagerial,
        entryDate: role.entryDate,
      };
    });
    console.log(formData.gender === 'Male' ? 0 : 1)
    // יצירת אובייקט עובד
    const newEmployee: Employee = {
      id: formData.id,
      firstName: formData.firstName,
      lastName: formData.lastName,
      beginningWork: formData.beginningWork,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender === 'Male' ? 0 : 1,
      roles: newRolesArray.slice(),
    }
    console.log('New Employee Data:', newEmployee); // הדפסת הנתונים לבדיקה

    this._employeeService.updateEmployee(newEmployee, this.employeeToUpdate.id).subscribe({
      next: (res) => {
        Swal.fire(
          'העובד עודכן בהצלחה',
          'תודה רבה!',
          'success'
        );
        console.log('New Employee role Dates:', newEmployee.roles); // הדפסת הנתונים לבדיקה

        this.closeDialog();
      },
      error: (err) => {
        Swal.fire('Error', 'העריכה לא נשמרה', 'error');
        console.log(err);
      },
      complete: () => {
        console.log('finish');
      }
    });
  }
}
