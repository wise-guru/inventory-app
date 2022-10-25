const { DateTime } = require("luxon");
const mongoose = require("mongoose");

const PublisherSchema = mongoose.Schema({
  company_name: { type: String, required: true, maxLength: 100 },
  //   family_name: { type: String, required: true, maxLength: 100 },
  founded_date: { type: Date },
  defunct_date: { type: Date },
});

// Virtual for author's full name
PublisherSchema.virtual("name").get(function () {
  // To avoid errors in cases where an author does not have either a family name or first name
  // We want to make sure we handle the exception by returning an empty string for that case
  let fullname = "";
  if (this.company_name) {
    fullname = `${this.company_name}`;
  }
  if (!this.company_name) {
    fullname = "";
  }
  return fullname;
});

// Virtual for author's URL
PublisherSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/publisher/${this._id}`;
});

PublisherSchema.virtual("founded_date_formatted").get(function () {
  return this.founded_date
    ? DateTime.fromJSDate(this.founded_date).toLocaleString(DateTime.DATE_MED)
    : "";
});

PublisherSchema.virtual("defunct_date_formatted").get(function () {
  return this.defunct_date
    ? DateTime.fromJSDate(this.defunct_date).toLocaleString(DateTime.DATE_MED)
    : !this.defunct_date && this.founded_date
    ? "present"
    : "";
});

// Export model
module.exports = mongoose.model("Publisher", PublisherSchema);
