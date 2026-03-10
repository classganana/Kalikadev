/**
 * Migration: productType (battery|apparel) + variant (lithium, t-shirt, etc.)
 * Run once: npx tsx scripts/migrate-product-type.ts
 *
 * Migrates existing products where productType is "lithium", "t-shirt", etc.
 * to: productType = category (battery|apparel), variant = old productType.
 */
import "dotenv/config";
import mongoose from "mongoose";
import { Product } from "../models";

const VALID_PRODUCT_TYPES = ["battery", "apparel"];

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI required");
    process.exit(1);
  }

  await mongoose.connect(uri);
  const products = await Product.find({}).lean();

  let updated = 0;
  for (const p of products) {
    const pt = String(p.productType || "");
    const cat = String(p.category || "battery");
    if (!VALID_PRODUCT_TYPES.includes(pt)) {
      await mongoose.connection.db
        ?.collection("products")
        .updateOne(
          { _id: p._id },
          {
            $set: {
              productType: cat,
              variant: pt || (cat === "apparel" ? "t-shirt" : "lithium"),
            },
          }
        );
      updated++;
      console.log(`Migrated ${p.slug}: productType=${pt} -> productType=${cat}, variant=${pt}`);
    }
  }

  console.log(`Done. Updated ${updated} products.`);
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
