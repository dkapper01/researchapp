var mongoose = require('mongoose');
var moment = require('moment'); // For date handling.
var timestamps = require('mongoose-timestamp');


var Schema = mongoose.Schema;

var CompanySchema = new Schema({

    company_name: {type: String, required: true},
    investment_date: { type: Date },
    leadership_page_url: {type: String},
    titanhouse_url: {type: String},
    status: {type: String, required: true, enum:['Finished', 'Not Finished'], default:'Not Finished'},
    titan: [{ type: Schema.ObjectId, ref: 'Titan', required: true }],
    firm: { type: Schema.ObjectId, ref: 'Firm', required: true },
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
    return moment(this.investment_date).format('MMMM Do YYYY');
});


// Export model.
CompanySchema.plugin(timestamps);

module.exports = mongoose.model('Company', CompanySchema);


