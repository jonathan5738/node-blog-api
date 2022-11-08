const checkAdmin = async (req, res, next) => {
    if(!req.user._id.equals(process.env.ADMIN_ID)){
        return res.status(403).send({error: 'unauthorized action'})
    }
    next()
}
module.exports = checkAdmin