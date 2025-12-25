const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true }, // Store image URL
  description: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true },
  contact: { type: String, required: true },
  address: { type: String, required: true },
});

module.exports = mongoose.model("Service", serviceSchema);