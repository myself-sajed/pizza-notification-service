import { KafkaOrder, PaymentStatus, CartItem } from "../types/order";
import { Message } from "../types/transport";
import config from "config";

const orderMessageGenerator = (order: KafkaOrder): Message => {
  return {
    to: order.data.customerId.email || order.data.customer.email,
    subject:
      order.event_type === "ORDER_CREATED"
        ? "Round Pizza | Order placed!"
        : "Round Pizza | Order status updated",
    text: generateMailText(order),
    html:
      order.event_type === "ORDER_CREATED"
        ? generateMailHTMLForOrderCreate(order)
        : generateMailHTMLForOrderStatus(order),
  };
};

export default orderMessageGenerator;

const generateMailText = (order: KafkaOrder) => {
  if (
    order.event_type === "ORDER_CREATED" &&
    order.data.paymentStatus === PaymentStatus.PAID
  ) {
    return "Hoooreyyy! Your order was successfully placed, and your payment was successfully processed.";
  }

  if (
    order.event_type === "ORDER_CREATED" &&
    order.data.paymentStatus === PaymentStatus.PENDING
  ) {
    return "Hoooreyyy! Your order was successfully placed.";
  }

  if (order.event_type === "ORDER_STATUS_UPDATED") {
    return `Your order is ${order.data.orderStatus}`;
  }
};

const generateMailHTMLForOrderCreate = (order: KafkaOrder) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Placed Successfully</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f7f7f7;
            color: #333;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #f97316;
        }
        .content {
            line-height: 1.6;
        }
        .order-details {
            margin: 20px 0;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        .order-details p {
            margin: 5px 0;
        }
        .track-order-btn {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            color: #fff;
            background-color: #f97316;
            text-decoration: none;
            border-radius: 5px;
            text-align: center;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Confirmation</h1>
        </div>
        <div class="content">
            <p>Dear Customer,</p>
            <p>Thank you for your purchase! Your order has been successfully processed${order.event_type === "ORDER_CREATED" && order.data.paymentStatus === PaymentStatus.PAID ? " & payment was also successful." : "."} Here are the details of your order:</p>
            <div class="order-details">
                <p><strong>Order ID:</strong> ${order.data._id}</p>
                <p><strong>Ordered Item(s):</strong> ${order.data.cart.map((item: CartItem) => item.name).join(", ")}</p>
                <p><strong>Order Status:</strong> ${order.data.orderStatus}</p>
                <p><strong>Payment Status:</strong> ${order.data.paymentStatus}</p>
                <p><strong>Delivery Address:</strong> ${order.data.address.addressLine},${order.data.address.city} </p>
                <p><strong>Total Amount:</strong> Rs. ${order.data.total}</p>
            </div>
            <a href="${config.get("frontend.clientURI")}/order-tracking-status/${order.data._id}" class="track-order-btn">Track Your Order</a>
        </div>
        <div class="footer">
            <p>If you have any questions, feel free to <a href="mailto:support@roundpizza.com">contact us</a>.</p>
            <p>Thank you for shopping with us!</p>
        </div>
    </div>
</body>
</html>
`;
};

const generateMailHTMLForOrderStatus = (order: KafkaOrder) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Status Update</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f7f7f7;
            color: #333;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #f97316;
        }
        .content {
            line-height: 1.6;
            text-align: center;
        }
        .order-status {
            margin: 20px 0;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        .order-status p {
            font-size: 18px;
            font-weight: bold;
            margin: 10px 0;
        }
        .track-order-btn {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            color: #fff;
            background-color: #f97316;
            text-decoration: none;
            border-radius: 5px;
            text-align: center;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Status Update</h1>
        </div>
        <div class="content">
            <p>Dear Customer,</p>
            <p>Your order status has been updated.</p>
            <div class="order-status">
                <p>Order ID: ${order.data._id}</p>
                <p>Current Status: ${order.data.orderStatus}</p>
            </div>
            <a href="${config.get("frontend.clientURI")}/order-tracking-status/${order.data._id}" class="track-order-btn">Track Your Order</a>
        </div>
        <div class="footer">
            <p>If you have any questions, feel free to <a href="mailto:support@example.com">contact us</a>.</p>
            <p>Thank you for shopping with us!</p>
        </div>
    </div>
</body>
</html>
`;
};
