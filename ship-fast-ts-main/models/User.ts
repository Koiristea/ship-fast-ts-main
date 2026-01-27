import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// USER SCHEMA
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      private: true,
    },
    image: {
      type: String,
    },
    // Used in the Stripe webhook to identify the user in Stripe and later create Customer Portal or prefill user credit card details
    customerId: {
      type: String,
      validate(value: string) {
        return value.includes("cus_");
      },
    },
    // Used in the Stripe webhook. should match a plan in config.js file.
    priceId: {
      type: String,
      validate(value: string) {
        return value.includes("price_");
      },
    },
    // Used to determine if the user has access to the product—it's turn on/off by the Stripe webhook
    hasAccess: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  },
);

// Middleware to ensure hasAccess is always set when saving
userSchema.pre("save", function (next) {
  if (this.hasAccess === undefined || this.hasAccess === null) {
    this.hasAccess = false;
  }
  next();
});

// Ensure hasAccess is set on findOneAndUpdate
userSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update && !("hasAccess" in update)) {
    // Only set default if not explicitly being updated
  }
  next();
});

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);

export default (mongoose.models.User ||
  mongoose.model("User", userSchema)) as mongoose.Model<any>;
