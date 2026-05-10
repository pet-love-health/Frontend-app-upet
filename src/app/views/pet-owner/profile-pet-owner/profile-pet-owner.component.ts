import { Component } from '@angular/core';
import {PetOwnerSchemaGet, PetOwnerUpdateInformation} from "../../../core/PetOwner/schema/petowner.interface";
import {PetOwnerService} from "../../../core/PetOwner/services/pet-owner.service";
import {AuthService} from "../../../core/auth/services/auth.service";
import {DecodedToken} from "../../../core/auth/schema/decoded-token.interface";
import {user} from "@angular/fire/auth";
import {MapService} from "../../../shared/service/map.service";
import {DialogModule} from "primeng/dialog";
import {Button} from "primeng/button";
import {CalendarModule} from "primeng/calendar";
import {DropdownModule} from "primeng/dropdown";
import {FileUploadModule} from "primeng/fileupload";
import {FloatLabelModule} from "primeng/floatlabel";
import {InputTextModule} from "primeng/inputtext";
import {NgIf} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ToastModule} from "primeng/toast";
import {PetSchemaRequest} from "../../../core/Pet/schema/pet.interface";
import {formatDateToYYYYMMDD} from "../../../shared/helpers/date.formater";
import {TypeForm} from "../home-pet-owner/interfaces/type-form.enum";
import {PetResponse} from "../home-pet-owner/interfaces/PetResponse";
import {UploadService} from "../../../shared/service/upload.service";
import {firstValueFrom} from "rxjs";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-profile-pet-owner',
  standalone: true,
  imports: [
    DialogModule,
    Button,
    CalendarModule,
    DropdownModule,
    FileUploadModule,
    FloatLabelModule,
    InputTextModule,
    NgIf,
    ReactiveFormsModule,
    ToastModule,
    TranslatePipe
  ],
  templateUrl: './profile-pet-owner.component.html',
  styleUrl: './profile-pet-owner.component.css'
})
export class ProfilePetOwnerComponent {
  userClaims:DecodedToken = {} as DecodedToken;
  profile:PetOwnerSchemaGet = {} as PetOwnerSchemaGet;
  myForm:FormGroup;
  imageUrl: string | ArrayBuffer | null | undefined = null;
  dialogVisible: boolean = false;

  constructor(
    private petOwnerService:PetOwnerService,
    private authService:AuthService,
    private mapService:MapService,
    private fb: FormBuilder,
    private uploadService: UploadService,

  )
  {
    this.myForm = this.fb.group({
      name: ["", Validators.required],
      phone_number: ["", [Validators.required, Validators.pattern(/^\d{9}$/)]],
      location: ["", Validators.required],
      image_url: [""],
    })

  }
  ngOnInit() {
    this.userClaims = this.authService.decodeToken()!;
    const userId = this.userClaims?.user_id!;
    this.petOwnerService.getPetOwnerById(userId).subscribe((res:PetOwnerSchemaGet) => {
      this.profile = res;
      this.imageUrl = this.profile?.image_url;
      this.myForm.patchValue({
        name: res.name,
        phone_number: res.numberPhone,
        location: res.location,
      });

      const [lat, lng]= res.location.split(',');
      this.mapService.getAddressFromCoordinates(lat, lng).subscribe((address:string) => {
        this.profile.location = address;
        this.myForm.patchValue({
          name: this.profile.name,
          phone_number: this.profile.numberPhone,
          location: this.profile.location,
        });
      });
    });

  }

  async onImageSelect(event:any) {
    const file = event.files[0];
    console.log(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageUrl = e.target?.result; // Asigna la vista previa
        const fileUploadInput = document.querySelector<HTMLInputElement>('input[type="file"]');
        if (fileUploadInput) {
          fileUploadInput.value = ''; // Limpiar el valor del input
        }
      };
      reader.readAsDataURL(file);
      // Subir archivo
      this.imageUrl= await this.uploadService.uploadFile(file);
    }
  }
  async submitForm() {
    const location = await firstValueFrom(
      this.mapService.getCoordinatesFromAddress(this.myForm.value.location)
    );
    const body:PetOwnerUpdateInformation = {
      name: this.myForm.value.name,
      numberPhone: this.myForm.value.phone_number,
      location: location,
      image_url: this.imageUrl as string,
    }
    console.log({body});
    this.petOwnerService.updatePetOwner(this.userClaims.user_id, body).subscribe((res) => {
      this.profile = res;
      this.profile.location = this.myForm.value.location;
      this.imageUrl = res.image_url;
      this.dialogVisible = false;
      alert('Perfil actualizado');
    });
  }
  closeDialog() {
    this.dialogVisible = false;
  }
  openDialog() {
    this.dialogVisible = true;
  }

  protected readonly open = open;
}
