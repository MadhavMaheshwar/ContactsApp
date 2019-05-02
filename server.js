
require('./config');

var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var helmet = require('helmet');

const mongoose = require('./db/mongoose');
const { ObjectID } = require('mongodb');

var ContactGroup = require('./models/contact_group');
var Contact = require('./models/contact');

var app = express();

const port = process.env.PORT;

app.use(helmet());

app.use(bodyParser.json());


app.post('/contactGroups', (req, res) => {

    var contactGroup = new ContactGroup({
        text: req.body.text,
        _creator: req.contact._id
    });

    contactGroup.save().then((doc) => {
        res.send({doc});
    }, (err) => {
        res.status(400).send({
            error: err.message
        });
    });

    // console.log(req.body);
    // res.send({response: 'Request Acknowledged!'});
});


app.get('/contactGroups', (req, res) => {
    ContactGroup.find({ _creator: req.contact._id }).then((docs) => {
        res.send({ docs });
    }, (err) => {
        res.status(400).send({
            error: err.message
        });
    });
});

app.get('/contactGroups/:id', (req, res) => {

    if (!ObjectID.isValid(req.params.id))
        return res.status(404).send({});

    ContactGroup.findOne({
        _id: req.params.id,
        _creator: req.contact._id
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


app.delete('/contactGroups/:id', (req, res) => {

    if (!ObjectID.isValid(req.params.id))
        return res.status(404).send({});

    ContactGroup.findOneAndRemove({
        _id: req.params.id,
        _creator: req.contact._id
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


app.patch('/contactGroups/:id', (req, res) => {

    if (!ObjectID.isValid(req.params.id))
        return res.status(404).send({});

    var body = _.pick(req.body, ['text', 'completed']);
    if (_.isNil(body.completed) && _.isNil(body.text))
        return res.status(400).send({ response: 'Data input invalid!' });

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    }

    ContactGroup.findOneAndUpdate({
        _id: req.params.id,
        _creator: req.contact._id
    },{
             $set: body 
            }, {
                 new: true
                 }
    ).then((doc) => {
        if (!doc)
            return res.status(404).send({ response: 'Unable to find ContactGroup!' });

        res.send({ doc });
    }, (err) => {
        res.status(400).send({
            error: err.message
        });
    });
});


app.post('/contacts', (req, res) => {

    var contact = new Contact(_.pick(req.body, ['email', 'password', 'tokens']));

    contact.hashPassword().then(() => {
    return contact.save().then(() => {
            return contact.generateAuthToken();
        });
}).then((token) => {
    // include token in header. create custom header field with x-
    res.header('x-auth', token).send(contact.toJSON());
}).catch((err) => {
    res.status(400).send({
        error: err.message
    });
});   
});



app.delete('/contacts/me/token', (req, res) => {
    
        req.contact.removeTokens(req.token).then(() => {
            res.send({ response: 'Logged Out successfully' });
        }, (err) => {
            res.status(400).send({
                error: err.message
            });
        });
    });

    



app.listen(port, () => {
    console.log(`Server started on port ${port}!`);
});


