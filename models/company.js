var mongoose = require('mongoose');
var moment = require('moment'); // For date handling.

var Schema = mongoose.Schema;

var CompnaySchema = new Schema({
    company_name: {type: String, required: true},
    investment_date: { type: Date },
    leadership_page_url: {type: String},
    titanhouse_url: {type: String},
    firm: { type: Schema.ObjectId, ref: 'Firm', required: true },
    titan: { type: Schema.ObjectId, ref: 'Titan', required: true },
    // firm: [{ type: Schema.ObjectId, ref: 'Firm' }]
});

CompnaySchema
    .virtual('investment_date_yyyy_mm_dd')
    .get(function () {
        return moment(this.investment_date).format('MMMM Do YYYY');
    });

// Virtual for this company instance URL.
CompnaySchema
.virtual('url')
.get(function () {
  return '/data/company/'+this._id;
});

// Export model.
module.exports = mongoose.model('Compnay', CompnaySchema);
