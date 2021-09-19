import db from '../models/index';
import CRUDService from '../services/CRUDService';

//Render data to view
let getHomePage = async(req, res) => {
    try {
        let data = await db.User.findAll();
        console.log('---------')
        console.log(data)
        console.log('---------')
        return res.render('homePage.ejs', {
            data: JSON.stringify(data)
        });
    } catch (e) {
        console.log(e);
    }
}

let getCRUD = (req, res) => {
    return res.render('crud.ejs');
}

let postCRUD = async(req, res) => {
    let message = await CRUDService.createNewUser(req.body);
    console.log(message);
    console.log(req.body); //lay tham so tu client len server
    return res.send('post crud from server')
}

let displayGetCRUD = async(req, res) => {
    let data = await CRUDService.getAllUser();
    console.log('-------');
    console.log(data);
    console.log('-------');
    return res.render('displayCRUD.ejs', {
        dataTable: data
    });
}

module.exports = {
    getHomePage: getHomePage,
    getCRUD: getCRUD,
    postCRUD: postCRUD,
    displayGetCRUD: displayGetCRUD,
}