var mongoose = require('mongoose');
var moment = require('moment'); // For date handling.

var Schema = mongoose.Schema;

var TitanSchema = new Schema(
    {
    titan_name: {type: String, required: true, max: 100},
    start_date: { type: Date },
    bloomberg_url: {type: String},
    linkedin_url: {type: String}
    }
  );

// Virtual for titan "full" name.
// TitanSchema
// .virtual('name')
// .get(function () {
//   return this.bloomberg_url +', '+this.titan_name;
// });

// Virtual for this titan instance URL.
TitanSchema
.virtual('url')
.get(function () {
  return '/data/titan/'+this._id
});

TitanSchema
// .virtual('lifespan')
// .get(function () {
//   var lifetime_string='';
//   if (this.start_date) {
//       lifetime_string=moment(this.start_date).format('MMMM Do, YYYY');
//       }
//   lifetime_string+=' - ';
//   if (this.date_of_death) {
//       lifetime_string+=moment(this.date_of_death).format('MMMM Do, YYYY');
//       }
//   return lifetime_string
// });

TitanSchema
.virtual('start_date_yyyy_mm_dd')
.get(function () {
  return moment(this.start_date).format('MMMM Do YYYY');
});

// TitanSchema
// .virtual('date_of_death_yyyy_mm_dd')
// .get(function () {
//   return moment(this.date_of_death).format('YYYY-MM-DD');
// });

// Export model.
module.exports = mongoose.model('Titan', TitanSchema);
