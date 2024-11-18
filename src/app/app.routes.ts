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
      loadComponent: () => import('./pages/lista-pacientes-de-medico/pacientes.component').then(c => c.PacientesComponent) 
    },
    { 
      path: 'diagnosticos', 
      loadComponent: () => import('./pages/crear-diagnostico-medico/paciente-diagnostico.component').then(c => c.PacienteDiagnosticoComponent) 
    },
    { 
      path: 'ver-diagnostico', 
      loadComponent: () => import('./pages/ver-diagnostico/diagnostico.component').then(c => c.DiagnosticoComponent) 
    },
    { 
      path: 'agenda-medico', 
      loadComponent: () => import('./pages/calendario-medico/agenda-medico.component').then(c => c.AgendaMedicoComponent) 
    },
    { 
      path: 'tratamientos', 
      loadComponent: () => import('./pages/crear-tratamientos-medico/tratamientos-medico.component').then(c => c.TratamientosMedicoComponent) 
    },
    { 
      path: 'ver-tratamiento', 
      loadComponent: () => import('./pages/ver-tratamiento/ver-tratamiento.component').then(c => c.VerTratamientoComponent)
    },
    { 
      path: 'servicios', 
      loadComponent: () => import('./pages/servicios-paciente/paciente-servicios.component').then(c => c.PacienteServiciosComponent)
    },
    { 
      path: 'perfil', 
      loadComponent: () => import('./pages/usuario-perfil/usuario-perfil.component').then(c => c.UsuarioPerfilComponent)
    },
];