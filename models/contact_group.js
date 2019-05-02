
const mongoose = require('mongoose');
var contact = require('./contact');

var ContactGroup = mongoose.model('ContactGroup', {
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    contacts: [contact.schema]
});

module.exports = ContactGroup;