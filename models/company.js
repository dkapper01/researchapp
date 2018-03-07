var mongoose = require('mongoose');
var moment = require('moment'); // For date handling.

var Schema = mongoose.Schema;

var CompanySchema = new Schema({

    company_name: {type: String, required: true},
    investment_date: { type: Date },
    leadership_page_url: {type: String},
    titanhouse_url: {type: String},
    titan: [{ type: Schema.ObjectId, ref: 'Titan', required: true }],
    firm: { type: Schema.ObjectId, ref: 'Firm', required: true }

});

// Virtual for this company instance URL.
CompanySchema
.virtual('url')
.get(function () {
  return '/data/company/'+this._id;
});

CompanySchema
.virtual('investment_date_yyyy_mm_dd')
.get(function () {
    return moment(this.date_of_death).format('MMM Do YY');
});

// Export model.
module.exports = mongoose.model('Company', CompanySchema);
