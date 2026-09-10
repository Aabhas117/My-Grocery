import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe";
import User from "../models/User.js";

//place order cod : /api/order/cod

export const placeOrderCOD = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, address } = req.body;
    if (!address || !items || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }
    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (product) {
        amount += product.offerPrice * item.quantity;
      }
    }

    amount += Math.floor(amount * 0.02);

    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD",
    });

    return res.json({ success: true, message: "Order Placed Successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//place order stripe : /api/order/stripe

export const placeOrderStripe = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, address } = req.body;

    const { origin } = req.headers;

    if (!address || !items || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    let productData = [];
    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (product) {
        productData.push({
          name: product.name,
          price: product.offerPrice,
          quantity: item.quantity,
        });
        amount += product.offerPrice * item.quantity;
      }
    }

    amount += Math.floor(amount * 0.02);

    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
    });

    //stripe gateway initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    //create line items for stripe
    const line_items = productData.map((item) => {
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 1.02 * 100),
        },

        quantity: item.quantity,
      };
    });
    //create session

    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    return res.json({ success: true, url: session.url });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const stripeWebhook = async (request, response) => {
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      let orderId = paymentIntent.metadata?.orderId;
      let userId = paymentIntent.metadata?.userId;

      if (!orderId || !userId) {
        const sessions = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntent.id,
        });

        if (sessions.data && sessions.data.length > 0 && sessions.data[0].metadata) {
          orderId = orderId || sessions.data[0].metadata.orderId;
          userId = userId || sessions.data[0].metadata.userId;
        }
      }

      if (!orderId) {
        console.warn(`[Stripe Webhook] Warning: Could not find orderId for payment_intent ${paymentIntent.id}`);
        break;
      }

      await Order.findByIdAndUpdate(orderId, {
        isPaid: true,
      });

      if (userId) {
        await User.findByIdAndUpdate(userId, {
          cartItems: {},
        });
      }

      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      let orderId = paymentIntent.metadata?.orderId;

      if (!orderId) {
        const sessions = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntent.id,
        });

        if (sessions.data && sessions.data.length > 0 && sessions.data[0].metadata) {
          orderId = sessions.data[0].metadata.orderId;
        }
      }

      if (!orderId) {
        console.warn(`[Stripe Webhook] Warning: Could not find orderId for failed payment_intent ${paymentIntent.id}`);
        break;
      }

      await Order.findByIdAndDelete(orderId);

      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  response.json({
    received: true,
  });
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await Order.find({ userId })
      .populate("items.product")
      .populate("address")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

//get all orders (for seller/admin) : /api/order/seller
// export const getAllOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({
//       $or: [
//         { paymentType: "COD" },
//         { isPaid: true },
//       ],
//     })
//       .populate("items.product address")
//       .sort({ createdAt: -1 });

//     return res.json({
//       success: true,
//       orders,
//     });
//   } catch (error) {
//     return res.json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.product")
      .populate("address")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
