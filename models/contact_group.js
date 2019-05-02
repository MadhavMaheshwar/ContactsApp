
const mongoose = require('mongoose');

var ContactGroup = mongoose.model('ContactGroup', {
    text: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    completed: {
        type: Boolean,
        default: false,
        required: true
    },
    completedAt: {
        type: Number,
        default: null
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

module.exports = ContactGroup;