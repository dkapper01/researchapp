var mongoose = require('mongoose');
var Firm = require('../models/firm');
var Company = require('../models/company');
var moment = require('moment'); // For date handling.
var passportLocalMongoose = require('passport-local-mongoose');


var Schema = mongoose.Schema;

var TitanSchema = new Schema(
    {
        titan_name: {type: String, required: true, max: 100},
        start_date: { type: Date },
        bloomberg_url: {type: String},
        linkedin_url: {type: String},
        company: { type: Schema.ObjectId, ref: 'Company', required: true },
        createdAt: {type: Date, default: Date.now() },
        freelancer: {type: String, required: true, enum:['Not Assigned', 'Steve Friedman', 'Hector Echavarria'], default:'Not Assigned'},
        profile_status: {type: String, required: true, enum:['In Progress', 'Invalid', 'Complete'], default: 'In Progress'},
        user: { type: Schema.ObjectId, ref: 'User', required: true },
        publisher: String
    }
  );

// Virtual for this titan instance URL.
TitanSchema
.virtual('url')
.get(function () {
  return '/data/titan/'+this._id
});

TitanSchema
.virtual('created_at_yyyy_mm_dd')
.get(function () {
    return moment(this.createdAt).format('llll')
});

TitanSchema
.virtual('start_date_yyyy_mm_dd')
.get(function () {
  return moment(this.start_date).format('YYYY-MM-DD');
});


module.exports = mongoose.model('Titan', TitanSchema);
