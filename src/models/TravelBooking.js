const mongoose = require('mongoose');

const travelBookingSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },

    booking_id: {
      type: String,
      required: true,
      unique: true
    },

    train_name: {
      type: String,
      default: ''
    },

    train_number: {
      type: String,
      default: ''
    },

    from_station: {
      type: String,
      default: ''
    },

    to_station: {
      type: String,
      default: ''
    },

    journey_date: {
      type: String,
      default: ''
    },

    departure: {
      type: String,
      default: ''
    },

    arrival: {
      type: String,
      default: ''
    },

    duration: {
      type: String,
      default: ''
    },

    class_type: {
      type: String,
      default: ''
    },

    quota: {
      type: String,
      default: ''
    },

    passengers: {
      type: Number,
      default: 1
    },

    hotel_name: {
      type: String,
      default: ''
    },

    bus_name: {
      type: String,
      default: ''
    },

    city: {
      type: String,
      default: ''
    },

    room_type: {
      type: String,
      default: ''
    },

    check_in: {
      type: String,
      default: ''
    },

    check_out: {
      type: String,
      default: ''
    },
    guests: {
      type: Number,
      default: ''
    },

    amount: {
      type: Number,
      required: true
    },

    travel_type: {
      type: String,
      enum: ['Train', 'Hotel', 'Bus', 'Airplane'],
      default: '',
    },

    booking_status: {
      type: String,
      default: 'Confirmed'
    }
  },
  {
    timestamps: true
  }
)

const TravelBooking = mongoose.model("travel_bookings", travelBookingSchema);
module.exports = TravelBooking;