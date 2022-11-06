const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const GameSchema = new Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  image: { type: String, data: Buffer, required: false },
  publisher: { type: Schema.Types.ObjectId, ref: "Publisher", required: true },
  genre: [{ type: Schema.Types.ObjectId, ref: "Genre" }],
  franchise: { type: Schema.Types.ObjectId, ref: "Franchise" },
});

// Virtual for book's URL
GameSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/game/${this._id}`;
});

// Export model
module.exports = mongoose.model("Game", GameSchema);
