import {Component} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {DialogModule} from "primeng/dialog";
import {
  FormAddPetComponent
} from "../../../views/pet-owner/home-pet-owner/components/form-add-pet/form-add-pet.component";
import {TypeForm} from "../../../views/pet-owner/home-pet-owner/interfaces/type-form.enum";
import {NgIf} from "@angular/common";
import {Button} from "primeng/button";
import {AccordionModule} from "primeng/accordion";
import {MedicalResultsComponent} from "./components/medical-results/medical-results.component";
import {DiseasesComponent} from "./components/diseases/diseases.component";
import {SurgeriesComponent} from "./components/surgeries/surgeries.component";
import {VaccinesComponent} from "./components/vaccines/vaccines.component";
import {MedicalHistoryBaseService} from '../../../core/MedicalHistory/services/shared/medical-history-base.service';
import {PetService} from '../../../core/Pet/services/pet.service';
import {PetSchemaResponse} from '../../../core/Pet/schema/pet.interface';
import {AuthService} from "../../../core/auth/services/auth.service";
import {UserType} from "../../../core/auth/enum/UserType.enum";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-pet-profile-view',
  standalone: true,
  imports: [
    DialogModule,
    FormAddPetComponent,
    NgIf,
    Button,
    AccordionModule,
    MedicalResultsComponent,
    DiseasesComponent,
    SurgeriesComponent,
    VaccinesComponent,
    TranslatePipe
  ],
  templateUrl: './pet-profile-view.component.html',
  styleUrl: './pet-profile-view.component.css'
})
export class PetProfileViewComponent {

  pet: PetSchemaResponse | undefined;
  petId: number | undefined;
  historyId: number | undefined;
  visible = false;
  activeIndex: number | undefined = 0;
  userRole: UserType;

  constructor(
    private router: ActivatedRoute,
    private petsApiService: PetService,
    private historyApiService: MedicalHistoryBaseService,
    private authService: AuthService,
  ) {
    this.router.params.subscribe(params => {
      this.petId = params['id'];
    });
    this.userRole = this.authService.getRole();
  }

  ngOnInit() {
    if (this.petId) {
      this.petsApiService.getPetById(this.petId).subscribe(pet => {
        this.pet = {
          ...pet,
          petOwnerId: pet.petOwnerId
        };
        console.log({location: 'PetProfileViewComponent', pet});
      });
      this.historyApiService.getMedicalHistoryByPetId(this.petId).subscribe(history => {
        this.historyId = history.id;
        console.log({location: 'PetProfileViewComponent', history});
      });
    }
  }

  closeDialogEdit = () => {
    this.visible = false;
  }
  openDialogEdit = () => {
    this.visible = true;
  }
  activeIndexChange(index: number | number[]) {
    if (Array.isArray(index)) {
      this.activeIndex = index[0];
    } else {
      this.activeIndex = index;
    }
    console.log('Índice activo cambiado a:', this.activeIndex);
  }
  getHistoryMedic() {}

  downloadMedicalPDF() {
    if (!this.petId) return;

    this.historyApiService.downloadMedicalPDF(this.petId).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `historial-medico-${this.pet?.name || this.petId}.pdf`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (error) => {
        console.error('Error al descargar PDF', error);
        alert('Error al descargar el archivo PDF');
      }
    });
  }
  protected readonly TypeForm = TypeForm;
  protected readonly UserType = UserType;
}
