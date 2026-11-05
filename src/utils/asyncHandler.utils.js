export const asyncHandler = (reqHandler) => async (req, res, next) => {
    try{
        return await reqHandler(req, res, next);
    }
    catch(err){
        res.status(err.code || 500).json({
            sucess: false,
            message: err.message
        });
    }
};