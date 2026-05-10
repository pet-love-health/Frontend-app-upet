import { Component } from '@angular/core';
import {NavBarComponent} from "../../../shared/components/nav-bar/nav-bar.component";
import {SidebarComponent} from "../../../shared/components/sidebar/sidebar.component";
import {RouterOutlet} from "@angular/router";
import {NgClass} from "@angular/common";
import {TranslateService} from "@ngx-translate/core";
import { ChatbotComponent } from '../../../shared/components/chatbot/chatbot.component';

@Component({
  selector: 'app-pet-owner-layout',
  standalone: true,
  imports: [
    NavBarComponent,
    SidebarComponent,
    RouterOutlet,
    NgClass,
    ChatbotComponent
  ],
  templateUrl: './pet-owner-layout.component.html',
  styleUrl: './pet-owner-layout.component.css'
})
export class PetOwnerLayoutComponent {
  isSidebarCollapsed=false;
  options = [
    { label: 'Home', icon: 'pi pi-home', link: '/pet-owner/home' },
    { label: 'Pets', icon: 'pi pi-wifi', link: '/pet-owner/pets' },
    {label: 'Clinics', icon:'pi pi-building', link: '/pet-owner/clinics'},
    { label: 'Appointments', icon: 'pi pi-book', link: '/pet-owner/appointments' },
    { label: 'Notifications', icon: 'pi pi-bell', link: '/pet-owner/notifications' },
    { label: 'Profile', icon: 'pi pi-user', link: '/pet-owner/profile' },
    { label: 'Log out', icon: 'pi pi-sign-out', link: '#', action: 'logout' }
  ];

  constructor(private translateService: TranslateService) {
  }

  ngOnInit() {
    this.translateService.onLangChange.subscribe(lang => {
      this.options = [
        { label: this.translateService.instant('pet_owner_sidebar.home'), icon: 'pi pi-home', link: '/pet-owner/home' },
        { label: this.translateService.instant('pet_owner_sidebar.my_pets'), icon: 'pi pi-wifi', link: '/pet-owner/pets' },
        {label: this.translateService.instant('pet_owner_sidebar.clinics'), icon:'pi pi-building', link: '/pet-owner/clinics'},
        {label: this.translateService.instant('pet_owner_sidebar.favorite_clinics'), icon: 'pi pi-heart', link: '/pet-owner/favorite-clinics' },
        { label: this.translateService.instant('pet_owner_sidebar.appointments'), icon: 'pi pi-book', link: '/pet-owner/appointments' },
        { label: this.translateService.instant('pet_owner_sidebar.notifications'), icon: 'pi pi-bell', link: '/pet-owner/notifications' },
        { label: this.translateService.instant('pet_owner_sidebar.profile'), icon: 'pi pi-user', link: '/pet-owner/profile' },
        { label: this.translateService.instant('pet_owner_sidebar.logout'), icon: 'pi pi-sign-out', link: '#', action: 'logout' }
      ];
    })
  }

  onSidebarToggle(isCollapsed:boolean){
    this.isSidebarCollapsed = isCollapsed
  }
}
