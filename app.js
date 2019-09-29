const express = require('express');
const logger = require('morgan');
const helper = require('sendgrid').mail;
const sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
const cors = require('cors');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  if (req.get('x-api-secret') === process.env.API_SECRET) {
    return next();
  }
  return res.status(401).end();
});

app.post('/', (req, res) => {
  const from_email = new helper.Email('noreply@to.do');
  const to_email = new helper.Email(req.body.email);
  const subject = `TODO: ${req.body.message.substring(0, 50)}...`;
  const content = new helper.Content('text/plain', req.body.message);
  const mail = new helper.Mail(from_email, subject, to_email, content);

  const request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON()
  });

  sg.API(request, function(error, response) {
    if (error) {
      console.error(error);
      return res.status(error.response.statusCode).send(error.message);
    }
    return res.status(response.statusCode).end();
  });
});

module.exports = app;
