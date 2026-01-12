import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true })
  bookId: number;

  @Prop({ required: true })
  authorName: string;

  @Prop({ min: 1, max: 5 })
  rating: number;

  @Prop()
  comment: string;

  @Prop({
    required: true,
    type: Date,
    validate: {
      validator: (value: Date) => value <= new Date(),
      message: (props: { value: Date }) =>
        `Birth date cannot be in the future. Provided date: ${props.value}`,
    },
  })
  date: Date;
}

export type ReviewDocument = Review & Document;
export const ReviewSchema = SchemaFactory.createForClass(Review);
