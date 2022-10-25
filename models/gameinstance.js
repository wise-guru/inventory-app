// const { DateTime } = require("luxon");

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const GameInstanceSchema = new Schema({
  game: { type: Schema.Types.ObjectId, ref: "Game", required: true }, // reference to the associated game
  //   imprint: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["Available", "Sold", "Layaway"],
    default: "Available",
  },
  //   due_back: { type: Date, default: Date.now },
});

// Virtual for bookinstance's URL
GameInstanceSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/gameinstance/${this._id}`;
});

// GameInstanceSchema.virtual("due_back_formatted").get(function () {
//   return this.due_back
//     ? DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_MED)
//     : "";
// });

// Export model
module.exports = mongoose.model("GameInstance", GameInstanceSchema);
