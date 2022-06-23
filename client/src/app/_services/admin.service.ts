import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getUserWithRoles(){
    return this.http.get<Partial<User[]>>(this.baseUrl + 'admin/users-with-roles');
  }

  setUserRoles(username:string, roles:string[]){
    let rols = new HttpParams();

    rols = rols.append('roles', roles.join(','));
    
    console.log(rols.toString());
    return this.http.post(this.baseUrl + "admin/edit-roles/" + username + "?" +rols.toString(),{} );
  }

}
