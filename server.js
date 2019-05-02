
require('./config');

var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var helmet = require('helmet');
const mongoose = require('./db/mongoose');
var validate = require('validate-fields')();

var ContactGroup = require('./models/contact_group');
var Contact = require('./models/contact');

var app = express();

const port = process.env.PORT;

app.use(helmet());

app.use(bodyParser.json());


var contactSchema = {
    name: String,
    email: [{ tag: 'in(work, personal)', id: String }],
    phone: [{ tag: 'in(work, personal)', number: 'numericUint(1000000000,9999999999)' }]
}
var contactGroupSchema = {
    name: String,
    contacts: [{ ...contactSchema }]
}

var validateReq = (req, res, next) => {
    var path = req.path.split('/');
    var schema = {}
    if (path[1].toLowerCase() == 'contactGroups')
        schema = validate.parse(contactGroupSchema);
    else
        schema = validate.parse(contactSchema);

    if (!schema.validate(req.body))
        res.status(400).json({ status: 'Failure', statusmessage: 'Bad Request' });
    else
        next();

}



/**Create Contact Group */
app.post('/contactGroups/:name', validateReq,(req, res) => {

    var contactGroup = new ContactGroup({
        name: req.params.name,
        contacts: req.body.contacts
    });

    contactGroup.save().then((doc) => {
        res.send({ doc });
    }, (err) => {
        res.status(400).send({
            error: err.message
        });
    });

});

/**List Contact Group Names */
app.get('/contactGroups', (req, res) => {
    ContactGroup.find().then((docs) => {
        var pdocs = [];
        docs.forEach(element => {
            pdocs.push(_.pick(element, ['name']))
        });
        res.send({ docs: pdocs });
    }, (err) => {
        res.status(400).send({
            error: err.message
        });
    });
});

/**Show Contact Group 
 * 
 * specify parameters in url
*/
app.get('/contactGroups/:name', (req, res) => {

    ContactGroup.findOne({
        name: new RegExp(req.params.name, 'i')
    }).then((doc) => {
        if (!doc)
            return res.status(404).send({ response: 'Unable to find ContactGroup!' });
        res.send({ doc });
    }, (err) => {
        res.status(400).send({
            error: err.message
        });
    });
});

/**Delete Contact Group 
 * 
 * specify parameters in url
*/
app.delete('/contactGroups/:id', (req, res) => {

    ContactGroup.findOneAndRemove({
        name: req.params.name
    }).then((doc) => {
        if (!doc)
            return res.status(404).send({ response: 'Unable to find ContactGroup!' });
        res.send({ statusMessage: 'Deleted Successfully' });
    }, (err) => {
        res.status(400).send({
            error: err.message
        });
    });
});


/**Create Contacts */
app.post('/contact', validateReq, (req, res) => {

    var contact = new Contact(_.pick(req.body, ['name', 'email', 'phone']));

    contact.save().then(() => {
        // include token in header. create custom header field with x-
        res.status(200).send(contact.toJSON());
    }).catch((err) => {
        res.status(400).send({
            error: err.message
        });
    });
});


/**Show Contacts Based on Name, Email or Phone Or List All Contacts 
 * 
 * USE QUERY STRINGS AS PARAMETERS (name, email, phone)
*/
app.get('/contacts', (req, res) => {

    var conditions = {
    };
    if(req.query.name)
        conditions['name'] = new RegExp(req.query.name, 'i')
        if(req.query.email)
        conditions['email'] = { $elemMatch : {id:new RegExp(req.query.email, 'i')}}
        if(req.query.phone)
        conditions['phone'] = { $elemMatch : {number:new RegExp(req.query.phone, 'i')}}



    Contact.find(conditions).then((docs) => {
        res.send({ docs });
    }, (err) => {
        res.status(400).send({
            error: err.message
        });
    });
});


/**Delete Contact 
 * 
 * specify parameters in url
*/
app.delete('/contacts/:name', (req, res) => {

    Contact.findOneAndRemove({
        name: req.params.name
    }).then(() => {
        res.send({ statusMessage: 'Deleted successfully' });
    }, (err) => {
        res.status(400).send({
            error: err.message
        });
    });
});




/**Express Server Listen */
app.listen(port, () => {
    console.log(`Server started on port ${port}!`);
});