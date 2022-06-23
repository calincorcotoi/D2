import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { User } from 'src/app/_models/user';

@Component({
  selector: 'app-modal-edit-role',
  templateUrl: './modal-edit-role.component.html',
  styleUrls: ['./modal-edit-role.component.css']
})
export class ModalEditRoleComponent implements OnInit {
  title?: string;
  user;
  nr: number = 0;
  setMember:boolean;
  setAdmin:boolean;
  setModerator:boolean;

  @Output() updateRolesEvent = new EventEmitter<{username:string, roles:string[]}>();
  @ViewChild("rolesForm") rolesForm:NgForm;
  constructor(public bsModalRef: BsModalRef,public modalService: BsModalService) {

   }

  ngOnInit(): void {
    this.modalService.onShown.subscribe( data =>{
      var user: Partial<User> = this.modalService.config.initialState.user;
      this.setMember = user.roles.includes('Member');
      this.setAdmin = user.roles.includes('Admin');
      this.setModerator = user.roles.includes('Moderator');
     })

  }

  updateRoles(username: string) {
  
  var roles:string[] = [];

  if(this.setMember) roles.push("Member");
  if(this.setAdmin) roles.push("Admin");
  if(this.setModerator) roles.push("Moderator");
  
    this.updateRolesEvent.emit({username, roles});
    
    this.bsModalRef.hide();
  }

}
