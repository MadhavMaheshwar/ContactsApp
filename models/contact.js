
const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

var ContactSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        minlength: 4,
    },

    email: [{
        tag: {
            type: String,
            trim: true,
            required: true
        },
        id: {
            type: String,
            trim: true,
            required: true,
            minlength: 6,
            validate: {
                validator: validator.isEmail,
                message: '{VALUE} is not a valid email'
            }
        }
    }],
    phone: [{
        tag: {
            type: String,
            trim: true,
            required: true
        },
        number: {
            type: String,
            minlength: 10,
            maxlength: 10,
            trim: true,
            required: true,
            validate: {
                validator: validator.isNumeric,
                message: '{VALUE} is not a valid phone number'
            }
        }
    }]
});



ContactSchema.methods.toJSON = function () {
    var contact = this;
    return _.pick(contact, ['name', 'email', 'phone']);
};


var Contact = mongoose.model('Contact', ContactSchema);

module.exports = Contact;
