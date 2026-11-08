export const asyncHandler = (reqHandler) => async (req, res, next) => {
    try{
        return await reqHandler(req, res, next);
    }
    catch(err){
        const statusCode = Number.isInteger(err.code) ? err.code : 500;
        res.status(statusCode).json({
            success: false,
            message: err.message
        });
    }
};