const axios = require("axios");
const crypto = require("crypto");

const qiClient = axios.create({
  baseURL:
    process.env.QI_BASE_URL || "https://uat-sandbox-3ds-api.qi.iq/api/v1",
  timeout: 20000,
});

const toFixedAmount = (amount) => {
  const numeric = Number(amount || 0);
  return Number.isFinite(numeric) ? numeric.toFixed(3) : "0.000";
};

const getAuthHeader = () => {
  const username = process.env.QI_USERNAME || "";
  const password = process.env.QI_PASSWORD || "";
  const token = Buffer.from(`${username}:${password}`, "utf8").toString(
    "base64"
  );
  return `Basic ${token}`;
};

const buildHeaders = () => ({
  Authorization: getAuthHeader(),
  "X-Terminal-Id": process.env.QI_TERMINAL_ID || "",
  "Content-Type": "application/json",
});

const mapAxiosError = (error) => ({
  message:
    error.response?.data?.error?.description ||
    error.response?.data?.error?.message ||
    error.message,
  status: error.response?.status || 500,
  data: error.response?.data || null,
});

const createPayment = async (payload) => {
  try {
    const response = await qiClient.post("/payment", payload, {
      headers: buildHeaders(),
    });
    return response.data;
  } catch (error) {
    throw mapAxiosError(error);
  }
};

const getPaymentStatus = async (paymentId) => {
  try {
    const response = await qiClient.get(`/payment/${paymentId}/status`, {
      headers: buildHeaders(),
    });
    return response.data;
  } catch (error) {
    throw mapAxiosError(error);
  }
};

const cancelPayment = async (paymentId, payload) => {
  try {
    const response = await qiClient.post(`/payment/${paymentId}/cancel`, payload, {
      headers: buildHeaders(),
    });
    return response.data;
  } catch (error) {
    throw mapAxiosError(error);
  }
};

const refundPayment = async (paymentId, payload) => {
  try {
    const response = await qiClient.post(`/payment/${paymentId}/refund`, payload, {
      headers: buildHeaders(),
    });
    return response.data;
  } catch (error) {
    throw mapAxiosError(error);
  }
};

const verifyWebhookSignature = (payload, signature) => {
  const publicKey = process.env.QI_WEBHOOK_PUBLIC_KEY;
  if (!publicKey || !signature) {
    return false;
  }

  const dataSegments = [
    payload.paymentId || "-",
    payload.amount !== undefined ? toFixedAmount(payload.amount) : "-",
    payload.currency || "-",
    payload.creationDate || "-",
    payload.status || "-",
  ];

  const dataString = dataSegments.join("|");
  const verifier = crypto.createVerify("sha256");
  verifier.update(dataString);
  verifier.end();

  try {
    return verifier.verify(publicKey, Buffer.from(signature, "base64"));
  } catch (error) {
    return false;
  }
};

module.exports = {
  createPayment,
  getPaymentStatus,
  cancelPayment,
  refundPayment,
  verifyWebhookSignature,
};
