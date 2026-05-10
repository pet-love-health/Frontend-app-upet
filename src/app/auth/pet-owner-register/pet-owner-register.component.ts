import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PetOwnerService } from '../../core/PetOwner/services/pet-owner.service';
import { PetOwnerSchemaPost } from '../../core/PetOwner/schema/petowner.interface';
import { AuthService } from '../../core/auth/services/auth.service';
import { Router } from '@angular/router';
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-pet-owner-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  templateUrl: './pet-owner-register.component.html',
  styleUrls: ['./pet-owner-register.component.css']
})
export class PetOwnerRegisterComponent {
  registerForm: FormGroup;
  locationSuggestions: any[] = [];
  submitted = false; // Inicializa la variable

  constructor(
    private http: HttpClient,
    private petOwnerService: PetOwnerService,
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder // Usa FormBuilder para crear el formulario
  ) {
    this.registerForm = this.formBuilder.group({
      numberPhone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      location: ['', Validators.required]
    });
  }

  // Obtener sugerencias de ubicación de OSM usando Nominatim
  getLocationSuggestions(query: string) {
    if (query) { // Verifica si hay consulta
      const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=5`;
      this.http.get(url).subscribe(
        (data: any) => {
          this.locationSuggestions = data;
        },
        (error) => {
          console.error('Error al obtener sugerencias de ubicación:', error);
          this.locationSuggestions = []; // Limpiar sugerencias en caso de error
        }
      );
    } else {
      this.locationSuggestions = []; // Limpiar sugerencias si no hay consulta
    }
  }

  // Seleccionar una ubicación de la lista de sugerencias
  selectLocation(suggestion: any) {
    this.registerForm.patchValue({ location: suggestion.display_name }); // Actualiza el campo de ubicación en el formulario
    this.locationSuggestions = []; // Limpiar sugerencias
  }

  // Función de registro
  onSubmit() {
    this.submitted = true; // Cambia el estado a verdadero al intentar enviar el formulario

    // Si el formulario no es válido, simplemente regresamos
    if (this.registerForm.invalid) {
      return;
    }

    const userData: PetOwnerSchemaPost = {
      numberPhone: this.registerForm.value.numberPhone,
      location: this.registerForm.value.location
    };
    console.log('Datos de registro:', userData);
    const user_id:number = this.authService.decodeToken()?.user_id!;

    if (user_id) {
      this.petOwnerService.createPetOwner(user_id, userData).subscribe(
        (response) => {
          console.log('Registro exitoso', response);
          this.router.navigate(['/pet-owner/home']);
        },
        (error) => {
          console.error('Error en el registro', error);
          // Puedes mostrar un mensaje de error al usuario aquí
          this.registerForm.reset(); // Reinicia el formulario en caso de error
        }
      );
    } else {
      console.error('Error al obtener el ID de usuario');
      // Puedes mostrar un mensaje de error al usuario aquí
    }
  }
}
