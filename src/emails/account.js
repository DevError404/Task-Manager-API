const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY)
sgMail.send( {
    to : 'apoorvagupta1812gwl@gmail.com',
    from : 'apoorvagupta1812gwl@gmail.com',
    subject: 'Hii Apoorva',
    text: 'This is email from taskk app'
})