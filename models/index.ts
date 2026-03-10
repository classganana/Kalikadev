/**
 * Mongoose model exports.
 * Import models here; call connectDB() before any DB operations.
 */
export { CartItem, type ICartItem } from "./cart-item";
export { User, type IUser } from "./user";
export { Order, type IOrder, ORDER_STATUS, DELIVERY_PARTNER } from "./order";
export { Product, type IProduct, type ProductType } from "./product";
export {
  BatterySpecification,
  type IBatterySpecification,
} from "./battery-specification";
export {
  ProductVariant,
  type IProductVariant,
} from "./product-variant";
