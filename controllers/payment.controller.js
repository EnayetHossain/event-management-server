const stripe = require("stripe")(process.env.STRIPE_KEY);
const Event = require("../model/event.model.js");
const Payment = require("../model/payment.model.js");
const CustomError = require("../error/customError");


const acceptPayment = async (req, res) => {
  const { id } = req.params;
  const { numberOfTickets } = req.body;
  const userId = req.decoded._id;

  // get the event
  const event = await Event.findById(id).exec();

  // verify if event exists
  if (!event) throw new CustomError("Event not Found", 404);

  // verify if event is active
  if (!event.isActive) throw new CustomError("Event is not available", 400);

  // verify if the desired tickets are avaialable
  if (numberOfTickets > event.totalTickets) throw new CustomError("Not enough tickets available", 400)

  // create a payment session in stripe 
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: event.title
          },
          unit_amount: event.ticketPrice * 100
        },
        quantity: numberOfTickets
      }
    ],
    metadata: {
      userId,
      eventId: id,
      numberOfTickets,
      amountPaid: event.ticketPrice * numberOfTickets,
      currency: "usd"
    }
  });

  // reduce the number of ticktes by the tickts that are already bought
  event.totalTickets -= numberOfTickets;
  await event.save();

  // create payment record
  const paymentRecord = new Payment({
    userId,
    evnetId: id,
    transactionId: session.id,
    isPaid: false,
    paymentGetway: "stripe",
    paymentMethod: "card",
    currency: "usd",
    amountPaid: event.ticketPrice * numberOfTickets,
    numberOfTickets
  });

  // save the payment on the database and send response to frontend
  const result = await paymentRecord.save();

  // verify if the payment record have been saved on the database or not
  if (!result) throw new CustomError("Given data is not valid or invlaid data type ware given", 400);

  res.status(303).redirect(session.url);
}

const verifyPayment = async (req, res) => {
  const { sessionId } = req.params;

  // retrieve the session information from the stripe by session id
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  // verify if the session exists in the stripe
  if (!session) throw new CustomError("Invalid session", 400);

  // verify if the payment has been completed or not
  if (session.payment_status !== "paid") throw new CustomError("Payment not completed", 400);

  // find payment by transaction Id from the database
  const payment = await Payment.findOne({ transactionId: session.id });

  // verify if payment record exits in the database
  if (!payment) throw new CustomError("Payment record not found", 404);

  // get the payment method and update in the database
  const paymentMethod = session.payment_method_types ? session.payment_method_types[0] : "card";
  payment.paymentMethod = paymentMethod;

  // update the paid status in the database and save
  payment.isPaid = true;
  await payment.save();

  res.status(200).json({ status: "Sucess", data: payment });
}

module.exports = {
  acceptPayment,
  verifyPayment
}
