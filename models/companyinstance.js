var mongoose = require('mongoose');
// var moment = require('moment');

var Schema = mongoose.Schema;

var CompanyInstanceSchema = new Schema({
    company: { type: Schema.ObjectId, ref: 'Company', required: true }, // Reference to the associated company.
    imprint: {type: String, required: true},
    status: {type: String, required: true, enum:['Available', 'Maintenance', 'Loaned', 'Reserved'], default:'Maintenance'},
    // due_back: { type: Date, default: Date.now },
});

// Virtual for this companyinstance object's URL.
CompanyInstanceSchema
.virtual('url')
.get(function () {
  return '/data/companyinstance/'+this._id;
});

//
// CompanyInstanceSchema
// .virtual('due_back_formatted')
// .get(function () {
//   return moment(this.due_back).format('MMMM Do, YYYY');
// });
//
// CompanyInstanceSchema
// .virtual('due_back_yyyy_mm_dd')
// .get(function () {
//   return moment(this.due_back).format('YYYY-MM-DD');
// });


// Export model.
module.exports = mongoose.model('CompanyInstance', CompanyInstanceSchema);
