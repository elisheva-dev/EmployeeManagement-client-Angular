import { EmployeeRole } from "./employeeRole.model"

export class Employee {
    id:number
    firstName:string
    lastName:string
    beginningWork:Date
    dateOfBirth:Date
    gender:number
    roles:EmployeeRole[]
    // isActive:boolean
    // startDate: Date
}
export enum Gender {
    Male = 'male',
    Female = 'female'
}