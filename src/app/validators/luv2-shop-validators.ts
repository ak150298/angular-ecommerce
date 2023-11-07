import { FormControl, ValidationErrors } from "@angular/forms";

export class Luv2ShopValidators {

    //whitespace validations
    static notOnlyWhiteSpace(control: FormControl): ValidationErrors{
      
        // check if string has only white spaces
        if((control.value!=null) && (control.value.trim().length === 0)){
            // invalid retun error object
            return {'notOnlyWhiteSpace' : true};
        } else {
            return {};
        }
    }
}
