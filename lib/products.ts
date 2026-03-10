/**
 * Product data access - used by API routes and server components.
 * Single source of truth for product queries.
 */
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { BatterySpecification, Product, ProductVariant } from "@/models";

function getVariant(
  p: { productType?: string; variant?: string },
  defaultVal: string
): string {
  if (p.variant) return p.variant;
  if (p.productType === "battery" || p.productType === "apparel") return defaultVal;
  return p.productType ?? defaultVal;
}

/** Format short spec string for product cards (e.g. "48V 100Ah · 5.12 kWh") */
export function formatSpecSummary(spec: {
  voltage: number;
  capacity: number;
}): string {
  const kWh = (spec.voltage * spec.capacity) / 1000;
  return `${spec.voltage}V ${spec.capacity}Ah · ${kWh.toFixed(2)} kWh`;
}

export interface ProductWithSpec {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  productType: string;
  variant: string;
  images: string[];
  stock: number;
  createdAt: Date;
  specification?: {
    voltage: number;
    capacity: number;
    batteryType: string;
    warranty: string;
    connectorType: string;
  };
}

export async function getAllProducts(): Promise<ProductWithSpec[]> {
  await connectDB();

  const products = await Product.find({ category: "battery" })
    .sort({ createdAt: -1 })
    .lean();

  const productIds = products.map((p) => p._id);
  const specs = await BatterySpecification.find({
    productId: { $in: productIds },
  }).lean();

  const specMap = new Map(specs.map((s) => [s.productId.toString(), s]));

  return products.map((p) => {
    const spec = specMap.get(p._id.toString());
    return {
      _id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      category: p.category,
      productType: p.productType,
      variant: getVariant(p, "lithium"),
      images: p.images,
      stock: p.stock ?? 0,
      createdAt: p.createdAt,
      specification: spec
        ? {
            voltage: spec.voltage,
            capacity: spec.capacity,
            batteryType: spec.batteryType,
            warranty: spec.warranty,
            connectorType: spec.connectorType,
          }
        : undefined,
    };
  });
}

export interface ProductBasicWithSpec {
  _id: string;
  slug: string;
  name: string;
  price: number;
  images: string[];
  voltage?: number;
  capacity?: number;
}

export async function getProductsBySlugs(
  slugs: string[]
): Promise<ProductBasicWithSpec[]> {
  if (slugs.length === 0) return [];

  await connectDB();
  const products = await Product.find({ slug: { $in: slugs } }).lean();
  const productIds = products.map((p) => p._id);
  const specs = await BatterySpecification.find({
    productId: { $in: productIds },
  }).lean();
  const specMap = new Map(specs.map((s) => [s.productId.toString(), s]));

  return products.map((p) => {
    const spec = specMap.get(p._id.toString());
    return {
      _id: p._id.toString(),
      slug: p.slug,
      name: p.name,
      price: p.price,
      images: p.images,
      voltage: spec?.voltage,
      capacity: spec?.capacity,
    };
  });
}

export async function getProductBySlug(
  slug: string
): Promise<ProductWithSpec | null> {
  await connectDB();

  const product = await Product.findOne({ slug, category: "battery" }).lean();
  if (!product) return null;

  const spec = await BatterySpecification.findOne({
    productId: product._id,
  }).lean();

  return {
    _id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    category: product.category,
    productType: product.productType,
    variant: getVariant(product, "lithium"),
    images: product.images,
    stock: product.stock ?? 0,
    createdAt: product.createdAt,
    specification: spec
      ? {
          voltage: spec.voltage,
          capacity: spec.capacity,
          batteryType: spec.batteryType,
          warranty: spec.warranty,
          connectorType: spec.connectorType,
        }
      : undefined,
  };
}

/** Apparel products - no battery specs */
export interface ApparelProductBasic {
  _id: string;
  slug: string;
  name: string;
  price: number;
  images: string[];
  variant: string;
}

export async function getApparelProducts(): Promise<ApparelProductBasic[]> {
  await connectDB();
  const products = await Product.find({ category: "apparel" })
    .sort({ createdAt: -1 })
    .lean();
  return products.map((p) => ({
    _id: p._id.toString(),
    slug: p.slug,
    name: p.name,
    price: p.price,
    images: p.images,
    variant: getVariant(p, "t-shirt"),
  }));
}

export async function getApparelProductBySlug(
  slug: string
): Promise<Omit<ProductWithSpec, "specification"> | null> {
  await connectDB();
  const product = await Product.findOne({ slug, category: "apparel" }).lean();
  if (!product) return null;
  return {
    _id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    category: product.category,
    productType: product.productType,
    variant: getVariant(product, "t-shirt"),
    images: product.images,
    stock: product.stock ?? 0,
    createdAt: product.createdAt,
  };
}

export interface ApparelVariantBasic {
  _id: string;
  size: string;
  color: string;
  price: number;
  stock: number;
}

export async function getVariantsByProductId(
  productId: string
): Promise<ApparelVariantBasic[]> {
  await connectDB();
  const variants = await ProductVariant.find({
    productId: new mongoose.Types.ObjectId(productId),
  })
    .sort({ createdAt: 1 })
    .lean();
  return variants.map((v) => ({
    _id: v._id.toString(),
    size: v.size,
    color: v.color,
    price: v.price,
    stock: v.stock ?? 0,
  }));
}
