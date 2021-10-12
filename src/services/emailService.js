require('dotenv').config();
import nodemailer from 'nodemailer';


let sendSimpleEmail = async(dataSend) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_APP, // generated ethereal user
            pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"XuanHoang 👻" <xuanhoang997@gmail.com>', // sender address
        to: dataSend.receiverEmail, // list of receivers
        subject: "Thông tin đặt lịch khám bệnh", // Subject line
        html: getBodyHTMLEmail(dataSend),
    });
}

let getBodyHTMLEmail = (dataSend) => {
    let result = ''
    if (dataSend.language === 'vi') {
        result = `
        <h3>Xin chào ${dataSend.patientName}! </h3>
        <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên Bookingcare</p>
        <p>Thông tin đăt lịch khám bệnh:</p>
        <div><b>Thời gian: ${dataSend.time}</b></div>
        <div><b>Bác sĩ: ${dataSend.doctorName}</b></div>

        <p>Nếu các thông tin trên là đúng sự thật, vui lòng click vào đường link bên dưới để xác nhận và hoàn tất thủ tục đặt lịch khám bệnh.</p>
        <div><a href =${dataSend.redirectLink} target ="_blank">Click here</a></div>

        <div>Xin chân thành cảm ơn</div>
    `
    }

    if (dataSend.language === "en") {
        result = `
        <h3>Xin chào ${dataSend.patientName}! </h3>
        <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên Bookingcare</p>
        <p>Thông tin đăt lịch khám bệnh:</p>
        <div><b>Thời gian: ${dataSend.time}</b></div>
        <div><b>Bác sĩ: ${dataSend.doctorName}</b></div>

        <p>Nếu các thông tin trên là đúng sự thật, vui lòng click vào đường link bên dưới để xác nhận và hoàn tất thủ tục đặt lịch khám bệnh.</p>
        <div><a href =${dataSend.redirectLink} target ="_blank">Click here</a></div>

        <div>Xin chân thành cảm ơn</div>
    `
    }

    return result;
}


module.exports = {
    sendSimpleEmail: sendSimpleEmail
}