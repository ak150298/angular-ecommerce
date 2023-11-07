import { CartItem } from "./cart-item";

export class OrderItem {
    imageUrl: String = '';
    unitPrice: number = 0;
    quantity: number = 0;
    productId: number = 0;

    constructor(cartItem : CartItem){
        this.imageUrl = cartItem.imageUrl;
        this.quantity = cartItem.quantity;
        this.unitPrice = cartItem.unitPrice;
        this.productId = cartItem.id;
    }
}
