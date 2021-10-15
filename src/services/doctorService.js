import db from "../models/index";
require('dotenv').config();
import _ from 'lodash';
const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

//get doctor  
let getTopDoctorHome = (limitInput) => {
    return new Promise(async(resolve, reject) => {
        try {
            let users = await db.User.findAll({
                limit: limitInput,
                where: { roleId: 'R2' },
                // order: [
                //     ['createAt', 'DESC']
                // ],
                attributes: {
                    exclude: ['password']
                },
                include: [
                    { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                    { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] },
                ],

                raw: true,
                nest: true
            })

            resolve({
                errCode: 0,
                data: users
            })
        } catch (e) {
            reject(e);
        }
    })
}

//load doctor 
let getAllDoctors = () => {
    return new Promise(async(resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: { roleId: 'R2' },
                attributes: {
                    exclude: ['password', 'image']
                },
            })

            resolve({
                errCode: 0,
                data: doctors
            })
        } catch (e) {
            reject(e);
        }
    })
}

//validate 
let checkRequiredFields = (inputData) => {
    let arrFields = ['doctorId', 'contentHTML', 'contentMarkdown', 'action', 'selectedPrice',
        'selectedPayment', 'selectedProvince', 'nameClinic', 'addressClinic', 'note', 'specialtyId', 'clinicId'
    ];

    let isValid = true;
    let element = '';
    for (let i = 0; i < arrFields.length; i++) {
        if (!inputData[arrFields[i]]) {
            isValid = false;
            element = arrFields[i];
            break;
        }
    }
    return {
        isValid: isValid,
        element: element,
    }
}

