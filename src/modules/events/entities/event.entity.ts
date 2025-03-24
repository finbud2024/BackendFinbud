import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EventDocument = Event & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
  },
})
export class Event {
  @Prop({ required: true })
  name: string;

  @Prop()
  date?: Date;

  @Prop()
  host?: string;

  @Prop()
  location?: string;

  @Prop()
  price?: string;

  @Prop()
  image?: string;

  @Prop({ type: Number })
  lat?: number;

  @Prop({ type: Number })
  lng?: number;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: undefined
    }
  })
  geoLocation?: { type: string; coordinates: number[] };

  @Prop({ required: true })
  url: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);

// Add database indexes
EventSchema.index({ name: 'text', host: 'text', location: 'text' }, { 
  weights: { name: 10, host: 5, location: 3 },
  name: 'text_search_idx' 
});

// Index for date-based queries (upcoming events, calendar view)
EventSchema.index({ date: 1 }, { name: 'date_idx' });

// Compound index for name + date (used for duplicate detection)
EventSchema.index({ name: 1, date: 1 }, { name: 'name_date_idx' });

// Unique index on URL to prevent scraping duplicates
EventSchema.index({ url: 1 }, { unique: true, name: 'url_idx' });

// Geospatial index for location-based queries
EventSchema.index({ geoLocation: '2dsphere' }, { 
  name: 'geolocation_idx',
  sparse: true // Only index documents where geoLocation exists
});

// Create a virtual property for the MongoDB _id field
EventSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Pre-save middleware to set geoLocation from lat/lng
EventSchema.pre('save', function(next) {
  const event = this as EventDocument;
  
  // If both lat and lng are present, set the geoLocation field
  if (event.lat !== undefined && event.lng !== undefined) {
    event.geoLocation = {
      type: 'Point',
      coordinates: [event.lng, event.lat] // GeoJSON uses [longitude, latitude] order
    };
  } else {
    // If lat or lng is missing, remove the geoLocation field
    event.geoLocation = undefined;
  }
  
  next();
});

// Pre-findOneAndUpdate middleware to update geoLocation
EventSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() as any;
  
  // Only proceed if lat or lng is in the update
  if (update && (update.lat !== undefined || update.lng !== undefined)) {
    // If we're using $set, ensure we have a $set object
    if (!update.$set) {
      update.$set = {};
    }
    
    // For positional updates
    if (update.lat !== undefined && update.lng !== undefined) {
      // Both lat and lng are being updated
      update.$set.geoLocation = {
        type: 'Point',
        coordinates: [update.lng, update.lat]
      };
    } else {
      // Only one coordinate is updated, we need to get the current document
      this.findOne({}).then((doc: EventDocument) => {
        if (!doc) return next();
        
        const currentLat = update.lat !== undefined ? update.lat : doc.lat;
        const currentLng = update.lng !== undefined ? update.lng : doc.lng;
        
        if (currentLat !== undefined && currentLng !== undefined) {
          update.$set.geoLocation = {
            type: 'Point',
            coordinates: [currentLng, currentLat]
          };
        } else {
          // If either is missing after the update, remove geoLocation
          update.$set.geoLocation = undefined;
        }
        next();
      }).catch(err => next(err));
      return; // Prevent next() from being called twice
    }
  }
  
  next();
}); 