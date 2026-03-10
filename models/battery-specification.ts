import mongoose, { Schema, Model } from "mongoose";

export interface IBatterySpecification {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  voltage: number;
  capacity: number;
  batteryType: string;
  warranty: string;
  connectorType: string;
}

const BatterySpecificationSchema = new Schema<IBatterySpecification>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
    },
    voltage: {
      type: Number,
      required: [true, "Voltage is required"],
      min: [0, "Voltage cannot be negative"],
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [0, "Capacity cannot be negative"],
    },
    batteryType: {
      type: String,
      required: [true, "Battery type is required"],
      trim: true,
    },
    warranty: {
      type: String,
      required: [true, "Warranty is required"],
      trim: true,
    },
    connectorType: {
      type: String,
      required: [true, "Connector type is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

BatterySpecificationSchema.index({ productId: 1 }, { unique: true });

export const BatterySpecification: Model<IBatterySpecification> =
  mongoose.models.BatterySpecification ??
  mongoose.model<IBatterySpecification>(
    "BatterySpecification",
    BatterySpecificationSchema
  );
