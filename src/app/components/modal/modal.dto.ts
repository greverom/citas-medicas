export const modalInitializer = (): ModalDto => {
    return ({
      show: false,
      message: '',
      isError: false,
      isSuccess: false,
      isConfirm: false,  
      close: () => {},
      confirm: () => {},
    })
  }
  
  export interface ModalDto {
    show: boolean;
    message: string;
    isError: boolean;
    isSuccess: boolean;
    isConfirm: boolean; 
    close: () => void;
    confirm?: () => void; 
  }
  