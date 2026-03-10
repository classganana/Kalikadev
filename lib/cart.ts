/**
 * Cart data access - server-side operations for logged-in users.
 */
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import {
  BatterySpecification,
  CartItem,
  Product,
  ProductVariant,
} from "@/models";

export interface CartItemWithProduct {
  productId: string;
  variantId?: string | null;
  productSlug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  voltage?: number;
  capacity?: number;
  size?: string;
  color?: string;
  basePath?: string;
}

export async function getCartForUser(
  userId: string
): Promise<CartItemWithProduct[]> {
  await connectDB();

  const items = await CartItem.find({ userId: new mongoose.Types.ObjectId(userId) })
    .populate("productId")
    .lean();

  const productIds = items
    .filter((item) => item.productId && typeof item.productId === "object")
    .map((item) => (item.productId as { _id: mongoose.Types.ObjectId })._id);
  const variantIds = items
    .filter((item) => item.variantId)
    .map((item) => item.variantId as mongoose.Types.ObjectId);

  const [specs, variants] = await Promise.all([
    BatterySpecification.find({ productId: { $in: productIds } }).lean(),
    variantIds.length > 0
      ? ProductVariant.find({ _id: { $in: variantIds } }).lean()
      : [],
  ]);

  const specMap = new Map(specs.map((s) => [s.productId.toString(), s]));
  const variantMap = new Map(variants.map((v) => [v._id.toString(), v]));

  const result: CartItemWithProduct[] = [];
  for (const item of items) {
    if (!item.productId || typeof item.productId !== "object") continue;

    const product = item.productId as unknown as {
      _id: unknown;
      slug: string;
      name: string;
      price: number;
      images: string[];
      category?: string;
      productType?: string;
    };
    const isApparel =
      product.category === "apparel" || product.productType === "apparel";

    let price = product.price;
    let size: string | undefined;
    let color: string | undefined;
    let basePath = "/batteries";

    if (item.variantId && isApparel) {
      const variant = variantMap.get(
        (item.variantId as mongoose.Types.ObjectId).toString()
      );
      if (variant) {
        price = variant.price;
        size = variant.size;
        color = variant.color;
        basePath = "/apparel";
      }
    } else if (isApparel && !item.variantId) {
      continue; // Skip invalid apparel items without variant
    }

    const spec = specMap.get(String(product._id));

    result.push({
      productId: String(product._id),
      variantId: item.variantId ? String(item.variantId) : null,
      productSlug: product.slug,
      name: product.name,
      price,
      image: product.images?.[0] ?? "",
      quantity: item.quantity,
      voltage: spec?.voltage,
      capacity: spec?.capacity,
      size,
      color,
      basePath,
    });
  }

  return result;
}

export async function addToCart(
  userId: string,
  productId: string,
  quantity: number = 1,
  variantId?: string | null
): Promise<void> {
  await connectDB();

  const product = await Product.findById(productId).lean();
  if (!product) throw new Error("Product not found");

  const isApparel =
    product.category === "apparel" || product.productType === "apparel";

  if (isApparel && !variantId) {
    throw new Error("Variant is required for apparel products");
  }
  if (!isApparel && variantId) {
    throw new Error("Variants only apply to apparel products");
  }

  const filter: Record<string, unknown> = {
    userId: new mongoose.Types.ObjectId(userId),
    productId: new mongoose.Types.ObjectId(productId),
    variantId: isApparel ? new mongoose.Types.ObjectId(variantId!) : null,
  };

  if (isApparel && variantId) {
    const variant = await ProductVariant.findOne({
      _id: new mongoose.Types.ObjectId(variantId),
      productId: new mongoose.Types.ObjectId(productId),
    });
    if (!variant) throw new Error("Variant not found");
  }

  await CartItem.findOneAndUpdate(
    filter,
    { $inc: { quantity } },
    { upsert: true }
  );
}

export async function updateCartQuantity(
  userId: string,
  productId: string,
  quantity: number,
  variantId?: string | null
): Promise<void> {
  await connectDB();

  const filter: Record<string, unknown> = {
    userId: new mongoose.Types.ObjectId(userId),
    productId: new mongoose.Types.ObjectId(productId),
    variantId: variantId ? new mongoose.Types.ObjectId(variantId) : null,
  };

  if (quantity < 1) {
    await CartItem.deleteOne(filter);
    return;
  }

  await CartItem.findOneAndUpdate(filter, { quantity });
}

export async function removeFromCart(
  userId: string,
  productId: string,
  variantId?: string | null
): Promise<void> {
  await connectDB();

  const filter: Record<string, unknown> = {
    userId: new mongoose.Types.ObjectId(userId),
    productId: new mongoose.Types.ObjectId(productId),
    variantId: variantId ? new mongoose.Types.ObjectId(variantId) : null,
  };

  await CartItem.deleteOne(filter);
}
