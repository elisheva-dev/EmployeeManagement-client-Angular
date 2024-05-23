import { Injectable } from '@angular/core';
import { Role } from './entities/Role.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private RoleList: Role[] = null;
  
  constructor(private http: HttpClient) { }
  getRoleList(): Observable<Role[]> {
    return this.http.get<Role[]>('https://localhost:7094/api/Roles')}

  setNewRole(Role: Role): Observable<Role> {
    return this.http.post<Role>('https://localhost:7094/api/Roles', Role);
  }
}
