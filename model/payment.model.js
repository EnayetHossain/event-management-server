const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User id is required"],
  },

  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: [true, "eventId is required"]
  },

  isPaid: {
    type: Boolean,
    default: false,
    required: [true, "Is paid is requried"]
  },

  transactionId: {
    type: String,
    required: [true, "transactionId is required"]
  },

  paymentGetway: {
    type: String,
    required: [true, "paymentMethod is required"],
    enum: ["stripe", "sslcommerz"]
  },

  paymentMethod: {
    type: String,
    required: [true, "paymentMethod is required"]
  },

  currency: {
    type: String,
    required: [true, "currency is required"],
    enum: ["usd", "bdt"]
  },

  amountPaid: {
    type: Number,
    default: 0,
    required: [true, "amountPaid is required"]
  },

  numberOfTickets: {
    type: Number,
    required: [true, "numberOfTickets is required"]
  }
}, { timestamps: true });


module.exports = mongoose.model("Payment", paymentSchema);
