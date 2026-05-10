import {Component, OnDestroy} from '@angular/core';
import {AuthService} from "../../../core/auth/services/auth.service";
import {UserType} from "../../../core/auth/enum/UserType.enum";
import {NotificationService} from "../../../core/Notification/services/notification.service";
import {NotificationSchemaGet} from "../../../core/Notification/schema/notification.interface";
import {NotificationCardComponent} from "./components/notification-card/notification-card.component";
import {NgForOf, NgIf} from "@angular/common";
import {formatDateToYYYYMMDDHHMM} from "../../helpers/date.formater";
import {firstValueFrom} from "rxjs";
import {TranslatePipe} from "@ngx-translate/core";

const POLL_INTERVAL_MS = 30000;

@Component({
    selector: 'app-notifications-view',
    standalone: true,
  imports: [
    NotificationCardComponent,
    NgForOf,
    NgIf,
    TranslatePipe
  ],
    templateUrl: './notifications-view.component.html',
    styleUrl: './notifications-view.component.css'
})
export class NotificationsViewComponent implements OnDestroy {

    private timerNotificationsId: any;
    notifications: NotificationSchemaGet[] = [];

    constructor(
        private authService: AuthService,
        private notificationsService: NotificationService
    ) {
    }

    async ngOnInit() {
        await this.fetchNotifications();
        this.timerNotificationsId = setInterval(() => this.fetchNotifications(), POLL_INTERVAL_MS);
    }

    ngOnDestroy() {
        clearInterval(this.timerNotificationsId);
    }

    private async fetchNotifications(): Promise<void> {
        const role = this.authService.getRole();
        const userId = this.authService.decodeToken()?.user_id!;
        try {
            let result: NotificationSchemaGet[];
            if (role === UserType.Owner) {
                result = await firstValueFrom(this.notificationsService.getNotificationsByPetOwnerId(userId));
            } else if (role === UserType.Vet) {
                result = await firstValueFrom(this.notificationsService.getNotificationsByVeterinaryId(userId));
            } else {
                return;
            }
            this.notifications = result.map((notification) => ({
                ...notification,
                datetime: formatDateToYYYYMMDDHHMM(new Date(notification.datetime))
            }));
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }

}
