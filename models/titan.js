var mongoose = require('mongoose');
var Firm = require('../models/firm');
var Company = require('../models/company');
var moment = require('moment'); // For date handling.
var timestamps = require('mongoose-timestamp');

var Schema = mongoose.Schema;

var TitanSchema = new Schema(
    {
        titan_name: {type: String, required: true, max: 100},
        start_date: { type: Date },
        bloomberg_url: {type: String},
        linkedin_url: {type: String},
        company: { type: Schema.ObjectId, ref: 'Company', required: true },
        freelancer: {type: String, required: true, enum:['Not Assigned', 'Steve Friedman', 'Hector Echavarria'], default:'Not Finished'}

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
  return moment(this.start_date).format('YYYY-MM-DD');
});

TitanSchema.plugin(timestamps);
// Export model.
module.exports = mongoose.model('Titan', TitanSchema);
