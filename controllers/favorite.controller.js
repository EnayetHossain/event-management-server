const CustomError = require("../error/customError");
const Favorite = require("../model/favorite.model.js");
const Event = require("../model/event.model.js");
const mongoose = require("mongoose");

// create or delete a favorite event
const addToFavorite = async (req, res) => {
  const { id } = req.params;
  let userId = req.decoded._id;

  if (!id) {
    throw new CustomError("Event Id is required", 403);
  }

  // convert string ids to ObjectId id
  const eventObjectId = new mongoose.Types.ObjectId(id);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // user cannot add his own event to favorite
  const isSameUser = await Event.findOne({ _id: id, userId });
  if (isSameUser) throw new CustomError("You can not add your own evnet to favorite", 403);

  const existingFavorite = await Favorite.findOne({ eventId: eventObjectId, userId: userObjectId });

  if (existingFavorite) {
    const removed = await Favorite.deleteOne({ _id: existingFavorite._id });
    return res.status(200).json({ status: "success", data: removed })
  }

  const result = await Favorite.create({ eventId: eventObjectId, userId: userObjectId });

  return res.status(201).json({ status: "success", data: result })
}

/// get all favorite events
const getFavorites = async (req, res) => {
  const userId = req.decoded._id;

  const { fields, sort } = req.query;

  // selective fields
  //NOTE: populate is like joins in SQL
  let result = Favorite.find({ userId }).populate({ path: "eventId", select: fields ? fields.split(",").join(" ") : "" });

  // sorting
  if (sort) {
    const sortBy = sort.split(",").join(" ");
    result = result.sort(sortBy);
  } else {
    result = result.sort("createdAt");
  }

  // pagiantion
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  finalResult = await result;

  if (!finalResult) {
    throw CustomError("Event not found", 404);
  }

  const events = finalResult.map(fav => fav.eventId);
  return res.status(200).json({ status: "success", data: events });
}

// get single favorite event my user id and event id
const getFavoritesByEventIdAndUserId = async (req, res) => {
  const { id } = req.params;
  const userId = req.decoded._id;

  if (!id) {
    throw new CustomError("Event Id is required", 403);
  }

  const result = await Favorite.findOne({ eventId: id, userId });

  if (!result) {
    throw new CustomError("Event doesn't exists", 404);
  }

  return res.status(200).json({ status: "success", data: result });
}

module.exports = {
  addToFavorite,
  getFavorites,
  getFavoritesByEventIdAndUserId
}
