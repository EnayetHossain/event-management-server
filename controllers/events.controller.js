require("dotenv").config();
const Event = require("../model/event.model.js");
const CustomError = require("../error/customError.js");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");

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

const updateEvent = async (req, res) => {
  const { eventTitle, eventDescription, eventDate, ticketPrice, totalTickets, eventLocation } = req.body;
  const { id } = req.params;

  const event = await Event.findById(id).exec();
  if (!event) return res.status(404).json({ status: "Failed", error: "Event not found" });

  const update = {};

  if (eventTitle) update.title = eventTitle;
  if (eventDescription) update.description = eventDescription;
  if (eventDate) update.eventDate = eventDate;
  if (ticketPrice) update.ticketPrice = ticketPrice;
  if (totalTickets) update.totalTickets = totalTickets;
  if (eventLocation) update.eventLocation = eventLocation;

  const eventPhotoPath = req.files?.eventPhoto?.[0].path;
  if (eventPhotoPath) {
    const eventPhoto = await uploadOnCloudinary(eventPhotoPath);
    update.eventPhoto = eventPhoto.url;
  }

  const filter = { _id: id };

  const doc = await Event.findOneAndUpdate(filter, update, { new: true }).exec();

  res.status(200).json({ status: "Success", event: doc });
}

const deleteEvent = async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id).exec();
  if (!event) throw new CustomError("Event not Found", 404);

  const result = await Event.deleteOne({ _id: id });
  res.status(200).json({ status: "Success", event: result });
}

const getAllEvents = async (req, res) => {
  const { isActive, isFeatured, title, sort, fields, numericFilters } =
    req.query;

  // filters
  const queryObject = {};
  if (isActive) queryObject.isActive = isActive === "true" ? true : false;
  if (isFeatured) queryObject.isFeatured = isFeatured === "true" ? true : false;
  if (title) queryObject.title = { $regex: title, $options: "i" };

  if (numericFilters) {
    const operatorMap = {
      "<": "$lt",
      "<=": "$lte",
      "=": "$eq",
      ">": "$gt",
      ">=": "$gte",
    };

    const regex = /\b(<|>|<=|>=|=)\b/g;

    let filters = numericFilters.replace(
      regex,
      (match) => `-${operatorMap[match]}-`
    );

    const options = ["ticketPrice", "totalTickets"];

    filters = filters.split(",").forEach((item) => {
      const [field, operator, value] = item.split("-");

      if (options.includes(field)) {
        queryObject[field] = { [operator]: Number(value) };
      }
    });
  }

  // console.log(queryObject);

  let results = Event.find(queryObject); // get all events.

  // sorting
  if (sort) {
    const sortString = sort.split(",").join(" ");
    results.sort(sortString);
  } else {
    results.sort("createdAt");
  }

  // fields
  if (fields) {
    const filedString = fields.split(",").join(" ");
    results.select(filedString);
  }

  // pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  results.skip(skip).limit(limit);

  const events = await results;

  if (!events) throw new CustomError("Event Not Found", 404);

  res
    .status(200)
    .json({ status: "Success", data: events, nbHits: events.length });
};

const getEventByUserId = async (req, res) => {
  const { isActive, isFeatured, title, sort, fields, numericFilters } =
    req.query;
  const userId = req.decoded._id;

  // filters
  const queryObject = {};

  if (userId) queryObject.userId = userId;
  if (isActive) queryObject.isActive = isActive === "true" ? true : false;
  if (isFeatured) queryObject.isFeatured = isFeatured === "true" ? true : false;
  if (title) queryObject.title = { $regex: title, $options: "i" };

  // filter by numeric values
  if (numericFilters) {
    const operatorMap = {
      "<": "$lt",
      "<=": "$lte",
      "=": "$eq",
      ">": "$gt",
      ">=": "$gte",
    };

    const regex = /\b(<|>|<=|>=|=)\b/g;

    let filters = numericFilters.replace(
      regex,
      (match) => `-${operatorMap[match]}-`
    );

    const options = ["ticketPrice", "totalTickets"];
    filters = filters.split(",").forEach((item) => {
      const [field, operator, value] = item.split("-");

      if (options.includes(field)) {
        queryObject[field] = { [operator]: Number(value) };
      }
    });
  }

  // find all data with same user Id
  const result = Event.find(queryObject);

  // sort
  if (sort) {
    const sortString = sort.split(",").join(" ");
    result.sort(sortString);
  } else {
    result.sort("createdAt");
  }

  // document fields
  if (fields) {
    const filedString = fields.split(",").join(" ");
    result.select(filedString);
  }

  // pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  result.skip(skip).limit(limit);

  const event = await result;

  if (!event) throw new CustomError("No event found", 404);

  res
    .status(200)
    .json({ status: "Success", data: event, nbHits: event.length });
};


const getSingleEventById = async (req, res) => {
  const { id } = req.params;
  const { fields } = req.query;

  const result = Event.findById(id);

  if (fields) {
    const fieldList = fields.split(",");
    let fieldString;

    // remove userid field from the response
    if (fieldList.includes("userId")) {
      fieldList.pop("userId");
      fieldString = fieldList.join(" ");
    }

    fieldString = fieldList.join(" ");
    result.select(fieldString);
  } else {
    result.select("-userId")
  }

  const event = await result;
  res.status(200).json({ status: "Success", data: event })
}

module.exports = {
  addEvent,
  updateEvent,
  deleteEvent,
  getAllEvents,
  getEventByUserId,
  getSingleEventById,
};
