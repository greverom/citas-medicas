export const modalInitializer = (): ModalDto => {
    return ({
      show: false,
      message: '',
      isError: false,
      isSuccess: false,
      isConfirm: false,  
      showRedirectButton: false,
      redirect: () => {},
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
    showRedirectButton?: boolean; 
    redirect?: () => void;       
    close: () => void;
    confirm?: () => void;
  }
  