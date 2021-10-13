import db from "../models/index";

//create specialty
let createSpecialty = (data) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!data.name || !data.imageBase64 || !data.descriptionHTML || !data.descriptionMarkdown) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                await db.Specialty.create({
                    name: data.name,
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

//get all specialty
let getAllSpecialty = () => {
    return new Promise(async(resolve, reject) => {
        try {
            let data = await db.Specialty.findAll({

            });

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
            return reject(e);
        }
    })

}


module.exports = {
    createSpecialty: createSpecialty,
    getAllSpecialty: getAllSpecialty
}