import { CommonModule } from '@angular/common';
import { Component, NgZone, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PetOwnerService } from '../../core/PetOwner/services/pet-owner.service';
import { PetOwnerSchemaPost } from '../../core/PetOwner/schema/petowner.interface';
import { AuthService } from '../../core/auth/services/auth.service';
import { Router } from '@angular/router';
import { TranslatePipe } from "@ngx-translate/core";
import { LoginResponse } from '../../core/shared/login-response.interface';
import { navigateTo } from '../shared/auth.utils';

declare var google: any;

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
export class PetOwnerRegisterComponent implements OnDestroy {
  registerForm: FormGroup;
  locationSuggestions: any[] = [];
  submitted = false;

  private selectedLocationName = '';
  private selectingLocation = false;
  private autocompleteService: any;
  private debounceTimer: any;
  private subs = new Subscription();

  constructor(
    private ngZone: NgZone,
    private petOwnerService: PetOwnerService,
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.registerForm = this.formBuilder.group({
      numberPhone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      location: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (typeof google !== 'undefined' && google.maps?.places) {
      this.autocompleteService = new google.maps.places.AutocompleteService();
    }

    this.subs.add(
      this.registerForm.get('location')!.valueChanges.subscribe(() => {
        if (this.selectingLocation) {
          this.selectingLocation = false;
          return;
        }
        this.selectedLocationName = '';
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }

  onLocationInput(value: string) {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    if (!value || value.length < 3) {
      this.locationSuggestions = [];
      return;
    }
    this.debounceTimer = setTimeout(() => this.fetchLocationSuggestions(value), 500);
  }

  private fetchLocationSuggestions(query: string) {
    if (!this.autocompleteService) return;
    this.autocompleteService.getPlacePredictions(
      { input: query },
      (predictions: any[], status: string) => {
        this.ngZone.run(() => {
          this.locationSuggestions = (status === 'OK' && predictions) ? predictions : [];
        });
      }
    );
  }

  selectLocation(prediction: any) {
    this.selectingLocation = true;
    this.selectedLocationName = prediction.description;
    this.registerForm.patchValue({ location: prediction.description });
    this.locationSuggestions = [];
  }

  onSubmit() {
    this.submitted = true;
    if (this.registerForm.invalid) return;

    const location = this.selectedLocationName || this.registerForm.value.location;
    const userData: PetOwnerSchemaPost = {
      numberPhone: this.registerForm.value.numberPhone,
      location
    };

    const user_id: number = this.authService.decodeToken()?.user_id!;
    if (user_id) {
      this.petOwnerService.createPetOwner(user_id, userData).subscribe({
        next: (response: LoginResponse) => navigateTo(response.access_token, this.router, this.authService),
        error: (err: any) => {
          console.error('Error en el registro', err);
          this.registerForm.reset();
        }
      });
    }
  }
}
