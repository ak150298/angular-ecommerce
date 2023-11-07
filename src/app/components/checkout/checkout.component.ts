import { JsonPipe } from '@angular/common';
import { Target } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { Luv2ShopFormService } from 'src/app/services/luv2-shop-form.service';
import { Luv2ShopValidators } from 'src/app/validators/luv2-shop-validators';

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
                  private luv2ShopFromService: Luv2ShopFormService,
                  private cartService: CartService,
                  private checkoutService: CheckoutService,
                  private router: Router) { }

  ngOnInit(): void {
   
    this.reviewCartDetails();

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('',
        [Validators.required,Validators.minLength(2),Luv2ShopValidators.notOnlyWhiteSpace]),
        lastName: new FormControl(''
        ,[Validators.required,Validators.minLength(2),Luv2ShopValidators.notOnlyWhiteSpace]),
        email: new FormControl('',
        [Validators.required, 
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),])
      }),

      shippingAddress: this.formBuilder.group({
        street: new FormControl('',
        [Validators.required,Validators.minLength(2),Luv2ShopValidators.notOnlyWhiteSpace]),
        city: new FormControl('',
        [Validators.required,Validators.minLength(2),Luv2ShopValidators.notOnlyWhiteSpace]),
        state: new FormControl('',Validators.required),
        country: new FormControl('',Validators.required),
        zipCode: new FormControl('',
        [Validators.required,Validators.minLength(2),Luv2ShopValidators.notOnlyWhiteSpace])
      }),

      billingAddress: this.formBuilder.group({
        street: new FormControl('',
        [Validators.required,Validators.minLength(2),Luv2ShopValidators.notOnlyWhiteSpace]),
        city: new FormControl('',
        [Validators.required,Validators.minLength(2),Luv2ShopValidators.notOnlyWhiteSpace]),
        state: new FormControl('',Validators.required),
        country: new FormControl('',Validators.required),
        zipCode: new FormControl('',
        [Validators.required,Validators.minLength(2),Luv2ShopValidators.notOnlyWhiteSpace])
      }),

      creditCard: this.formBuilder.group({
        cardType: new FormControl('',Validators.required),
        nameOnCard: new FormControl('',
        [Validators.required,Validators.minLength(2),Luv2ShopValidators.notOnlyWhiteSpace]),
        cardNumber:new FormControl('',[Validators.required,Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('',[Validators.required,Validators.pattern('[0-9]{3}')]),
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
  reviewCartDetails() {
    // subscribe to cartservice.totalQuantity
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );

    // subscribe to cartService.totalPrice
    this.cartService.totalPrice.subscribe(
     totalPrice => this.totalPrice = totalPrice
    );
  }

  onSubmit(){
    console.log("Handling Form submission button");

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
    //set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    // get cart items
    const cartItems = this.cartService.cartItems;

    //  create OrderItems from cartItems
    let orderItems: OrderItem[] = cartItems.map(tempcartItem=>new OrderItem(tempcartItem));

    // set up purchase
    let purchase = new Purchase();

    // set up purchase-customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;
   
    


    // populate purchase - shipping Address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingSate: State =  JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const ShippingCountry: Country =  JSON.parse(JSON.stringify(purchase.shippingAddress.country));

    purchase.shippingAddress.state = shippingSate.name;
    purchase.shippingAddress.country = ShippingCountry.name;


    // populate purchase - billing Address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State =  JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country =  JSON.parse(JSON.stringify(purchase.billingAddress.country));

    purchase.billingAddress.state = shippingSate.name;
    purchase.billingAddress.country = ShippingCountry.name;

    // populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    // call rest api via checkoutService
    this.checkoutService.placeOrder(purchase)
    .subscribe(
      {
        next: response =>{
          alert(`Your Order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);

          // reset the cart
          this.resetCart();

        },
        error: err =>{
          alert(`There was an error: ${err.message}`);
        }
      }
    );
  }

  get firstName(){return this.checkoutFormGroup.controls['customer'].value.firstName;}

  get lastName(){return this.checkoutFormGroup.controls['customer'].value.lastName;}

  get email(){return this.checkoutFormGroup.controls['customer'].value.email;}

  get shippingAddressStreet(){return this.checkoutFormGroup.controls['shippingAddress'].value.street;}
  get shippingAddressCity(){return this.checkoutFormGroup.controls['shippingAddress'].value.city;}
  get shippingAddressState(){return this.checkoutFormGroup.controls['shippingAddress'].value.state;}
  get shippingAddressCountry(){return this.checkoutFormGroup.controls['shippingAddress'].value.country;}
  get shippingAddressZipCode(){return this.checkoutFormGroup.controls['shippingAddress'].value.zipCode;}

  get BillingAddressStreet(){return this.checkoutFormGroup.controls['billingAddress'].value.street;}
  get BillingAddressCity(){return this.checkoutFormGroup.controls['billingAddress'].value.city;}
  get BillingAddressState(){return this.checkoutFormGroup.controls['billingAddress'].value.state;}
  get BillingAddressCountry(){return this.checkoutFormGroup.controls['billingAddress'].value.country;}
  get BillingAddressZipCode(){return this.checkoutFormGroup.controls['billingAddress'].value.zipCode;}
  

  get creditCardType(){return this.checkoutFormGroup.controls['creditCard'].value.cardType;}
  get creditCardNameOncard(){return this.checkoutFormGroup.controls['creditCard'].value.nameOnCard;}
  get creditCardNumber(){return this.checkoutFormGroup.controls['creditCard'].value.cardNumber;}
  get creditCardSecurityCode(){return this.checkoutFormGroup.controls['creditCard'].value.securityCode;}
  
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

  resetCart() {
    // reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    // reset form data
    this.checkoutFormGroup.reset();

    // navigate back to product page
    this.router.navigateByUrl('/products');

  }

}
