var mongoose = require('mongoose');
var Firm = require('../models/firm');
var Company = require('../models/company');
var moment = require('moment'); // For date handling.


var Schema = mongoose.Schema;

var FirmSchema = new Schema({
    createdAt: { type: Date, default: Date.now() },
    firm_name: {type: String, required: true, min: 3, max: 100},
    company: [{ type: Schema.ObjectId, ref: 'Company', required: true }],
    status: { type: String, enum:['Finished', 'Not Finished'], default:'Not Finished' }
});


// Virtual for this firm instance URL.
FirmSchema
.virtual('url')
.get(function () {
  return '/data/firm/'+this._id;
});


FirmSchema
.virtual('created_at_yyyy_mm_dd')
.get(function () {
    return moment(this.createdAt).format('l')
});

module.exports = mongoose.model('Firm', FirmSchema);

