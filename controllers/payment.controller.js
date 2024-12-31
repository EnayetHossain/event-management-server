const stripe = require("stripe")(process.env.STRIPE_KEY);
const SSLCommerzPayment = require("sslcommerz-lts");
const Event = require("../model/event.model.js");
const Payment = require("../model/payment.model.js");
const CustomError = require("../error/customError");
const { ObjectId } = require("mongodb");
const axios = require("axios");
const PDFDocument = require('pdfkit');

// accept stripe payments
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
    success_url: "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}&gateway=stripe",
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
    eventId: id,
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

  res.status(200).json({ url: session.url });
}

// verify stripe payments
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

  res.status(200).json({ status: "Success", data: payment });
}

const acceptPaymentWithSSL = async (req, res) => {
  const { id } = req.params;
  const { numberOfTickets } = req.body;
  const userId = req.decoded._id;

  // ssl commerz credentials
  const store_id = process.env.STORE_ID;
  const store_passwd = process.env.STORE_PASSWORD;
  const is_live = false //true for live, false for sandbox


  // find evnet by id from database
  const event = await Event.findById(id).exec();

  // check if the event exists in the database
  if (!event) throw new CustomError("Event not found", 404);

  // check if event is active
  if (!event.isActive) throw new CustomError("Event is not available", 400);

  // check if evnet has enough tickets or not
  if (numberOfTickets > event.totalTickets) throw new CustomError("Not enough tickets available", 400)

  // generate transaction id
  const transactionId = new ObjectId().toString();

  const data = {
    total_amount: event.ticketPrice * numberOfTickets,
    currency: 'BDT',
    tran_id: transactionId, // use unique tran_id for each api call
    success_url: `http://localhost:5000/api/v1/payment/ssl-success`,
    fail_url: 'http://localhost:3000/fail',
    cancel_url: 'http://localhost:3000/cancel',
    ipn_url: 'http://localhost:3000/ipn',
    shipping_method: 'Courier',
    product_name: event.title,
    product_category: 'Electronic',
    product_profile: 'general',
    cus_name: 'Customer Name',
    cus_email: 'customer@example.com',
    cus_add1: 'Dhaka',
    cus_add2: 'Dhaka',
    cus_city: 'Dhaka',
    cus_state: 'Dhaka',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone: '01711111111',
    cus_fax: '01711111111',
    ship_name: 'Customer Name',
    ship_add1: 'Dhaka',
    ship_add2: 'Dhaka',
    ship_city: 'Dhaka',
    ship_state: 'Dhaka',
    ship_postcode: 1000,
    ship_country: 'Bangladesh',
  };

  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
  sslcz.init(data).then(apiResponse => {
    // Redirect the user to payment gateway
    let GatewayPageURL = apiResponse.GatewayPageURL

    // create payment record
    const paymentData = {
      userId,
      eventId: id,
      isPaid: false,
      transactionId: transactionId,
      paymentGetway: "sslcommerz",
      paymentMethod: "unknown",
      currency: "bdt",
      amountPaid: event.ticketPrice * numberOfTickets,
      numberOfTickets
    }

    // save payment data
    Payment.create(paymentData);

    //res.status(303).json({ urL: GatewayPageURL });
    res.status(200).json({ url: GatewayPageURL, tranId: transactionId })
  });
}

const sslSuccessHandler = async (req, res) => {
  const { val_id } = req.body;

  if (!val_id) {
    return res.status(400).json({ error: "Invalid request: val_id is required" });
  }

  try {
    const validationURL = "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php";
    const response = await axios.get(validationURL, {
      params: {
        val_id,
        store_id: process.env.STORE_ID,
        store_passwd: process.env.STORE_PASSWORD,
      },
    });

    const { status, tran_id, payment_type } = response.data;

    if (status === "VALID") {
      const payment = await Payment.findOne({ transactionId: tran_id });
      if (payment) {
        payment.isPaid = true;
        payment.paymentMethod = payment_type || "unknown";
        await payment.save();
      } else {
        return res.status(404).json({ error: "Payment not found" });
      }

      // Redirect to frontend success page
      return res.redirect(`http://localhost:3000/success?session_id=${tran_id}`);
    }

    res.redirect(`http://localhost:3000/fail`);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

const verifySSLPayment = async (req, res) => {
  const { transactionId } = req.params;

  const store_id = process.env.STORE_ID;
  const store_passwd = process.env.STORE_PASSWD;


  // get payment by transaction id
  const payment = await Payment.findOne({ transactionId });

  // check if paymnet record exists or not 
  if (!payment) throw new CustomError("Payment record not found");

  try {
    // get transaction data
    const validationURL = "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php";
    const response = await axios.get(validationURL, {
      params: {
        val_id: transactionId,
        store_id,
        store_passwd,
      }
    });

    // transaction information
    const { status, tran_id, payment_type } = response.data;
    console.log(response.data);

    // check if payment status is valid
    if (status !== "VALID") throw new CustomError("Payment verification failed", 400);

    // check if transaction id matches
    if (tran_id !== transactionId) throw new CustomError("Transaction Id not matched", 400);

    // update payment status
    payment.isPaid = true;
    payment.paymentMethod = payment_type || "unknown";

    res.status(200).json({ status: "Success", data: payment });
  } catch (error) {
    res.status(500).json({ error: "unable to fetch payment information" });
  }
}

const generateTicketPDF = async (req, res) => {
  const { sessionId } = req.params;
  console.warn("Session ID:", sessionId);

  try {
    const payment = await Payment.findOne({ transactionId: sessionId });

    if (!payment || !payment.isPaid) {
      throw new CustomError("Payment not found or invalid transaction ID", 400);
    }

    const event = await Event.findById(payment.eventId);

    if (!event) {
      throw new CustomError("Event not found", 404);
    }

    const pdfDoc = new PDFDocument();
    const filename = `tickets-${sessionId}.pdf`;

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");

    pdfDoc.pipe(res);

    pdfDoc.fontSize(24).text(`Ticket for ${event.title}`, { align: "center" });
    pdfDoc.moveDown();

    for (let i = 1; i <= payment.numberOfTickets; i++) {
      pdfDoc.fontSize(18).text(`Ticket #${i}`);
      pdfDoc.fontSize(14).text(`Event: ${event.title}`);
      pdfDoc.text(`Date: ${event.eventDate}`);
      pdfDoc.text(`Location: ${event.eventLocation}`);
      pdfDoc.text(`Transaction ID: ${sessionId}`);
      pdfDoc.text(`Price: ${event.ticketPrice}`);
      pdfDoc.addPage();
    }

    console.log("PDF ready")
    pdfDoc.end();
  } catch (error) {
    console.error("Error generating ticket PDF:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  acceptPayment,
  verifyPayment,
  acceptPaymentWithSSL,
  verifySSLPayment,
  sslSuccessHandler,
  generateTicketPDF
}
