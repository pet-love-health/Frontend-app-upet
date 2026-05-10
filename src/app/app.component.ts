import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {AngularFireModule} from "@angular/fire/compat";
import {firebaseConfig} from "./shared/config/firebase.config";
import {AngularFireStorageModule} from "@angular/fire/compat/storage";
import {SidebarComponent} from "./shared/components/sidebar/sidebar.component";
import {NgClass} from "@angular/common";
import {NavBarComponent} from "./shared/components/nav-bar/nav-bar.component";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {BrowserModule} from "@angular/platform-browser";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    AngularFireModule,
    SidebarComponent,
    NgClass,
    NavBarComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'upet-frontend-web';

  isSidebarCollapsed=false;

  constructor(private translate: TranslateService) {
    this.translate.addLangs(['en', 'fr', 'es', 'ja']);
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  onSidebarToggle(isCollapsed:boolean){
    this.isSidebarCollapsed = isCollapsed
  }

}
