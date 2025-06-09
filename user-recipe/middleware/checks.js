import multer from 'multer'
import jwt from 'jsonwebtoken'
import redisClient from '../connectRedis.js'

export const checkAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader?.split(' ')[1]
    console.log("Received token:", token);
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized - No token provided' })
    }

    try {
        // First verify the JWT
        console.log(`Access secret : ${process.env.JWT_ACCESS_SECRET}`);
        
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
        console.log("Decoded token:", decoded);

        // Then check Redis
        const redisKey = `user:${decoded.id}`
        const cachedData = await redisClient.get(redisKey)
        
        if (!cachedData) {
            return res.status(401).json({ success: false, message: 'Token not found in cache' })
        }

        const { accessToken } = JSON.parse(cachedData)
        
        // Verify the token matches what's in Redis
        if (accessToken !== token) {
            return res.status(401).json({ success: false, message: 'Invalid token' })
        }

        req.user = decoded
        next()
    } catch(err) {
        console.log("Token verification error:", err);
        
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token has expired', status : 401 })
        }
        
        return res.status(403).json({ success: false, message: 'Invalid token' , status : 403 })
    }
}

export const checkImage = (
    req,
    res,
    next,
)=>{
    const storage = multer.memoryStorage()
    const upload = multer({ storage })

    upload.fields([
        {name:'videoFile', maxCount:1},
        {name:'imageFile', maxCount:1}
    ])
    (req, res, function (err) {
        
        if (err) {
            console.error("Upload error:", err);
            return res.status(400).json({ error: "File upload failed" });
        }

        if (!req.files) {
            console.log("File not Found");

            return res.status(400).json({ error: "No file uploaded" });
        }

        // Access the file buffer here
        next()
    })
}
