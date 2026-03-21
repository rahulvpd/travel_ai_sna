export const authMiddleware = (req, res, next) => {
    // For demo: automatically authorize
    req.userId = 'demo-user';
    next();
};
