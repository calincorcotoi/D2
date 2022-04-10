import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../_models/user';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  model:any = {}
  loggedIn : boolean

  constructor(public accountService: AccountService) { //the service needs to be public in order to be acces from the dom level

  }

  ngOnInit(): void {
  }

  login(){
    console.log(this.model);
    this.accountService.login(this.model).subscribe(response =>{
      console.log(response);
    }, error =>{
      console.log(error);
    });
  }

  logout(){
    this.accountService.logout();
  }
  
}
