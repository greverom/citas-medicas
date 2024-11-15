import { Component, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { DetallesMedico, DetallesPaciente, UserDto, UserRole } from '../../models/user.dto';
import { Store } from '@ngrx/store';
import { selectUserData } from '../../store/user.selector';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserDataService } from '../../services/user-data.service';
import { ModalComponent } from '../../components/modal/modal.component';
import { ModalDto, modalInitializer } from '../../components/modal/modal.dto';
import { setUserData } from '../../store/user.action';

@Component({
  selector: 'app-usuario-perfil',
  standalone: true,
  imports: [
      CommonModule,
      ReactiveFormsModule,
      ModalComponent
  ],
  templateUrl: './usuario-perfil.component.html',
  styleUrl: './usuario-perfil.component.css'
})
export class UsuarioPerfilComponent implements OnInit {
  userData$: Observable<UserDto | null>; 
  userData: UserDto | null = null; 
  isAdmin$: Observable<boolean>;
  isMedico$: Observable<boolean>;
  isPaciente$: Observable<boolean>;
  modal: ModalDto = modalInitializer();

  usuarioForm: FormGroup;
  modalAbierto: boolean = false;
  
  constructor(private store: Store, 
              private fb: FormBuilder, 
              private userDataService: UserDataService) {

    this.userData$ = this.store.select(selectUserData);
    
    this.isAdmin$ = this.userData$.pipe(
      map(user => user?.role === UserRole.Admin)
    );
    this.isMedico$ = this.userData$.pipe(
      map(user => user?.role === UserRole.Medico)
    );
    this.isPaciente$ = this.userData$.pipe(
      map(user => user?.role === UserRole.Paciente)
    );

    this.usuarioForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.userData$.subscribe((data) => {
      //console.log('Datos del usuario:', data);
      this.userData = data; 
    });
  }

  isPacienteDetalles(detalles: any): detalles is DetallesPaciente {
    return detalles && 'fechaNacimiento' in detalles && 'direccion' in detalles && 'telefono' in detalles;
  }

  isMedicoDetalles(detalles: any): detalles is DetallesMedico {
    return detalles && 'numeroLicencia' in detalles && 'cedula' in detalles;
  }

  inicializarFormulario(data: UserDto | null): void {
    if (!data) return;

    if (this.isPacienteDetalles(data.detalles)) {
      this.usuarioForm = this.fb.group({
        name: [data.name || '', Validators.required],
        cedula: [data.detalles.cedula || ''],
        fechaNacimiento: [data.detalles.fechaNacimiento || ''],
        direccion: [data.detalles.direccion || ''],
        telefono: [data.detalles.telefono || '']
      });
    } else if (this.isMedicoDetalles(data.detalles)) {
      this.usuarioForm = this.fb.group({
        name: [data.name || '', Validators.required],
        cedula: [data.detalles.cedula || ''],
        numeroLicencia: [data.detalles.numeroLicencia || ''],
        especialidad: [data.detalles.especialidad || '']
      });
    } else if (data.role === UserRole.Admin) {
      this.usuarioForm = this.fb.group({
        name: [data.name || '', Validators.required]
      });
    }
  }

  abrirModal(): void {
    if (this.userData) {
        this.inicializarFormulario(this.userData); 
    }
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  guardarCambios() {
    if (this.usuarioForm.valid) {
      const userId = this.userData?.id;
      const updatedData: Partial<UserDto> = {
        ...this.userData,
        name: this.usuarioForm.value.name,
        detalles: this.userData?.role === 'paciente'
          ? {
              cedula: this.usuarioForm.value.cedula || null,
              direccion: this.usuarioForm.value.direccion || null,
              fechaNacimiento: this.usuarioForm.value.fechaNacimiento || null,
              telefono: this.usuarioForm.value.telefono || null,
            }
          : this.userData?.role === 'medico'
          ? {
              cedula: this.usuarioForm.value.cedula || null,
              numeroLicencia: this.usuarioForm.value.numeroLicencia || null,
              especialidad: this.usuarioForm.value.especialidad || null,
            }
          : undefined, 
      };
      const cleanData = JSON.parse(JSON.stringify(updatedData));
  
      if (userId) {
        this.userDataService.updateUserInDatabase(userId, cleanData).subscribe({
          next: () => {
            this.store.dispatch(setUserData({ data: { ...this.userData, ...updatedData } as UserDto }));
            this.cerrarModal();
            this.showModal(this.createModalParams(false, 'Datos actualizados exitosamente.'));
          },
          error: (error) => {
            console.error('Error al actualizar los datos del usuario:', error);
            this.showModal(this.createModalParams(true, 'Error al actualizar los datos.'));
          }
        });
      }
    }
  }

  showModal(params: ModalDto) {
    this.modal = { ...params };
    setTimeout(() => {
      this.modal.close();
    }, 2000);
  }

  closeModal() {
    this.modal = { ...modalInitializer() };
  }

  createModalParams(isError: boolean, message: string): ModalDto {
    return {
      ...this.modal,
      show: true,
      isError,
      isSuccess: !isError,
      message,
      close: () => this.closeModal(),
    };
  }
  
}
