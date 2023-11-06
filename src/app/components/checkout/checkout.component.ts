import { Target } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { Luv2ShopFormService } from 'src/app/services/luv2-shop-form.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})

export class CheckoutComponent implements OnInit {

  checkoutFormGroup!: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];


  constructor(private formBuilder: FormBuilder,
                  private luv2ShopFromService: Luv2ShopFormService ) { }

  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('',[Validators.required,Validators.minLength(2)]),
        lastName: new FormControl('',[Validators.required,Validators.minLength(2)]),
        email: new FormControl('',
        [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),

      shippingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: ['']
      }),

      billingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: ['']
      }),

      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
        expirationMonth: [''],
        expirationYear: ['']
      }),

    });
    // populate credit card months
    const startMonth: number = new Date().getMonth() + 1;
    console.log("Start Month: "+startMonth);
    this.luv2ShopFromService.getCreditCardMonths(startMonth).subscribe(
      data =>{
        console.log("Reterived Credit Card Months: "+JSON.stringify(data));
        this.creditCardMonths = data;

    });

    // populate credit card years
    this.luv2ShopFromService.getCreditCardYears().subscribe(
      data =>{
        console.log("Reterived Credit Card years: "+JSON.stringify(data));
        this.creditCardYears = data;
      });

      // populate countries
      this.luv2ShopFromService.getCountries().subscribe(
         data =>{
          console.log("Reterived Countries: "+JSON.stringify(data));
          this.countries = data;
         }
      );

  }

  onSubmit(){
    console.log("Handling Form submission button");

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
    }


    console.log(this.checkoutFormGroup.get('customer')?.value);
    console.log("The Email address is "+this.checkoutFormGroup.get('customer')?.value.email);
    console.log("The Shipping address country is "+this.checkoutFormGroup.get('shippingAddress')?.value.country.name);
    console.log("The Shipping address state is "+this.checkoutFormGroup.get('shippingAddress')?.value.state.name);
  }

  get firstName(){return this.checkoutFormGroup.controls['customer'].value.firstName;}

  get lastName(){return this.checkoutFormGroup.controls['customer'].value.lastName;}

  get email(){return this.checkoutFormGroup.controls['customer'].value.email;}



  copyShippingAddressToBillingAddress(event:{target:any}){
    if(event.target.checked){
       this.checkoutFormGroup.controls['billingAddress'].setValue(this.checkoutFormGroup.controls['shippingAddress'].value);
      // bug fix for states
      this.billingAddressStates = this.shippingAddressStates;

    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      // bug fix for states
      this.billingAddressStates = [];
     }     

  }

  handleMonthsAndYears(){
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear);

    // if current year equals to selected year, then start with the current month
    let startMonth: number;
    if(currentYear == selectedYear){
      startMonth = new Date().getMonth()+1;
    } else{
      startMonth = 1;
    }
    this.luv2ShopFromService.getCreditCardMonths(startMonth).subscribe(
      data=>{
        console.log("Reterived Credit Card Months: "+JSON.stringify(data));
        this.creditCardMonths = data;
      });
  }

  getStates(formGroupName: string){
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup?.value.country.code;
    const countryName = formGroup?.value.country.name;

    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName}  country Name: ${countryName}`);

    this.luv2ShopFromService.getStates(countryCode).subscribe(
      data => {
        if(formGroupName == 'shippingAddress'){
          this.shippingAddressStates = data;
        } else{
          this.billingAddressStates = data;
        }
        // select first item as selected
         formGroup?.get('state')?.setValue(data[0]);
      });

  }

}
