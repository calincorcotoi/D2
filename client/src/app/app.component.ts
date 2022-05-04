import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { AccountService } from './_services/account.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'The Dating App';
  users:any;

  constructor( private accountService: AccountService,private http: HttpClient){
  }

  ngOnInit(): void {
    this.serCurrentUser();
    }

    serCurrentUser(){
      const user = JSON.parse(localStorage.getItem('user'));
      this.accountService.setCurrentUser(user)
    }
}
