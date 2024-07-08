/**
 * Edit this file to update new property in the database
 *
 */
const mongoose = require("mongoose");
const connectDB = require("./db/connect");
require("dotenv").config();
const Event = require("./model/event"); // Update the path as necessary

// Connect to your MongoDB database
connectDB(process.env.MONGODB_URI);

async function updateEvents() {
  try {
    // Update all events to include the isActive and isFeatured fields with default values
    await Event.updateMany(
      {}, // Match all documents
      {
        $set: {
          isActive: true,
          isFeatured: false,
        },
      }
    );
    console.log("All events updated successfully");
  } catch (error) {
    console.error("Error updating events:", error);
  } finally {
    mongoose.connection.close(); // Close the connection when done
  }
}

updateEvents();
