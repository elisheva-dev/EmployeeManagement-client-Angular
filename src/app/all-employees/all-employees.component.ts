import { Component, OnInit } from '@angular/core';
import { Employee } from '../entities/employee.model';
import { EmployeeService } from '../employee.service';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { AddEmployeeComponent } from '../add-employee/add-employee.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog'; // Import MatDialog
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { EditEmployeeComponent } from '../edit-employee/edit-employee.component';

@Component({
  selector: 'app-all-employees',
  standalone: true,
  imports: [MatTableModule, FormsModule],
  templateUrl: './all-employees.component.html',
  styleUrls: ['./all-employees.component.css']
})
export class AllEmployeesComponent implements OnInit {
  filterByName: string = '';
  employeesList;
  displayedColumns: string[] = ['firstName', 'lastName', 'id', 'startDate', 'editIcon', 'deleteIcon'];
  isLoading: boolean = false; // Add this variable to track loading state

  constructor(private employeeService: EmployeeService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.getEmployees();
  }

  getEmployees(): void {
    this.isLoading = true; // Set loading state to true before fetching data
    this.employeeService.getEmployeeList().subscribe({
      next: (res) => {
        console.log("success");
        this.employeesList = new MatTableDataSource<Employee>(res);
        this.isLoading = false; // Set loading state to false after data is loaded
      },
      error: (err) => {
        console.log(err, "error");
        this.isLoading = false; // Set loading state to false in case of an error
      }
    });
  }


  async deleteEmployee(employee: Employee) {
    const { value: accept } = await Swal.fire({
      title: "מחיקת עובד",
      input: "checkbox",
      inputValue: 1,
      inputPlaceholder: `
        האם אתה בטוח שברצונך למחוק את העובד ${employee.firstName} ${employee.lastName} מרשימת העובדים? `,
      confirmButtonText: `
       המשך<i class="fa fa-arrow-right"></i> `,
      inputValidator: (result) => {
        return !result && "נא לאשר את הפעולה";
      }
    });
    if (accept) {
      this.employeeService.deleteEmployee(employee.id).subscribe({
        next: () => {
          Swal.fire("!העובד נמחק בהצלחה");
          this.getEmployees();

        },
        error: (err) => {
          Swal.fire(
            'המחיקה נכשלה',
            'error'
          );
        }
      });
    }
  }

  editEmployee(employee: Employee) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '500px';
    dialogConfig.height = '600px';
    dialogConfig.data = { employee: employee }; // שליחת העובד לקומפוננטה

    const dialogRef = this.dialog.open(EditEmployeeComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      this.getEmployees();
    });
  }

  filterAll(): void {
    if (!this.filterByName || this.filterByName.trim() === '') {
      if (this.employeesList) {
        this.employeesList.filter = '';
      }
      return;
    }
    const searchTerm = this.filterByName.toLowerCase().trim();
    if (this.employeesList) {
      this.employeesList.filter = searchTerm;
    }
  }

  exportToExcel(): void {
    const fileName = 'employees.xlsx';
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.employeesList.filteredData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, fileName);
  }
  showComponent = false;

  addEmployee(): void {
    const dialogRef = this.dialog.open(AddEmployeeComponent, {
      width: '650px',
      height: '420px',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getEmployees();
    });
  }


}
