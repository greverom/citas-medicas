import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

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
      loadComponent: () => import('./pages/register/register.component').then(c => c.RegisterComponent),
      canActivate: [authGuard, roleGuard],
      data: { role: 'admin' }, 
    },
    { 
      path: 'pacientes', 
      loadComponent: () => import('./pages/lista-pacientes-de-medico/pacientes.component').then(c => c.PacientesComponent),
      canActivate: [authGuard, roleGuard],
      data: { role: 'medico' }
    },
    { 
      path: 'diagnosticos', 
      loadComponent: () => import('./pages/crear-diagnostico-medico/paciente-diagnostico.component').then(c => c.PacienteDiagnosticoComponent),
      canActivate: [authGuard, roleGuard],
      data: { role: 'medico' } 
    },
    { 
      path: 'ver-diagnostico', 
      loadComponent: () => import('./pages/ver-diagnostico/diagnostico.component').then(c => c.DiagnosticoComponent),
      canActivate: [authGuard, roleGuard],
      data: { role: 'medico' } 
    },
    { 
      path: 'agenda-medico', 
      loadComponent: () => import('./pages/calendario-medico/agenda-medico.component').then(c => c.AgendaMedicoComponent),
      canActivate: [authGuard, roleGuard],
      data: { role: 'medico' } 
    },
    { 
      path: 'tratamientos', 
      loadComponent: () => import('./pages/crear-tratamientos-medico/tratamientos-medico.component').then(c => c.TratamientosMedicoComponent),
      canActivate: [authGuard, roleGuard],
      data: { role: 'medico' } 
    },
    { 
      path: 'ver-tratamiento', 
      loadComponent: () => import('./pages/ver-tratamiento/ver-tratamiento.component').then(c => c.VerTratamientoComponent),
      canActivate: [authGuard, roleGuard],
      data: { role: 'medico' }
    },
    
    { 
      path: 'servicios', 
      loadComponent: () => import('./pages/servicios-paciente/paciente-servicios.component').then(c => c.PacienteServiciosComponent),
      canActivate: [authGuard, roleGuard],
      data: { role: 'paciente' },
      children: [
        {path: 'citas',loadComponent: () => import('./components/pacientes/citas/citas.component').then(c => c.CitasComponent)},
        {path: 'diagnosticos',loadComponent: () => import('./components/pacientes/diagnosticos/diagnosticos.component').then(c => c.DiagnosticosComponent)},
        {path: 'tratamientos',loadComponent: () => import('./components/pacientes/tratamientos/tratamientos.component').then(c => c.TratamientosComponent)},
        {path: '', redirectTo: 'citas',pathMatch: 'full'}
      ]
    },

    { path: 'perfil', 
      loadComponent: () => import('./pages/usuario-perfil/usuario-perfil.component').then(c => c.UsuarioPerfilComponent),
      canActivate: [authGuard]
    },

    { path: 'solicitudes', 
      loadComponent: () => import('./components/medico/solicitud-turno/solicitud-turno.component').then(c => c.SolicitudTurnoComponent),
    },
    {
      path: '**', 
      redirectTo: '/home', 
      pathMatch: 'full'
    }
];