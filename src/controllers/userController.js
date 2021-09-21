import userService from '../services/userService';

let handleLogin = async(req, res) => {
    // lay gia tri tu phia client truyen len 
    let email = req.body.email;
    let password = req.body.password;

    // validate 
    // 1. check email exist
    // 2. compare password 
    // 3. ruturn userInfor 
    // 4. access_token: JWT 
    if (!email || !password) {
        return res.status(500).json({
            errCode: 1,
            message: 'Missing input parameter'
        })
    }

    let userData = await userService.handleUserLogin(email, password);
    console.log(userData)

    return res.status(200).json({
        errCode: userData.errCode,
        message: userData.errMessage,
        user: userData.user ? userData.user : {}
    })
}

module.exports = {
    handleLogin: handleLogin,
}