//post infor doctor
let saveDetailInforDoctor = (inputData) => {
    return new Promise(async(resolve, reject) => {
        try {
            let checkObject = checkRequiredFields(inputData);

            // error
            if (checkObject.isValid === false) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing parameter: ${checkObject.element} `
                })
            }
            // ok
            else {
                //upsert Markdown table
                //create infor doctor
                if (inputData.action === 'CREATE') {
                    await db.Markdown.create({
                        contentHTML: inputData.contentHTML,
                        contentMarkdown: inputData.contentMarkdown,
                        description: inputData.description,
                        doctorId: inputData.doctorId,
                    })

                    //edit infor doctor
                } else if (inputData.action === 'EDIT') {
                    let doctorMarkdown = await db.Markdown.findOne({
                        where: { doctorId: inputData.doctorId },
                        raw: false, //sequelize obj
                    })

                    if (doctorMarkdown) {
                        doctorMarkdown.contentHTML = inputData.contentHTML;
                        doctorMarkdown.contentMarkdown = inputData.contentMarkdown;
                        doctorMarkdown.description = inputData.description;
                        doctorMarkdown.updateAt = new Date();
                        await doctorMarkdown.save()
                    }
                }

                //upsert doctor_infor table
                let doctorInfor = await db.Doctor_Infor.findOne({
                    where: {
                        doctorId: inputData.doctorId,
                    },
                    raw: false //tra ra 1 instance dequelize, no obj js
                })

                if (doctorInfor) {
                    //update
                    doctorInfor.doctorId = inputData.doctorId;
                    doctorInfor.priceId = inputData.selectedPrice;
                    doctorInfor.provinceId = inputData.selectedProvince;
                    doctorInfor.paymentId = inputData.selectedPayment;
                    doctorInfor.nameClinic = inputData.nameClinic;
                    doctorInfor.addressClinic = inputData.addressClinic;
                    doctorInfor.notes = inputData.note;
                    doctorInfor.specialtyId = inputData.specialtyId;
                    doctorInfor.clinicId = inputData.clinicId;
                    await doctorInfor.save()
                } else {
                    //create
                    await db.Doctor_Infor.create({
                        doctorId: inputData.doctorId,
                        priceId: inputData.selectedPrice,
                        provinceId: inputData.selectedProvince,
                        paymentId: inputData.selectedPayment,
                        nameClinic: inputData.nameClinic,
                        addressClinic: inputData.addressClinic,
                        notes: inputData.note,
                        specialtyId: inputData.specialtyId,
                        clinicId: inputData.clinicId,
                    })
                }


                resolve({
                    errCode: 0,
                    errMessage: 'save infor doctor success'
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

//detail doctor
let getDetailDoctorById = (inputId) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter'
                })
            } else {
                let data = await db.User.findOne({
                    where: { id: inputId },
                    attributes: {
                        exclude: ['password']
                    },
                    include: [{
                            model: db.Markdown,
                            attributes: ['description', 'contentHTML', 'contentMarkdown']
                        },

                        {
                            model: db.Allcode,
                            as: 'positionData',
                            attributes: ['valueEn', 'valueVi']
                        },

                        {
                            model: db.Doctor_Infor,
                            attributes: {
                                exclude: ['id', 'doctorId']
                            },

                            include: [{
                                    model: db.Allcode,
                                    as: 'priceTypeData',
                                    attributes: ['valueEn', 'valueVi']
                                },

                                {
                                    model: db.Allcode,
                                    as: 'provinceTypeData',
                                    attributes: ['valueEn', 'valueVi']
                                },

                                {
                                    model: db.Allcode,
                                    as: 'paymentTypeData',
                                    attributes: ['valueEn', 'valueVi']
                                }
                            ]

                        },
                    ],
                    raw: false,
                    nest: true
                })

                if (!data) data = {};

                //convert image to base64
                if (data && data.image) {
                    data.image = new Buffer(data.image, 'base64').toString('binary');
                }

                resolve({
                    errCode: 0,
                    data: data,
                })

            }
        } catch (e) {
            reject(e);
        }
    })
}

//create schedule time doctor
let bulkCreateSchedule = (data) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!data.arrSchedule || !data.doctorId || !data.formatedDate) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required param'
                })
            } else {
                let schedule = data.arrSchedule;
                if (schedule && schedule.length > 0) {
                    schedule = schedule.map(item => {
                        item.maxNumber = MAX_NUMBER_SCHEDULE;
                        return item;
                    })
                }

                console.log('data send:  ', schedule);

                // get all existing data
                let existing = await db.Schedule.findAll({
                    where: { doctorId: data.doctorId, date: data.formatedDate },
                    attributes: ['timeType', 'date', 'doctorId', 'maxNumber'],
                    raw: true
                })

                console.log('check existing: ', existing);
                console.log('check create: ', schedule);

                //compare arr tramision data (tranh trung lap)
                let toCreate = _.differenceWith(schedule, existing, (a, b) => {
                    return a.timeType === b.timeType && +a.date === +b.date;
                });


                //create data
                if (toCreate && toCreate.length > 0) {
                    await db.Schedule.bulkCreate(toCreate)
                }

                console.log('check different :', toCreate)


                resolve({
                    errCode: 0,
                    errMessage: 'OK'
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

//select Schedule Time
let getScheduleByDate = (doctorId, date) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required param'
                })
            } else {
                let dataSchedule = await db.Schedule.findAll({
                    where: {
                        doctorId: doctorId,
                        date: date,
                    },

                    include: [
                        { model: db.Allcode, as: 'timeTypeData', attributes: ['valueEn', 'valueVi'] },
                        { model: db.User, as: 'doctorData', attributes: ['firstName', 'lastName'] },
                    ],

                    raw: true,
                    nest: true
                })

                if (!dataSchedule) dataSchedule = [];

                resolve({
                    errCode: 0,
                    data: dataSchedule
                })
            }

        } catch (e) {
            reject(e);
        }
    })
}

//extra infor doctor
let getExtraInfoDoctorById = (idInput) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!idInput) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter'
                })
            } else {
                let data = await db.Doctor_Infor.findOne({
                    where: { doctorId: idInput },

                    attributes: {
                        exclude: ['id', 'doctorId']
                    },

                    include: [{
                            model: db.Allcode,
                            as: 'priceTypeData',
                            attributes: ['valueEn', 'valueVi']
                        },

                        {
                            model: db.Allcode,
                            as: 'provinceTypeData',
                            attributes: ['valueEn', 'valueVi']
                        },

                        {
                            model: db.Allcode,
                            as: 'paymentTypeData',
                            attributes: ['valueEn', 'valueVi']
                        }
                    ],
                    raw: false,
                    nest: true
                })

                if (!data) data = {};
                resolve({
                    errCode: 0,
                    data: data,
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

//doctor infor
let getProfileDoctorById = (idInput) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!idInput) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter'
                })
            } else {
                let data = await db.User.findOne({
                    where: { id: idInput },
                    attributes: {
                        exclude: ['password']
                    },
                    include: [{
                            model: db.Markdown,
                            attributes: ['description', 'contentHTML', 'contentMarkdown']
                        },

                        {
                            model: db.Allcode,
                            as: 'positionData',
                            attributes: ['valueEn', 'valueVi']
                        },

                        {
                            model: db.Doctor_Infor,
                            attributes: {
                                exclude: ['id', 'doctorId']
                            },

                            include: [{
                                    model: db.Allcode,
                                    as: 'priceTypeData',
                                    attributes: ['valueEn', 'valueVi']
                                },

                                {
                                    model: db.Allcode,
                                    as: 'provinceTypeData',
                                    attributes: ['valueEn', 'valueVi']
                                },

                                {
                                    model: db.Allcode,
                                    as: 'paymentTypeData',
                                    attributes: ['valueEn', 'valueVi']
                                }
                            ]

                        },
                    ],
                    raw: false,
                    nest: true
                })

                if (!data) data = {};

                //convert image to base64
                if (data && data.image) {
                    data.image = new Buffer(data.image, 'base64').toString('binary');
                }

                resolve({
                    errCode: 0,
                    data: data,
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

//get all patient
let getListPatientForDoctor = (doctorId, date) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                let data = await db.Booking.findAll({
                    where: {
                        statusId: 'S2',
                        doctorId: doctorId,
                        date: date,
                    },
                    include: [{
                            model: db.User,
                            as: 'patientData',
                            attributes: ['email', 'firstName', 'address', 'gender'],
                            include: [{
                                model: db.Allcode,
                                as: 'genderData',
                                attributes: ['valueEn', 'valueVi']
                            }]
                        },

                        {
                            model: db.Allcode,
                            as: 'timeTypeDataPatient',
                            attributes: ['valueEn', 'valueVi']
                        }

                    ],
                    raw: false,
                    nest: true
                })


                resolve({
                    errCode: 0,
                    errMessage: 'ok',
                    data: data
                })
            }
        } catch (e) {

        }
    })
}

module.exports = {
    getTopDoctorHome: getTopDoctorHome,
    getAllDoctors: getAllDoctors,
    saveDetailInforDoctor: saveDetailInforDoctor,
    getDetailDoctorById: getDetailDoctorById,
    bulkCreateSchedule: bulkCreateSchedule,
    getScheduleByDate: getScheduleByDate,
    getExtraInfoDoctorById: getExtraInfoDoctorById,
    getProfileDoctorById: getProfileDoctorById,
    getListPatientForDoctor: getListPatientForDoctor
}