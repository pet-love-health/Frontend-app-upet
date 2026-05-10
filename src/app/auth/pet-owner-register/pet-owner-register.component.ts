import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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
export class PetOwnerRegisterComponent implements OnDestroy {
  registerForm: FormGroup;
  locationSuggestions: any[] = [];
  submitted = false;

  private locationCoordinates = '';
  private selectingLocation = false;
  private locationSearch$ = new Subject<string>();
  private subs = new Subscription();

  constructor(
    private http: HttpClient,
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
    this.subs.add(
      this.locationSearch$.pipe(
        debounceTime(500),
        distinctUntilChanged()
      ).subscribe(query => this.fetchLocationSuggestions(query))
    );

    this.subs.add(
      this.registerForm.get('location')!.valueChanges.subscribe(() => {
        if (this.selectingLocation) {
          this.selectingLocation = false;
          return;
        }
        this.locationCoordinates = '';
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.locationSearch$.complete();
  }

  onLocationInput(value: string) {
    if (value && value.length >= 3) {
      this.locationSearch$.next(value);
    } else {
      this.locationSuggestions = [];
    }
  }

  private fetchLocationSuggestions(query: string) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`;
    this.http.get<any[]>(url).subscribe({
      next: (data) => { this.locationSuggestions = data; },
      error: () => { this.locationSuggestions = []; }
    });
  }

  selectLocation(suggestion: any) {
    this.selectingLocation = true;
    this.locationCoordinates = `${suggestion.lat},${suggestion.lon}`;
    this.registerForm.patchValue({ location: suggestion.display_name });
    this.locationSuggestions = [];
  }

  onSubmit() {
    this.submitted = true;
    if (this.registerForm.invalid) return;

    const location = this.locationCoordinates || this.registerForm.value.location;
    const userData: PetOwnerSchemaPost = {
      numberPhone: this.registerForm.value.numberPhone,
      location
    };

    const user_id: number = this.authService.decodeToken()?.user_id!;
    if (user_id) {
      this.petOwnerService.createPetOwner(user_id, userData).subscribe({
        next: () => this.router.navigate(['/pet-owner/home']),
        error: (err) => {
          console.error('Error en el registro', err);
          this.registerForm.reset();
        }
      });
    }
  }
}
