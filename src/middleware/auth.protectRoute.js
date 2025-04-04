import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protectRoute = async (req, res, next) => {


    // if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    //     try {
    //         token = req.headers.authorization.split(' ')[1];

    //         const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //         req.user = await User.findById(decoded.userId).select('-password'); // Exclude password from user object

    //         next();
    //     } catch (error) {
    //         console.error(error);
    //         res.status(401).json({ message: 'Not authorized, token failed' });
    //     }
    // }

    // if (!token) {
    //     res.status(401).json({ message: 'Not authorized, no token' });
    // }


    try {
        const token = req.header("Authorization").replace("Bearer", "");

        if (!token) return res.status(401).json({ message: "No authentication token , access denied" })


        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // find user
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: "Token is not valid, access denied" })
        }
        req.user = user;


        next();


    } catch (error) {
        console.error(error);
        res.status(401).json({ message: "Token is not valid, access denied" })
    }
};

export default protectRoute; 