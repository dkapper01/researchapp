var mongoose = require('mongoose');
var moment = require('moment'); // For date handling.

var Schema = mongoose.Schema;

var TitanSchema = new Schema(
    {
        titan_name: {type: String, required: true, max: 100},
        start_date: { type: Date },
        bloomberg_url: {type: String},
        linkedin_url: {type: String},
    }
  );

// Virtual for this titan instance URL.
TitanSchema
.virtual('url')
.get(function () {
  return '/data/titan/'+this._id
});

TitanSchema
.virtual('start_date_yyyy_mm_dd')
.get(function () {
  return moment(this.start_date).format('MMMM Do YYYY');
});

// Export model.
module.exports = mongoose.model('Titan', TitanSchema);
