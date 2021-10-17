import db from "../models/index";
require('dotenv').config();

//create handbook
let createHandbook = (data) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!data.name || !data.note || !data.imageBase64 || !data.descriptionHTML || !data.descriptionMarkdown) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                await db.Handbook.create({
                    name: data.name,
                    note: data.note,
                    image: data.imageBase64,
                    descriptionHTML: data.descriptionHTML,
                    descriptionMarkdown: data.descriptionMarkdown,
                })

                resolve({
                    errCode: 0,
                    errMessage: 'OK'
                })
            }

        } catch (e) {
            return reject(e);
        }
    })
}

//get handbook
let getAllHandbook = () => {
    return new Promise(async(resolve, reject) => {
        try {
            let data = await db.Handbook.findAll({});

            if (data && data.length > 0) {
                data.map(item => {
                    item.image = new Buffer(item.image, 'base64').toString('binary');
                })
            }

            resolve({
                errCode: 0,
                errMessage: 'OK',
                data
            })
        } catch (e) {
            reject(e);
        }
    })
}

//detail handbook
let getDetailHandbookById = (inputId) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                let data = await db.Handbook.findOne({
                    where: { id: inputId },
                    attributes: ['name', 'note', 'descriptionMarkdown', 'descriptionHTML']
                })

                // if (data) {
                //     let doctorClinic = [];
                //     doctorClinic = await db.Doctor_Infor.findAll({
                //         where: { clinicId: inputId },
                //         attributes: ['doctorId', 'provinceId']

                //     })

                //     data.doctorClinic = doctorClinic;

                // } 
                // else data = {}

                resolve({
                    errMessage: 'ok',
                    errCode: 0,
                    data
                })

            }

        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    createHandbook: createHandbook,
    getAllHandbook: getAllHandbook,
    getDetailHandbookById: getDetailHandbookById
}