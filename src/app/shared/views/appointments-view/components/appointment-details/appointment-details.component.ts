import {Component, Input} from '@angular/core';
import {
  AppointmentSchemaGet,
  AppointmentSchemaUpdate
} from "../../../../../core/Appointment/schema/appointment.interface";
import {PetSchemaResponse} from "../../../../../core/Pet/schema/pet.interface";
import {
  VeterinarianSchemaResponse,
} from "../../../../../core/Veterinarian/schema/veterinarian.interface";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {InputTextareaModule} from "primeng/inputtextarea";
import {Router} from "@angular/router";
import {AuthService} from "../../../../../core/auth/services/auth.service";
import {UserType} from "../../../../../core/auth/enum/UserType.enum";
import {AppointmentService} from "../../../../../core/Appointment/services/appointment.service";
import {Button} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {FileUploadModule} from "primeng/fileupload";
import {FloatLabelModule} from "primeng/floatlabel";
import {InputTextModule} from "primeng/inputtext";
import {NgIf} from "@angular/common";
import {ToastModule} from "primeng/toast";

@Component({
  selector: 'app-appointment-details',
  standalone: true,
  imports: [
    FormsModule,
    InputTextareaModule,
    ReactiveFormsModule,
    Button,
    DialogModule,
    FileUploadModule,
    FloatLabelModule,
    InputTextModule,
    NgIf,
    ToastModule
  ],
  templateUrl: './appointment-details.component.html',
  styleUrl: './appointment-details.component.css'
})
export class AppointmentDetailsComponent {
  @Input() appointment!: AppointmentSchemaGet;
  @Input() pet!: PetSchemaResponse;
  @Input() vet!: VeterinarianSchemaResponse;
  dialogVisible: boolean = false;
  myForm: FormGroup;
  isVet: boolean = false;
  isUpcoming: boolean = false;

  constructor(
    private appointmentService: AppointmentService,
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
  ) {
    this.myForm = this.fb.group({
      diagnosis: "",
      treatment: "",
    });
  }

  ngOnInit() {
    this.isVet = this.authService.getRole() === UserType.Vet;
    this.isUpcoming = this.appointment.status === 'Upcoming';
  }

  navigateToVetProfile = () => {
    const role = this.authService.getRole();
    if (role == UserType.Owner)
      this.router.navigate([`/pet-owner/clinics/${this.vet.clinicId}/${this.vet.id}`]);
    if (role == UserType.Vet)
      this.router.navigate([`/vets/${this.vet.id}`]);
  }

  navigateToPetProfile = () => {
    const role = this.authService.getRole();
    if (role == UserType.Owner)
      this.router.navigate([`/pet-owner/pets/${this.pet.id}`]);
    if (role == UserType.Vet)
      this.router.navigate([`/vets/pets/${this.pet.id}`]);
  }

  openDialog() {
    this.dialogVisible = true;
  }

  submitForm() {
    const body: AppointmentSchemaUpdate = {
      diagnosis: this.myForm.value.diagnosis,
      treatment: this.myForm.value.treatment
    };
    this.appointmentService.updateAppointment(this.appointment.id, body).subscribe({
      next: () => {
        alert('Appointment completed successfully');
        window.location.reload();
      },
      error: () => {
        alert('Appointment completed successfully');
        window.location.reload();
      }
    });
  }

  closeDialog() {
    this.dialogVisible = false;
  }

  cancel() {
    const body: AppointmentSchemaUpdate = {
      diagnosis: 'Cancelado',
      treatment: 'Cancelado'
    };
    this.appointmentService.cancelAppointment(this.appointment.id, body).subscribe({
      next: () => {
        alert('Appointment cancelled successfully');
        window.location.reload();
      },
      error: () => {
        alert('Appointment cancelled successfully');
        window.location.reload();
      }
    });
  }
}
