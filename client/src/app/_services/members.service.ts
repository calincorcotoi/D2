import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { PaginationResult } from '../_models/pagination';
import { User } from '../_models/user';
import { UserParams } from '../_models/userParams';
import { AccountService } from './account.service';

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
  memberCache = new Map();

  user:User;
  userParams:UserParams;
  baseUrl = environment.apiUrl;
  
  constructor(private http: HttpClient, private accountService: AccountService) {
    accountService.currentUser$.pipe(take(1)).subscribe( user =>{
      this.user = user;
      this.userParams = new UserParams(user);
    })
   }

   setUserParams(params:UserParams){
    this.userParams = params;
   }

   getUserParams(){
     return this.userParams;
   }

   resetUserParams(){
     this.userParams = new UserParams(this.user);
     return this.userParams;
   }

   addLike(username:string){
     return this.http.post(this.baseUrl + 'likes/' + username,{});
   }

   getLikes(predicate:string,pageNumber:number, pageSize:number){
    let params = this.appedUserParams(pageNumber, pageSize);
    params = params.append('predicate', predicate);
    
    return this.getPaginatedResult<Partial<Member[]>>(this.baseUrl + 'likes', params);
    //  return this.http.get<Partial<Member[]>>(this.baseUrl + 'likes?predicate=' + predicate);
   }

  // getMembers(page?: number, itemsPerPage?: number){
  getMembers(userParams: UserParams){
    var response = this.memberCache.get(Object.values(userParams).join('-'));
    if(response) return of(response);

    let params = this.appedUserParams(userParams.pageNumber,userParams.pageSize);

    params = params.append('maxAge', userParams.maxAge.toString());
    params = params.append('minAge', userParams.minAge.toString());
    params = params.append('gender', userParams.gender);
    params = params.append('orderBy', userParams.orderBy);
    
    return this.getPaginatedResult<Member[]>(this.baseUrl + 'users',params).pipe(
      map( reponse =>{
        this.memberCache.set(Object.values(userParams).join('-'), reponse);
        return reponse;
      })
    );

    // if(this.members.length == 0){
    //   return this.http.get<Member[]>(this.baseUrl + 'users/').pipe(map(members =>{
    //     this.members = members;
    //     return members;
    //   }))
    // }else{
    //   return of(this.members);
    // }
  }

  getMember(username: String){
    // const member = this.members.find(m => m.username == username);
    // if(member !== undefined) return of(member);

    const member = [...this.memberCache.values()]
      .reduce((arr,elem) => arr.concat(elem.result),[])
      .find((member:Member) => member.username === username)

      
   if(member){
     return of(member);
   }
    
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

  private getPaginatedResult<T>(url:string, params: HttpParams) {
    const paginatedResult: PaginationResult<T> = new PaginationResult<T>();
    return this.http.get<T>(url, { observe: 'response', params }).pipe(
      map(response => {
        paginatedResult.result = response.body;
        if (response.headers.get('Pagination') !== null) {
          paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
        }
        return paginatedResult;
      })
    );
  }

  private appedUserParams (page:Number, pageSize:number):HttpParams{
    let params = new HttpParams();

    params = params.append('pageNumber', page.toString());
    params = params.append('pageSize', pageSize.toString());
      
    return params;
  }
}
