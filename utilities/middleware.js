const checkLogin = (req, res, next) => {
    if(req.isUnauthenticated()){
        req.session.redirectTo = req.originalUrl;
        req.flash('error', 'You must be Signed in to perform that action!');
        return res.redirect(`/u/login`);
    }
    next();
}
const redirectTo = (req, res, next) => {
    if(req.session.redirectTo){
        res.locals.redirectTo = req.session.redirectTo;
    }
    next();
}
module.exports = {checkLogin, redirectTo};