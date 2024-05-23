import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { EmployeeService } from '../employee.service';
import { Employee } from '../entities/employee.model';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Role } from '../entities/Role.model';
import { RoleService } from '../role.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-employee.component.html',
  styleUrl: './add-employee.component.css'
})
export class AddEmployeeComponent implements OnInit {
  employeeForm: FormGroup;
  rolesList: Role[];
  employeesList

  constructor(private dialogRef: MatDialogRef<AddEmployeeComponent>,
    private _employeeService: EmployeeService,
    private _roleService: RoleService,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.employeeForm = this.fb.group({
      id: ['', [Validators.required, Validators.minLength(9), Validators.pattern(/^\d+$/)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      beginningWork: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: [null, Validators.required], // וולידציה עבור שדה המין
      roles: this.fb.array([]),
    });
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
      // Swal.fire('Error', 'יש למלא את כל השדות החובה בטופס', 'error');
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
        isManagerial: dateAndRoleId[2] === "ניהולי" ? true : false
      };

      const rolesFormArray = this.employeeForm.get('roles') as FormArray;
      rolesFormArray.push(this.fb.group(role));
      const title = this.rolesList.find(r => r.id == selectedRoleId)
      Swal.fire(`Selected date: ${startDate}\nSelected role: ${title.title}\nManagement: ${dateAndRoleId[2]}`);
    }
  }
  closeDialog() {
    this.dialogRef.close();
  }

  saveEmployee() {
    const formData = this.employeeForm?.value;
    // יצירת אובייקט עובד
    const newEmployee: Employee = {
      id: formData.id,
      firstName: formData.firstName,
      lastName: formData.lastName,
      beginningWork: formData.beginningWork,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender === 'Male' ? 0 : 1,
      roles: [], // מערך התפקידים יוכנס לכאן
    }

    // יצירת מערך של אובייקטי תפקידים
    const rolesArray = formData.roles.map((role: any) => {
      return {
        entryDate: role.startDate, // את תאריך הכניסה לתפקיד
        roleId: role.roleId, // את המזהה של התפקיד
        isManagerial: role.isManagerial, // האם התפקיד הוא ניהולי או לא
        id: 0
      };
    });
    if (this._employeeService.employeeList) {
      const isExist = this._employeeService.employeeList.find(e => e.id == newEmployee.id)
      if (isExist) {
        Swal.fire('Error', 'העובד קיים במערכת ', 'error');
        return;
      }
    }

    // שליחת הנתונים לשרת
    this._employeeService.setNewEmployee(newEmployee).subscribe({
      next: (res) => {
        Swal.fire(
          'העובד נוסף בהצלחה',
          'תודה רבה!',
          'success'
        );
        this.closeDialog();
      },
      error: (err) => {
        Swal.fire('Error', 'הוספת העובד לא נשמרה', 'error');
        console.log(err);
      },
      complete: () => {
        console.log('finish');
      }
    });
  }
}