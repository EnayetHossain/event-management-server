require("dotenv").config();
const Event = require("../model/event");
const CustomError = require("../error/customError");
const mongoose = require("mongoose");
const { uploadOnCloudinary } = require("../utils/cloudinary");

// add event
const addEvent = async (req, res) => {
  const {
    title,
    description,
    eventDate,
    ticketPrice,
    totalTickets,
    eventLocation,
  } = req.body;

  if (
    !title ||
    !description ||
    !eventDate ||
    !ticketPrice ||
    !totalTickets ||
    !eventLocation
  ) {
    throw new CustomError("All fields are required", 403);
  }

  const userId = req.decoded._id;

  const eventPhotoPath = req.files?.eventPhoto?.[0].path;
  const eventPhoto = await uploadOnCloudinary(eventPhotoPath);

  try {
    const event = await Event.create({
      title,
      description,
      eventDate,
      ticketPrice,
      totalTickets,
      eventLocation,
      userId,
      eventPhoto: eventPhoto?.url,
    });

    const createdEvent = await Event.findById(event._id);

    res.status(201).json({ status: "Success", event: createdEvent });
  } catch (error) {
    res.status(500).json({ status: "Failed", error });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({}); // get all events.
    res.status(200).json({ status: "Success", data: events });
  } catch (error) {
    res.status(500).json({ status: "Failed", error });
  }
};

const getEventByUserId = async (req, res) => {
  const userId = req.decoded._id;

  try {
    // find all data with same user Id
    const event = await Event.find({ userId });

    if (event.data === null) throw new CustomError("No event found", 404);

    res.status(200).json({ status: "Success", data: event });
  } catch (error) {
    res.status(500).json({ status: "Failed", error });
  }
};

module.exports = {
  addEvent,
  getAllEvents,
  getEventByUserId,
};
