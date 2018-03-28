var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: String,
    password: String,
    admin: { type: Boolean, default: false },
    // titan: [{ type: Schema.ObjectId, ref: 'Titan'}]
});

UserSchema.plugin(passportLocalMongoose);

UserSchema
    .virtual('url')
    .get(function () {
        return '/data/user/'+this._id;
    });

module.exports = mongoose.model('User', UserSchema);