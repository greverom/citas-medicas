import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ModalComponent } from '../../components/modal/modal.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalDto, modalInitializer } from '../../components/modal/modal.dto';
import { LoginDto } from '../../models/auth.dto';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ModalComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  passwordVisible: boolean = false;
  modal: ModalDto = modalInitializer();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      this.showModal(this.createModalParams(true, 'El formulario debe ser completado.'));
      return;
    }

    const loginData: LoginDto = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(loginData).subscribe({
      next: (success) => {
        if (success) {
          this.showModal(this.createModalParams(false, 'Inicio de sesión exitoso.', 'home'));
        } else {
          this.showModal(this.createModalParams(true, 'Error en el inicio de sesión. Verifique sus credenciales.'));
        }
      },
      error: (error) => {
        this.showModal(this.createModalParams(true, error.message || 'Error en el inicio de sesión.'));
      }
    });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      control?.markAsDirty();
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
}
