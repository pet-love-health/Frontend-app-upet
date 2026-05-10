import { Component } from '@angular/core';
import {NavBarComponent} from "../../../shared/components/nav-bar/nav-bar.component";
import {RouterOutlet} from "@angular/router";
import {SidebarComponent} from "../../../shared/components/sidebar/sidebar.component";
import {NgClass} from "@angular/common";
import { ChatbotComponent } from '../../../shared/components/chatbot/chatbot.component';


@Component({
  selector: 'app-vet-layout',
  standalone: true,
  imports: [
    NavBarComponent,
    RouterOutlet,
    SidebarComponent,
    NgClass,
    ChatbotComponent
  ],
  templateUrl: './vet-layout.component.html',
  styleUrl: './vet-layout.component.css'
})
export class VetLayoutComponent {
  isSidebarCollapsed=false;
  options = [
    { label: 'Home', icon: 'pi pi-home', link: '/vets/home' },
    { label: 'Booking', icon: 'pi pi-wifi', link: '/vets/booking' },
    {label: 'Reviews', icon:'pi pi-building', link: '/vets/reviews'},
    { label: 'Notifications', icon: 'pi pi-book', link: '/vets/notifications' },
    { label: 'Profile', icon: 'pi pi-user', link: '/vets/profile' },
    { label: 'Logout', icon: 'pi pi-sign-out', link: '#', action: 'logout' }
  ];
  onSidebarToggle(isCollapsed:boolean){
    this.isSidebarCollapsed = isCollapsed
  }
}
