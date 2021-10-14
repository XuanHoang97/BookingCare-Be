import db from "../models/index";
require('dotenv').config();
import emailService from './emailService';
import { v4 as uuid4 } from 'uuid';

//get token
let buildUrlEmail = (doctorId, token) => {
    let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`

    return result;
}


// booking schedule clinic
let postBookAppointment = (data) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!data.email || !data.doctorId || !data.timeType ||
                !data.date || !data.fullName || !data.selectedGender || !data.address) {

                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                let token = uuid4();

                //send email
                await emailService.sendSimpleEmail({
                    receiverEmail: data.email,
                    // patientName: 'User',
                    patientName: data.fullName,
                    time: data.timeString,
                    doctorName: data.doctorName,
                    language: data.language,
                    redirectLink: buildUrlEmail(data.doctorId, token)
                })


                //upsert patient
                let user = await db.User.findOrCreate({
                    where: { email: data.email },
                    defaults: {
                        email: data.email,
                        roleId: 'R3',
                        gender: data.selectedGender,
                        address: data.address,
                        firstName: data.fullName,
                    }
                })

                console.log('check user: ', user[0])
                    // create a booking record
                if (user && user[0]) {
                    await db.Booking.findOrCreate({
                        where: { patientId: user[0].id },
                        defaults: {
                            statusId: 'S1',
                            doctorId: data.doctorId,
                            patientId: user[0].id,
                            date: data.date,
                            timeType: data.timeType,
                            token: token,
                        }
                    })
                }

                resolve({
                    data: user,
                    errCode: 0,
                    errMessage: 'save infor patient succeed'
                })
            }

        } catch (e) {
            reject(e);
        }
    })
}

//verify email
let postVerifyBookAppointment = (data) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!data.token || !data.doctorId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                let appointment = await db.Booking.findOne({
                    where: {
                        doctorId: data.doctorId,
                        token: data.token,
                        statusId: 'S1'
                    },
                    raw: false,
                })

                if (appointment) {
                    appointment.statusId = 'S2';
                    await appointment.save();

                    resolve({
                        errCode: 0,
                        errMessage: 'update the appointment succeed'
                    })
                } else {
                    resolve({
                        errCode: 0,
                        errMessage: 'appointment has been actived or does not exist'
                    })
                }
            }
        } catch (e) {
            return reject(e);
        }


    })
}


module.exports = {
    postBookAppointment: postBookAppointment,
    postVerifyBookAppointment: postVerifyBookAppointment
}