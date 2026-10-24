import { ShoppingCartItem } from "./shopping-cart-item.model";

export interface ShoppingCart {
    itemsProduct: ShoppingCartItem[];
    totalItems: number;
    totalPrice: number;
}