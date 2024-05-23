import { Routes } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
import { AllEmployeesComponent } from './all-employees/all-employees.component';
import { AddEmployeeComponent } from './add-employee/add-employee.component';
import { EditEmployeeComponent } from './edit-employee/edit-employee.component';

export const routes: Routes = [
    { path: '', redirectTo: 'employee', pathMatch: 'full' },
    { path: 'employee',component:AllEmployeesComponent},
    { path: 'addEmployee', component: AddEmployeeComponent },
    { path: 'editEmployee', component: EditEmployeeComponent },
    { path: '**', component:NotFoundComponent },
];