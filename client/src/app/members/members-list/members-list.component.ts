import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { Member } from 'src/app/_models/member';
import { Pagination } from 'src/app/_models/pagination';
import { User } from 'src/app/_models/user';
import { UserParams } from 'src/app/_models/userParams';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-members-list',
  templateUrl: './members-list.component.html',
  styleUrls: ['./members-list.component.css']
})
export class MembersListComponent implements OnInit {

  // members$:Observable<Member[]>;
  members: Member[];
  user: User;
  pagination: Pagination;
  userParams: UserParams;
  genderList = [{value:'male', display:'Males'},{value:'female', display:'Females'}]

  constructor(private membersService:MembersService) {
    this.userParams = this.membersService.getUserParams();
   }

  ngOnInit(): void {
    this.loadMembers();
    // this.members$ = this.membersService.getMembers();
  }

  loadMembers(){
    this.membersService.setUserParams(this.userParams);
    this.membersService.getMembers(this.userParams).subscribe(response =>{
      this.members = response.result;
      this.pagination = response.pagination;
    })
  }

  resetFilters(){
    this.userParams = this.membersService.resetUserParams();
    this.userParams = new UserParams(this.user);
    this.loadMembers();
  }

  pageChanged(event:any){
    this.membersService.setUserParams(this.userParams);
    this.userParams.pageNumber = event.page;
    this.loadMembers();
  }
}
