/**
 * Seed script - Populates MongoDB with battery and apparel products.
 * Run: npm run db:seed
 * Requires MONGODB_URI in .env.local (or .env)
 */
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();
import mongoose from "mongoose";
import { Product } from "../models/product";
import { BatterySpecification } from "../models/battery-specification";
import { ProductVariant } from "../models/product-variant";

const IMG = (seed: string, w = 600, h = 600) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

const SEED_PRODUCTS = [
  {
    name: "Power Cell Pro",
    slug: "power-cell-pro",
    description:
      "High-performance lithium battery for residential and light commercial use. Built with premium cells and integrated BMS.",
    price: 1299,
    category: "battery",
    productType: "battery",
    variant: "lithium",
    images: [IMG("battery-1"), IMG("battery-1a", 800, 800), IMG("battery-1b", 800, 800)],
    stock: 25,
    spec: { voltage: 48, capacity: 100, batteryType: "LiFePO4", warranty: "10 years", connectorType: "MC4" },
  },
  {
    name: "Compact Energy",
    slug: "compact-energy",
    description:
      "Space-saving lithium battery ideal for RVs, boats, and off-grid setups. Lightweight and reliable.",
    price: 599,
    category: "battery",
    productType: "battery",
    variant: "lithium",
    images: [IMG("battery-2"), IMG("battery-2a", 800, 800)],
    stock: 30,
    spec: { voltage: 24, capacity: 50, batteryType: "LiFePO4", warranty: "5 years", connectorType: "Anderson" },
  },
  {
    name: "High Capacity Elite",
    slug: "high-capacity-elite",
    description:
      "Maximum storage for large solar installations and backup power. Enterprise-grade build quality.",
    price: 2499,
    category: "battery",
    productType: "battery",
    variant: "lithium",
    images: [IMG("battery-3"), IMG("battery-3a", 800, 800), IMG("battery-3b", 800, 800), IMG("battery-3c", 800, 800)],
    stock: 10,
    spec: { voltage: 48, capacity: 200, batteryType: "LiFePO4", warranty: "12 years", connectorType: "MC4" },
  },
  {
    name: "Marine Grade",
    slug: "marine-grade",
    description:
      "IP67 rated for harsh marine environments. Corrosion-resistant and built to last.",
    price: 899,
    category: "battery",
    productType: "battery",
    variant: "lithium",
    images: [IMG("battery-4"), IMG("battery-4a", 800, 800)],
    stock: 20,
    spec: { voltage: 12, capacity: 100, batteryType: "LiFePO4", warranty: "5 years", connectorType: "Marine" },
  },
  {
    name: "Solar Storage Unit",
    slug: "solar-storage-unit",
    description:
      "Designed for solar ESS. Includes integrated BMS and communication module.",
    price: 1199,
    category: "battery",
    productType: "battery",
    variant: "lithium",
    images: [IMG("battery-5"), IMG("battery-5a", 800, 800), IMG("battery-5b", 800, 800)],
    stock: 40,
    spec: { voltage: 51.2, capacity: 100, batteryType: "LiFePO4", warranty: "10 years", connectorType: "MC4" },
  },
  {
    name: "Starter Pack",
    slug: "starter-pack",
    description:
      "Entry-level lithium battery. Perfect for small systems and learning projects.",
    price: 249,
    category: "battery",
    productType: "battery",
    variant: "lithium",
    images: [IMG("battery-6")],
    stock: 50,
    spec: { voltage: 12, capacity: 20, batteryType: "LiFePO4", warranty: "3 years", connectorType: "Standard" },
  },
];

const SEED_APPAREL = [
  {
    name: "KD Lithium Premium Tee",
    slug: "kalika-premium-tee",
    description:
      "Premium cotton t-shirt with KD Lithium branding. Perfect for everyday wear. Soft, breathable fabric with a relaxed fit.",
    price: 499,
    category: "apparel",
    productType: "apparel",
    variant: "t-shirt",
    images: [IMG("tee-1"), IMG("tee-1a", 800, 800), IMG("tee-1b", 800, 800)],
    stock: 0,
    variants: [
      { size: "S", color: "Black", price: 499, stock: 15 },
      { size: "S", color: "White", price: 499, stock: 12 },
      { size: "M", color: "Black", price: 499, stock: 20 },
      { size: "M", color: "White", price: 499, stock: 18 },
      { size: "L", color: "Black", price: 499, stock: 14 },
      { size: "L", color: "White", price: 499, stock: 10 },
      { size: "XL", color: "Black", price: 549, stock: 8 },
      { size: "XL", color: "White", price: 549, stock: 6 },
    ],
  },
  {
    name: "KD Lithium Hoodie",
    slug: "kalika-hoodie",
    description:
      "Cozy fleece hoodie with embroidered KD Lithium logo. Ideal for cool evenings and outdoor events. Unisex fit.",
    price: 1199,
    category: "apparel",
    productType: "apparel",
    variant: "hoodie",
    images: [IMG("hoodie-1"), IMG("hoodie-1a", 800, 800)],
    stock: 0,
    variants: [
      { size: "S", color: "Navy", price: 1199, stock: 5 },
      { size: "M", color: "Navy", price: 1199, stock: 8 },
      { size: "L", color: "Navy", price: 1199, stock: 6 },
      { size: "M", color: "Grey", price: 1199, stock: 7 },
      { size: "L", color: "Grey", price: 1199, stock: 4 },
    ],
  },
  {
    name: "KD Lithium Cap",
    slug: "kalika-cap",
    description:
      "Structured cap with KD Lithium logo patch. Adjustable strap for a perfect fit. Ideal for outdoor and casual wear.",
    price: 399,
    category: "apparel",
    productType: "apparel",
    variant: "cap",
    images: [IMG("cap-1"), IMG("cap-1a", 800, 800)],
    stock: 0,
    variants: [
      { size: "One Size", color: "Black", price: 399, stock: 25 },
      { size: "One Size", color: "White", price: 399, stock: 20 },
      { size: "One Size", color: "Navy", price: 399, stock: 15 },
    ],
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI required");
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  await Product.deleteMany({ category: "battery" });
  await BatterySpecification.deleteMany({});
  await Product.deleteMany({ category: "apparel" });
  await ProductVariant.deleteMany({});
  console.log("Cleared existing products and variants");

  for (const item of SEED_PRODUCTS) {
    const { spec, ...productData } = item;
    const product = await Product.create(productData);
    await BatterySpecification.create({
      productId: product._id,
      ...spec,
    });
    console.log(`Created: ${product.name}`);
  }

  for (const item of SEED_APPAREL) {
    const { variants, ...productData } = item;
    const product = await Product.create(productData);
    for (let i = 0; i < variants!.length; i++) {
      const v = variants![i];
      await ProductVariant.create({
        productId: product._id,
        size: v.size,
        color: v.color,
        price: v.price,
        stock: v.stock,
        sku: `APP-${product.slug}-${i + 1}`,
      });
    }
    console.log(`Created: ${product.name} (${variants!.length} variants)`);
  }

  console.log("Seed complete");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
