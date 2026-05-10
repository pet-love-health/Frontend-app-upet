import { Component } from '@angular/core';
import {Button} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {FileUploadModule} from "primeng/fileupload";
import {FloatLabelModule} from "primeng/floatlabel";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {NgIf} from "@angular/common";
import {ToastModule} from "primeng/toast";
import {DecodedToken} from "../../../core/auth/schema/decoded-token.interface";
import {PetOwnerSchemaGet, PetOwnerUpdateInformation} from "../../../core/PetOwner/schema/petowner.interface";
import {PetOwnerService} from "../../../core/PetOwner/services/pet-owner.service";
import {AuthService} from "../../../core/auth/services/auth.service";
import {MapService} from "../../../shared/service/map.service";
import {UploadService} from "../../../shared/service/upload.service";
import {firstValueFrom} from "rxjs";
import {VeterinarianService} from "../../../core/Veterinarian/services/veterinarian.service";
import {
  VeterinarianSchemaResponse,
  VeterinarianUpdateInformation
} from "../../../core/Veterinarian/schema/veterinarian.interface";
import {InputTextareaModule} from "primeng/inputtextarea";
import {VeterinaryClinicService} from "../../../core/VeterinaryClinic/services/veterinary-clinic.service";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-profile-vet',
  standalone: true,
  imports: [
    Button,
    DialogModule,
    FileUploadModule,
    FloatLabelModule,
    FormsModule,
    InputTextModule,
    NgIf,
    ReactiveFormsModule,
    ToastModule,
    InputTextareaModule,
    TranslatePipe
  ],
  templateUrl: './profile-vet.component.html',
  styleUrl: './profile-vet.component.css'
})
export class ProfileVetComponent {
  userClaims:DecodedToken = {} as DecodedToken;
  profile:VeterinarianSchemaResponse = {} as VeterinarianSchemaResponse;
  myForm:FormGroup;
  imageUrl: string | ArrayBuffer | null | undefined = null;
  dialogVisible: boolean = false;
  generateCodeDialogVisible: boolean = false;
  isUploading: boolean = false;
  passwordGenerated: string = '';

  constructor(
    private vetService:VeterinarianService,
    private authService:AuthService,
    private mapService:MapService,
    private fb: FormBuilder,
    private uploadService: UploadService,
    private vetClinicService:VeterinaryClinicService

  )
  {
    this.myForm = this.fb.group({
      name: "",
      description: "",
      experience: "",
      image_url: "",
    })

  }
  ngOnInit() {
    this.userClaims = this.authService.decodeToken()!;
    const userId = this.userClaims?.user_id!;
    this.vetService.getVeterinarianById(userId).subscribe((res:VeterinarianSchemaResponse) => {
      this.profile = res;
      this.imageUrl = this.profile?.image_url;
      this.myForm.patchValue({
        name: res.name,
        description: res.description,
        experience: res.experience,
      });

    });

  }

  async onImageSelect(event: any) {
    const file = event.files[0];
    if (file) {
      this.isUploading = true;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageUrl = e.target?.result;
        const fileUploadInput = document.querySelector<HTMLInputElement>('input[type="file"]');
        if (fileUploadInput) fileUploadInput.value = '';
      };
      reader.readAsDataURL(file);
      try {
        this.imageUrl = await this.uploadService.uploadFile(file);
      } catch (error) {
        console.error('Image upload failed', error);
      } finally {
        this.isUploading = false;
      }
    }
  }
  async submitForm() {
    if (this.isUploading) {
      alert('Please wait for the image to finish uploading.');
      return;
    }
    const body:VeterinarianUpdateInformation = {
      name: this.myForm.value.name,
      description: this.myForm.value.description,
      experience: this.myForm.value.experience,
      image_url: this.imageUrl as string
    }
    console.log({body});
    this.vetService.changeVetInformation(this.profile.id, body).subscribe((res:VeterinarianSchemaResponse) => {
      this.profile = res;
      this.imageUrl = res.image_url;
      this.myForm.patchValue({
        name: res.name,
        description: res.description,
        experience: res.experience,
      });
      alert('Veterinarian updated successfully');
      this.closeDialog();
    });
  }
  closeDialog() {
    this.dialogVisible = false;
  }
  openDialog() {
    this.dialogVisible = true;
  }

  closeGenerateCodeDialog() {
    this.generateCodeDialogVisible = false;
  }
  openGenerateCodeDialog() {
    this.vetClinicService.generateUniquePassword(this.profile.clinicId).subscribe((res) => {
      this.passwordGenerated = res;
    });
    this.generateCodeDialogVisible = true;
  }
}
