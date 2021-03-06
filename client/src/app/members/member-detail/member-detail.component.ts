import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { Member } from 'src/app/_models/member';
import { Message } from 'src/app/_models/messages';
import { MembersService } from 'src/app/_services/members.service';
import { MessageService } from 'src/app/_services/message.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {

  @ViewChild('memberTabs', {static: true}) memberTabs: TabsetComponent;
  activeTab: TabDirective;
  member: Member;

  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  messages:Message[] = [];
  
  constructor(private memberService: MembersService, private route: ActivatedRoute, private messageService: MessageService) { }

  ngOnInit(): void {
    this.route.data.subscribe(response =>{
       this.member = response.member;
    })
    
    this.route.queryParams.subscribe(params =>{
      params.tab ? this.selectTab(params.tab) : this.selectTab(0);
      
    })    

    this.galleryOptions = [
      {
        width: '500px',
        height: '500px',
        imagePercent: 100,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false
      }];

      this.galleryImages = this.getImages();
      // this.loadMember();
  }

  // loadMember(){
  //   this.memberService.getMember(this.route.snapshot.paramMap.get('username')).subscribe(m =>{
  //     this.member = m;
  //     this.galleryImages = this.getImages();
  //   })
  // }

  getImages():NgxGalleryImage[]{
    let imgs:NgxGalleryImage[] = [];

    for(const photo of this.member.photos){
      imgs.push({
        small: photo?.url,
        medium: photo?.url,
        big: photo?.url
      }
      )
    }
    return imgs;
  }

  loadMessages(){
    this.messageService.getMessageThread(this.member.username).subscribe(resp =>{
      this.messages = resp;
    })
  }

  selectTab(tabId: number){ 
    this.memberTabs.tabs[tabId].active = true;
  }

  onTabActivated(data: TabDirective){
    this.activeTab = data;
    if(this.activeTab.heading === 'Messages' && this.messages.length === 0){
      this.loadMessages();
    }
  }





}
