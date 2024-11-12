import { Directive, forwardRef } from '@angular/core';
import { NG_VALIDATORS, AbstractControl, Validator, ValidatorFn } from '@angular/forms';

export function cedulaEcuatorianaValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const cedula = control.value?.toString();
    if (!cedula) return null; 

    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    const provincia = parseInt(cedula.substring(0, 2), 10);

    if (cedula.length !== 10 || provincia < 0 || provincia > 24) {
      return { 'cedulaEcuatoriana': true };
    }

    let suma = 0;
    for (let i = 0; i < coeficientes.length; i++) {
      let resultado = parseInt(cedula.charAt(i), 10) * coeficientes[i];
      if (resultado >= 10) {
        resultado -= 9;
      }
      suma += resultado;
    }
    const digitoVerificador = (10 - (suma % 10)) % 10;

    if (parseInt(cedula.charAt(9), 10) !== digitoVerificador) {
      return { 'cedulaEcuatoriana': true };
    }

    return null;
  };
}

@Directive({
  standalone: true,  
  selector: '[cedulaEcuatoriana]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => CedulaEcuatorianaValidatorDirective),
      multi: true
    }
  ]
})
export class CedulaEcuatorianaValidatorDirective implements Validator {
  validate(control: AbstractControl): { [key: string]: any } | null {
    return cedulaEcuatorianaValidator()(control);
  }
}