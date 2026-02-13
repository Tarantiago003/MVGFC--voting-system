/**
 * Authentication Middleware
 * Simple token-based authentication for admin routes
 */

/**
 * Authenticate admin token
 */
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'No authorization token provided'
        });
    }
    
    // Extract token from "Bearer <token>"
    const token = authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : authHeader;
    
    // Simple token validation
    // In production, use proper JWT tokens or session management
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        
        if (decoded.startsWith('admin:')) {
            // Token is valid
            next();
        } else {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token format'
        });
    }
}

module.exports = {
    authenticate
};