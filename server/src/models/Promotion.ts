import mongoose, { Document, Schema } from 'mongoose';
import { Currency, PromotionStatus } from '../types';

export interface IPromotion extends Document {
  productName: string;
  price: number;
  currency: Currency;
  startDate: Date;
  endDate: Date;
  status: PromotionStatus;
  comment?: string;
  submittedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PromotionSchema = new Schema<IPromotion>(
  {
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [50, 'Product name cannot be more than 50 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    currency: {
      type: Number,
      required: [true, 'Currency is required'],
      enum: {
        values: Object.values(Currency).filter(value => typeof value === 'number'),
        message: 'Invalid currency code',
      },
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function(this: IPromotion, value: Date): boolean {
          return value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: Object.values(PromotionStatus),
        message: 'Status must be pending, rejected, approved, or completed',
      },
      default: PromotionStatus.PENDING,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [255, 'Comment cannot be more than 255 characters'],
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Submitted by user is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
PromotionSchema.index({ productName: 1 });
PromotionSchema.index({ status: 1 });
PromotionSchema.index({ submittedBy: 1 });
PromotionSchema.index({ startDate: 1, endDate: 1 });

// Virtual for checking if promotion is active
PromotionSchema.virtual('isActive').get(function(this: IPromotion) {
  const now = new Date();
  return this.status === PromotionStatus.APPROVED && 
         this.startDate <= now && 
         this.endDate >= now;
});

export default mongoose.model<IPromotion>('Promotion', PromotionSchema);