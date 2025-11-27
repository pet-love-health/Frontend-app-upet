import {Component} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {DialogModule} from "primeng/dialog";
import {
  FormAddPetComponent
} from "../../../views/pet-owner/home-pet-owner/components/form-add-pet/form-add-pet.component";
import {TypeForm} from "../../../views/pet-owner/home-pet-owner/interfaces/type-form.enum";
import {NgClass, NgIf} from "@angular/common";
import {Button} from "primeng/button";
import {AccordionModule} from "primeng/accordion";
import {MedicalResultsComponent} from "./components/medical-results/medical-results.component";
import {DiseasesComponent} from "./components/diseases/diseases.component";
import {SurgeriesComponent} from "./components/surgeries/surgeries.component";
import {VaccinesComponent} from "./components/vaccines/vaccines.component";
import { MedicalHistoryBaseService } from '../../../core/MedicalHistory/services/shared/medical-history-base.service';
import { PetService } from '../../../core/Pet/services/pet.service';
import { PetResponse } from '../../../views/pet-owner/home-pet-owner/interfaces/PetResponse';
import { PetSchemaResponse } from '../../../core/Pet/schema/pet.interface';
import {AuthService} from "../../../core/auth/services/auth.service";
import {InputTextModule} from "primeng/inputtext";
import {FloatLabelModule} from "primeng/floatlabel";
import {PaginatorModule} from "primeng/paginator";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {SmartCollarService} from "../../../core/SmartCollar/services/smart-collar.service";
import {SmartCollarSchemaGet} from "../../../core/SmartCollar/schema/smart-collar.interface";
import {firstValueFrom} from "rxjs";
import {UserType} from "../../../core/auth/enum/UserType.enum";
import {CustomMapComponent} from "../../components/custom-map/custom-map.component";
import {MapMarkerCustom} from "../../components/custom-map/interfaces/MapMarkerCustom";
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
    NgClass,
    InputTextModule,
    FloatLabelModule,
    PaginatorModule,
    ReactiveFormsModule,
    FormsModule,
    CustomMapComponent,
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
  isTracked= true;

  productCodeForm:FormGroup = new FormGroup({});

  petCollarData:SmartCollarSchemaGet = {} as SmartCollarSchemaGet;

  dialogStartTrackVisible = false;
  dialogStopTrackVisible = false;
  dialogMapVisible = false;

  userRole:UserType;
  intervalIdRequestCollar: any;
  petMarker:MapMarkerCustom[] = [];

  constructor(
    private router: ActivatedRoute,
    private petsApiService: PetService,
    private historyApiService: MedicalHistoryBaseService,
    private authService: AuthService,
    private smartCollarService:SmartCollarService
  ) {
    this.router.params.subscribe(params => {
      this.petId = params['id'];
    });
    this.userRole = this.authService.getRole();
    this.productCodeForm = new FormGroup({
      productCode: new FormControl('', Validators.required)
    });

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

    this.smartCollarService.getSmartCollarByPetId(this.petId!).subscribe(data => {
      if (data.length > 0) {
        this.isTracked = true;
        this.petCollarData = data[0];
        this.intervalIdRequestCollar = setInterval(()=>{
          this.smartCollarService.getSmartCollarByPetId(this.petId!).subscribe(data => {
            console.log('Requesting collar data');
            if(data.length>0){
              this.petCollarData = data[0];
              this.petMarker = [
                {
                  coords: {
                    lat: this.petCollarData.location.latitude,
                    lng: this.petCollarData.location.longitude
                  },
                  name:this.pet?.name!,
                  description:this.pet?.breed,
                  iconUrl:this.pet?.image_url!,
                }
              ];
              console.log("Coordenadas de la mascota",this.petMarker[0].coords);
            }
          });
        },100);
      }
    });
  }

  ngOnDestroy(){
    clearInterval(this.intervalIdRequestCollar);
  }

  closeDialogEdit = () =>{
    this.visible = false;
  }
  openDialogEdit = () =>{
    this.visible = true;
  }
  activeIndexChange(index: number | number[]) {
    if (Array.isArray(index)) {
      this.activeIndex = index[0]; // O maneja según tu lógica, por ejemplo, puedes tomar el primer índice
    } else {
      this.activeIndex = index; // Si es un solo número
    }
    console.log('Índice activo cambiado a:', this.activeIndex);
  }
  getHistoryMedic(){

  }
  async startTrack(){
    let collars:SmartCollarSchemaGet[] = await firstValueFrom(this.smartCollarService.getSmartCollars());
    //search collar
    console.log({collars, inputValue:this.productCodeForm.value.productCode});
    let collar = collars.find(collar => collar.serial_number === this.productCodeForm.value.productCode);
    if(collar){
      this.smartCollarService.assignSmartCollar(this.petId!, collar.id).subscribe(()=>{
        alert('Collar asociado correctamente a la mascota');
        this.isTracked = true;
        this.closeDialogTracking();
        this.petCollarData = collar;
        }
      );

    }
    else{
      alert('No se encontró el collar');
    }
  }
  async stopTrack(){
    let collar = await firstValueFrom(this.smartCollarService.getSmartCollarByPetId(this.petId!));
    if(collar.length === 0)
      return;
    this.smartCollarService.assignSmartCollar(null,collar[0].id).subscribe(()=>{
      alert('Collar desasociado correctamente');
    });
    this.isTracked = false;
    this.closeDialogStopTracking();
  }
  openDialogTracking(){
    this.dialogStartTrackVisible = true;
  }
  closeDialogTracking(){
    this.dialogStartTrackVisible = false;
  }
  openDialogStopTracking(){
    this.dialogStopTrackVisible = true;
  }
  closeDialogStopTracking(){
    this.dialogStopTrackVisible = false;
  }
  openMapDialog(){
    this.dialogMapVisible = true;
  }
  closeMapDialog = ()=>{
    this.dialogMapVisible = false;
  }

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
