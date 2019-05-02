
const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

var ContactSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        required: true,
        minlength: 6,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            trim: true,
            required: true
        },
        token: {
            type: String,
            trim: true,
            required: true
        }
    }]
});



ContactSchema.methods.toJSON = function () {
    var contact = this;
    return _.pick(contact, ['_id', 'email']);
};


var Contact = mongoose.model('Contact', ContactSchema);

module.exports = Contact;
