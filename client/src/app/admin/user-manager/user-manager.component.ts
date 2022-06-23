import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { User } from 'src/app/_models/user';
import { AdminService } from 'src/app/_services/admin.service';
import { ModalEditRoleComponent } from '../modal-edit-role/modal-edit-role.component';

@Component({
  selector: 'app-user-manager',
  templateUrl: './user-manager.component.html',
  styleUrls: ['./user-manager.component.css']
})
export class UserManagerComponent implements OnInit {

  users: any;
  modalRef?: BsModalRef;

  constructor(private adminService: AdminService, 
    private modalService: BsModalService) { }

  ngOnInit(): void {
    this.getUsersWithRoles();
  }

  getUsersWithRoles(){
    this.adminService.getUserWithRoles().subscribe(users =>{
      this.users = users;
    })
  }

  openModal(user){
    const initialState: ModalOptions = {
      initialState: {
        user: user,
        title: user.userName.charAt(0).toUpperCase() + user.userName.slice(1) + " Edit Roles"
      }
    };
    this.modalRef =  this.modalService.show(ModalEditRoleComponent,initialState);


    this,this.modalRef.content.updateRolesEvent.subscribe(data =>{
      var objIndex = this.users.findIndex((obj => obj.userName == data.username));
      this.adminService.setUserRoles(data.username, data.roles).subscribe(roles =>{
         this.users[objIndex].roles = roles
      });
    })
  }
  

}
