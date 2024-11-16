import { Routes } from '@angular/router';

export const routes: Routes = [
    { 
      path: '', 
      loadComponent: () => import('./pages/home/home.component').then(c => c.HomeComponent), 
      pathMatch: 'full' 
    },
    { 
      path: 'home', 
      loadComponent: () => import('./pages/home/home.component').then(c => c.HomeComponent) 
    },
    { 
      path: 'register', 
      loadComponent: () => import('./pages/register/register.component').then(c => c.RegisterComponent) 
    },
    { 
      path: 'pacientes', 
      loadComponent: () => import('./pages/pacientes-m/pacientes.component').then(c => c.PacientesComponent) 
    },
    { 
      path: 'diagnosticos', 
      loadComponent: () => import('./pages/paciente-diagnostico-m/paciente-diagnostico.component').then(c => c.PacienteDiagnosticoComponent) 
    },
    { 
      path: 'ver-diagnostico', 
      loadComponent: () => import('./components/diagnostico/diagnostico.component').then(c => c.DiagnosticoComponent) 
    },
    { 
      path: 'agenda-medico', 
      loadComponent: () => import('./pages/agenda-medico-m/agenda-medico.component').then(c => c.AgendaMedicoComponent) 
    },
    { 
      path: 'tratamientos', 
      loadComponent: () => import('./pages/tratamientos-medico-m/tratamientos-medico.component').then(c => c.TratamientosMedicoComponent) 
    },
    { 
      path: 'ver-tratamiento', 
      loadComponent: () => import('./pages/ver-tratamiento-m/ver-tratamiento.component').then(c => c.VerTratamientoComponent)
    },
    { 
      path: 'servicios', 
      loadComponent: () => import('./pages/paciente-servicios-p/paciente-servicios.component').then(c => c.PacienteServiciosComponent)
    },
    { 
      path: 'perfil', 
      loadComponent: () => import('./pages/usuario-perfil/usuario-perfil.component').then(c => c.UsuarioPerfilComponent)
    },
];