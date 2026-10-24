import { Product } from './product.model';

export interface ShoppingCartItem {
    itemProduct: Product;
    quantity: number;
    price: number;
}