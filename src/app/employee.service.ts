
import { HttpClient } from '@angular/common/http';
import { Employee } from './entities/employee.model';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  public employeeList: Employee[] = null;

  constructor(private http: HttpClient) { }
  getEmployeeList(): Observable<Employee[]> {
    return this.http.get<Employee[]>('https://localhost:7094/api/Employees')}

  getEmployeeById(id:number): Observable<Employee> {
    return this.http.get<Employee>(`https://localhost:7094/api/Employees/${id}`)}

  setNewEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>('https://localhost:7094/api/Employees', employee);
  }
  updateEmployee(employee:Employee,id:number):Observable<Employee>{
    return this.http.put<Employee>(`https://localhost:7094/api/Employees/${id}`, employee);
  }
  deleteEmployee(id: number): Observable<Employee> {
    return this.http.delete<Employee>(`https://localhost:7094/api/Employees/${id}`);
  }
}
