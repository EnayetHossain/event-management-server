const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title must be provided"],
    },

    description: {
      type: String,
      required: [true, "Description must be provided"],
    },

    eventDate: {
      type: Date,
      required: [true, "Event date is required"],
    },

    ticketPrice: {
      type: Number,
      required: [true, "Ticket price is required"],
    },

    totalTickets: {
      type: Number,
      required: [true, "Total tickets are required"],
    },

    eventLocation: {
      type: String,
      required: [true, "Event location is required"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User id is required"],
    },

    eventPhoto: {
      type: String,
      required: [true, "Event photo is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
