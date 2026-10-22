export const asyncHandler = (reqHandler) => {
    (req, res, nxt) => {
        Promise.resolve(reqHandler(req, res, nxt))
        .catch(err => nxt(err));
    }
}

export const asyncTC = (fn) => async (req, res, nxt) => {
    try {
        await fn(req, res, nxt);
    }
    catch (err) {
        res.status(err.code || 500).json({
            sucess: false,
            message: err.message,
        });
    }
}