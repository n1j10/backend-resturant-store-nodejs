const crypto = require("crypto");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const asyncHandler = require("../middleware/asyncHandler");
const qiGateway = require("../services/payment/qiGateway");

const mapGatewayStatusToOrder = (status) => {
  switch (status) {
    case "SUCCESS":
      return "paid";
    case "CREATED":
      return "payment_created";
    case "FAILED":
    case "AUTHENTICATION_FAILED":
      return "failed";
    default:
      return "pending";
  }
};

const createPaymentForOrder = asyncHandler(async (req, res) => {
  const { orderId, finishPaymentUrl, notificationUrl, appChannel = false } = req.body;
  if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
    res.status(400);
    throw new Error("Valid orderId is required");
  }
  if (!finishPaymentUrl) {
    res.status(400);
    throw new Error("finishPaymentUrl is required");
  }

  const order = await Order.findById(orderId).populate("user", "name email phone");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const isOwner = order.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Forbidden");
  }

  if (["paid", "preparing", "out_for_delivery", "delivered"].includes(order.status)) {
    res.status(400);
    throw new Error("Order payment has already been processed");
  }

  const requestId = crypto.randomUUID();
  const payload = {
    requestId,
    amount: Number(order.totals.total.toFixed(3)),
    currency: process.env.QI_CURRENCY || "IQD",
    locale: process.env.QI_LOCALE || "en_US",
    finishPaymentUrl,
    notificationUrl: notificationUrl || process.env.QI_NOTIFICATION_URL || "",
    customerInfo: {
      firstName: order.user.name,
      phone: order.user.phone || "",
      email: order.user.email || "",
      accountId: order.user._id.toString(),
    },
    additionalInfo: {
      orderId: order._id.toString(),
    },
    appChannel: Boolean(appChannel),
  };

  try {
    const payment = await qiGateway.createPayment(payload);

    order.status = "payment_created";
    order.payment = {
      provider: "qicard",
      requestId: payment.requestId || requestId,
      paymentId: payment.paymentId || "",
      status: payment.status || "CREATED",
      formUrl: payment.formUrl || "",
      raw: payment,
    };
    await order.save();

    res.json({
      success: true,
      message: "Payment created",
      data: {
        order,
        payment,
      },
    });
  } catch (error) {
    res.status(error.status || 500);
    throw new Error(error.message || "Failed to create payment");
  }
});

const getPaymentStatus = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  if (!paymentId) {
    res.status(400);
    throw new Error("paymentId is required");
  }

  try {
    const paymentStatus = await qiGateway.getPaymentStatus(paymentId);
    const order = await Order.findOne({ "payment.paymentId": paymentId });

    if (order) {
      order.payment.status = paymentStatus.status || order.payment.status;
      order.payment.raw = paymentStatus;
      order.status = mapGatewayStatusToOrder(paymentStatus.status);
      await order.save();
    }

    res.json({
      success: true,
      data: {
        paymentStatus,
        order,
      },
    });
  } catch (error) {
    res.status(error.status || 500);
    throw new Error(error.message || "Failed to fetch payment status");
  }
});

const cancelPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const requestId = req.body.requestId || crypto.randomUUID();
  try {
    const result = await qiGateway.cancelPayment(paymentId, { requestId });
    const order = await Order.findOne({ "payment.paymentId": paymentId });
    if (order) {
      order.status = "cancelled";
      order.payment.status = result.status || order.payment.status;
      order.payment.raw = result;
      await order.save();
    }

    res.json({
      success: true,
      message: "Payment cancelled",
      data: result,
    });
  } catch (error) {
    res.status(error.status || 500);
    throw new Error(error.message || "Failed to cancel payment");
  }
});

const refundPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { amount, message } = req.body;
  if (!amount) {
    res.status(400);
    throw new Error("amount is required");
  }

  const requestId = req.body.requestId || crypto.randomUUID();
  try {
    const result = await qiGateway.refundPayment(paymentId, {
      requestId,
      amount: Number(Number(amount).toFixed(3)),
      message: message || "Refund requested by merchant",
    });

    const order = await Order.findOne({ "payment.paymentId": paymentId });
    if (order) {
      order.status = "refunded";
      order.payment.status = result.status || "REFUNDED";
      order.payment.raw = result;
      await order.save();
    }

    res.json({
      success: true,
      message: "Payment refunded",
      data: result,
    });
  } catch (error) {
    res.status(error.status || 500);
    throw new Error(error.message || "Failed to refund payment");
  }
});

const handlePaymentWebhook = asyncHandler(async (req, res) => {
  const signature = req.get("X-Signature") || req.get("x-signature");
  const shouldVerify = String(process.env.QI_WEBHOOK_VERIFY || "true") === "true";

  if (shouldVerify) {
    const isValid = qiGateway.verifyWebhookSignature(req.body, signature);
    if (!isValid) {
      res.status(401);
      throw new Error("Invalid webhook signature");
    }
  }

  const paymentId = req.body.paymentId;
  const order = await Order.findOne({ "payment.paymentId": paymentId });

  if (order) {
    order.payment.status = req.body.status || order.payment.status;
    order.payment.raw = req.body;
    order.status = mapGatewayStatusToOrder(req.body.status);
    if (req.body.status === "SUCCESS") {
      order.status = "paid";
    }
    await order.save();
  }

  res.json({
    success: true,
    message: "Webhook received",
  });
});

module.exports = {
  createPaymentForOrder,
  getPaymentStatus,
  cancelPayment,
  refundPayment,
  handlePaymentWebhook,
};
