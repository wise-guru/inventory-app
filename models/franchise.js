const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FranchiseSchema = new Schema({
  name: { type: String, required: false, minLength: 3, maxLength: 100 },
});

FranchiseSchema.virtual("url").get(function () {
  return `/catalog/franchise/${this._id}`;
});

module.exports = mongoose.model("Franchise", FranchiseSchema);
