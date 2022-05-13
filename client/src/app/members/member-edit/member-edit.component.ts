import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Member } from 'src/app/_models/member';
import { Photo } from 'src/app/_models/photo';
import { User } from 'src/app/_models/user';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.css']
})
export class MemberEditComponent implements OnInit {
  @ViewChild("editForm") editForm:NgForm;

  member:Member;
  user:User;

  @HostListener('window:beforeunload',['$event'])
  unsavedChanges($event:any){
    if(this.editForm.dirty){
       $event.returnValue = true;
    }
  }

  constructor(private memberService:MembersService, 
    private accountService:AccountService,
    private toastr:ToastrService) {
      this.accountService.currentUser$.subscribe(u=>{
        this.user = u;
      })
  }

  ngOnInit(): void {
    this.loadMember();
  }

  loadMember(){
    this.memberService.getMember(this.user.username).subscribe( m =>{
      this.member = m;
    });
  }

  updateMember(){
    this.memberService.updateMember(this.member).subscribe(()=>{
      this.toastr.success("Profile updated successfully");
      this.editForm.reset(this.member);
    });
  }

  setMainPhoto(photo:Photo){
    this.memberService.setMainPhoto(photo.id).subscribe( ()=>{
      this.member.photoUrl = photo.url;
      this.member.photos.forEach(p =>{
        if (p.isMain) p.isMain = false;
        if(p.id == photo.id) p.isMain = true;
      });
      
      this.user.mainPhotoUrl = photo.url;
      this.accountService.setCurrentUser(this.user);

      this.memberService.updateMember(this.member);
    });
  }

  deletePhoto(photo:Photo){
    this.memberService.deletePhoto(photo.id).subscribe( ()=>{
      const indexPhoto = this.member.photos.indexOf(photo,0);
      if(indexPhoto > -1){
        this.member.photos.splice(indexPhoto,1);
      }

      //this.member.photos = this.member.photos.filter(p => p.id !== photo.id);
    })
  }

}
