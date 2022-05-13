import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';

// const httpOptions = {
//   headers: new HttpHeaders({
//     Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('user'))?.token
//   })
// }

@Injectable({
  providedIn: 'root'
})
export class MembersService {

  members:Member[] =[];

  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getMembers():Observable<Member[]>{
    if(this.members.length == 0){
      return this.http.get<Member[]>(this.baseUrl + 'users/').pipe(map(members =>{
        this.members = members;
        return members;
      }))
    }else{
      return of(this.members);
    }
  }

  getMember(username: String){
      const member = this.members.find(m => m.username == username);
      if(member !== undefined) return of(member);
    
      return this.http.get<Member>(this.baseUrl + 'users/' + username);
    }

  updateMember(member: Member){
    return this.http.put(this.baseUrl + 'users/',member).pipe(map(()=>{
      let memberIndex = this.members.findIndex(m => m.username == member.username)
      this.members[memberIndex] = member;
    }));
  }

  setMainPhoto(photoId:number){
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId,{});
  }    

  deletePhoto(photoId:number){
    return this.http.delete(this.baseUrl +"users/delete-photo/" + photoId);
  }
}
