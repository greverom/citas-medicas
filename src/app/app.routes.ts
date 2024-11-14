
import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { PacientesComponent } from './pages/pacientes/pacientes.component';
import { PacienteDiagnosticoComponent } from './pages/paciente-diagnostico/paciente-diagnostico.component';
import { DiagnosticoComponent } from './components/diagnostico/diagnostico.component';
import { AgendaMedicoComponent } from './pages/agenda-medico/agenda-medico.component';
import { TratamientosMedicoComponent } from './pages/tratamientos-medico/tratamientos-medico.component';
import { VerTratamientoComponent } from './pages/ver-tratamiento/ver-tratamiento.component';

export const routes: Routes = [
    { path: '', component: HomeComponent, pathMatch: 'full' }, 
    { path: 'home', component: HomeComponent }, 
    { path: 'register', component: RegisterComponent },
    { path: 'pacientes', component: PacientesComponent },
    { path: 'diagnosticos', component: PacienteDiagnosticoComponent },
    { path: 'ver-diagnostico', component: DiagnosticoComponent },
    { path: 'agenda-medico', component: AgendaMedicoComponent },
    { path: 'tratamientos', component: TratamientosMedicoComponent },
    { path: 'ver-tratamiento', component: VerTratamientoComponent },
];
