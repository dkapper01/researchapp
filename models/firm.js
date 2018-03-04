var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var FirmSchema = new Schema({
    firm_name: {type: String, required: true, min: 3, max: 100}
});

// Virtual for this firm instance URL.
FirmSchema
.virtual('url')
.get(function () {
  return '/data/firm/'+this._id;
});

// Export model.
module.exports = mongoose.model('Firm', FirmSchema);
