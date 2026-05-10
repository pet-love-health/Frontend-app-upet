import {Component, ElementRef, Inject, Input} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { NgIf } from '@angular/common';
import { MessageService } from 'primeng/api';
import { formatDateToYYYYMMDD } from '../../../../../shared/helpers/date.formater';
import { UploadService } from '../../../../../shared/service/upload.service';
import { Gender } from '../../interfaces/Gender';
import { PetResponse } from '../../interfaces/PetResponse';
import { TypeForm } from '../../interfaces/type-form.enum';
import { PetService } from '../../../../../core/Pet/services/pet.service';
import { PetSchemaRequest, PetSchemaResponse } from '../../../../../core/Pet/schema/pet.interface';
import {AuthService} from "../../../../../core/auth/services/auth.service";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-form-add-pet',
  standalone: true,
  imports: [
    Button,
    DialogModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    FloatLabelModule,
    ListboxModule,
    DropdownModule,
    CalendarModule,
    ToastModule,
    FileUploadModule,
    NgIf,
    TranslatePipe,
  ],
  templateUrl: './form-add-pet.component.html',
  styleUrls: ['./form-add-pet.component.css']
})
export class FormAddPetComponent {
  @Input() closeDialog!:()=>void;
  @Input() mode!:TypeForm;
  @Input() pet: PetSchemaResponse|undefined;

  myForm:FormGroup;
  imageUrl: string | ArrayBuffer | null | undefined = null;
  private uploadedUrl: string | undefined = undefined;
  isUploading: boolean = false;
  genders!: Gender [];
  speciesList = ['Dog', 'Cat', 'Bird', 'Fish', 'Reptile', 'Rodent', 'Rabbit', 'Other'];
  buttonTitle:string = "";


  ngOnInit() {
    this.genders = [
      {name:"Male", id: 1},
      {name:"Female", id: 2},
    ];

    this.myForm = this.fb.group<PetResponse>({
      name: this.mode === TypeForm.ADD ? "" : this.pet?.name,
      breed: this.mode === TypeForm.ADD ? "" : this.pet?.breed,
      species: this.mode === TypeForm.ADD ? "" : this.pet?.species,
      image_url: this.mode === TypeForm.ADD ? "" : this.pet?.image_url,
      gender: this.mode === TypeForm.ADD ? undefined : this.getGenderByName(this.pet?.gender!),
      weight: this.mode === TypeForm.ADD ? undefined : this.pet?.weight,
      birthdate: this.mode === TypeForm.ADD ? undefined: new Date(this.pet?.birthdate!)
    });
    this.imageUrl = this.pet?.image_url;
    this.buttonTitle = this.mode === TypeForm.ADD ? "Add" : "Edit";

    this.translateService.onLangChange.subscribe(lang => {
      this.initTranslations();
    })
  }

  constructor(
    @Inject(FormBuilder) private fb: FormBuilder,
    private messageService: MessageService,
    private uploadService: UploadService,
    private petsApiService: PetService,
    private authService:AuthService,
    private translateService:TranslateService
  ) {
    this.myForm = this.fb.group<PetResponse>({
      name: "",
      breed: "",
      species: "",
      image_url: "",
      gender: "",
      weight: undefined,
      birthdate: undefined
    })
    this.imageUrl = this.pet?.image_url;
  }


  async onImageSelect(event:any) {
    const file = event.files[0];
    if (file) {
      this.isUploading = true;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageUrl = e.target?.result; // preview only (base64)
        const fileUploadInput = document.querySelector<HTMLInputElement>('input[type="file"]');
        if (fileUploadInput) fileUploadInput.value = '';
      };
      reader.readAsDataURL(file);
      try {
        this.uploadedUrl = await this.uploadService.uploadFile(file);
        this.imageUrl = this.uploadedUrl;
      } catch (error) {
        console.error('Error uploading file:', error);
        this.uploadedUrl = undefined;
      } finally {
        this.isUploading = false;
      }
    }
  }
  private readonly defaultImageUrl = 'https://image.freepik.com/vector-gratis/ilustracion-vector-dibujos-animados-lindo-animal-mascota_24640-53565.jpg';

  submitForm(){
    if (this.isUploading) {
      alert('Please wait for the image to finish uploading.');
      return;
    }
    const userId = this.authService.decodeToken()?.user_id!;
    const finalImageUrl = this.uploadedUrl
      ?? (this.mode === TypeForm.EDIT ? this.pet?.image_url : undefined)
      ?? this.defaultImageUrl;
    const petRequest:PetSchemaRequest = {
      ...this.myForm.value,
      birthdate: formatDateToYYYYMMDD(this.myForm.value["birthdate"]),
      gender: this.myForm.value.gender["name"],
      image_url: finalImageUrl
    };
    console.log({petRequest});
    if(this.mode === TypeForm.ADD){
    this.petsApiService.createPet(userId, petRequest).subscribe(data=>{
      alert("Pet created successfully");
    });}
    else{
      this.petsApiService.updatePet(this.pet!.id as number, petRequest).subscribe(data=>{
        alert("Pet updated successfully");
        window.location.reload();
      });
    }
  }
  getGenderByName(name:string):any{
    return this.genders.find((object)=>object.name === name);
  }

  initTranslations() {
    this.buttonTitle = this.mode === TypeForm.ADD ?
      this.translateService.instant("form_add_pet.btn_add") :
      this.translateService.instant("form_add_pet.btn_edit")
    ;
  }

}
