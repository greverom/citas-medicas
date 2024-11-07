import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgClass, NgIf} from "@angular/common";

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [
    NgClass,
    NgIf
  ],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {
  @Input() showModal: boolean = false;
  @Input() message: string = 'An error occurred'; // Default message
  @Input() isError: boolean = true;  // Flag to determine error or success
  @Input() isSuccess: boolean = false;  // Success flag for success message
  @Input() isConfirm: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>(); 
  @Output() cancel = new EventEmitter<void>(); 
  shake: boolean = false;

  ngOnChanges() {
    if (this.isError && this.showModal) {
      this.shake = true;
      setTimeout(() => {
        this.shake = false;
      }, 500); 
    }
  }
  
  closeModal() {
    this.showModal = false;
    this.close.emit();  // Notify parent component to close the modal
  }

  confirmAction() {
    this.confirm.emit();
    this.closeModal();
  }

  cancelAction() {
    this.cancel.emit();
    this.closeModal();
  }
}
