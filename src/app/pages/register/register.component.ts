import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router} from '@angular/router';
import { ModalComponent } from '../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../components/modal/modal.dto';
import { AuthService } from '../../services/auth.service';
import { RegisterDto } from '../../models/auth.dto';
import { SpinnerService } from '../../services/spinner.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalComponent
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;
  hasPasswordText: boolean = false;
  hasConfirmPasswordText: boolean = false;
  registerForm: FormGroup;
  modal: ModalDto = modalInitializer();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private spinnerService: SpinnerService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: [null, Validators.required]  
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {}

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      this.showModal(this.createModalParams(true, 'El formulario debe ser completado.'));
      return;
    }

    const registerData: RegisterDto = {
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      role: this.registerForm.value.role
    };
    this.spinnerService.show();

    this.authService.register(registerData).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.showModal(this.createModalParams(false, 'El usuario se registró correctamente.'));
        this.registerForm.reset();
        setTimeout(() => {
          if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
            localStorage.removeItem('accessToken');
          }
          this.router.navigate(['/home']);
        }, 2500); 
      },
      error: (error) => {
        this.spinnerService.hide();
        this.showModal(this.createModalParams(true, error.message || 'El usuario no se pudo registrar'));
      }
    });
  }

  showModal(params: ModalDto) {
    this.modal = { ...params };

    setTimeout(() => {
      this.modal.close();  
    }, 2500);
  }

  closeModal = (redirect?: string) => {
    this.modal = { ...modalInitializer() };
    if (redirect) {
      this.router.navigate([`/${redirect}`]);
    }
  }

  createModalParams(isError: boolean, message: string, redirect?: string): ModalDto {
    return {
      ...this.modal,
      show: true,
      isError,
      isSuccess: !isError,
      message,
      close: () => this.closeModal(redirect),
    };
  }

  onPasswordInput(): void {
    const passwordValue = this.registerForm.get('password')?.value || '';
    this.hasPasswordText = passwordValue.length > 0;
  }

  onConfirmPasswordInput(): void {
    const confirmPasswordValue = this.registerForm.get('confirmPassword')?.value || '';
    this.hasConfirmPasswordText = confirmPasswordValue.length > 0;
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }
}