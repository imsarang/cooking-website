import multer from 'multer'
import jwt from 'jsonwebtoken'

export const checkAuth = (
    req,
    res,
    next
)=>{
    const authHeader = req.headers['authorization']
    const token = authHeader.split(' ')[1]
    console.log(token);
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' })
    }
    // Verify the token here (e.g., using JWT or any other method)
    // If the token is valid, call next()
    try{
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
        req.user = decoded
        console.log(req.user);
        
        next()
    }catch(err){
        console.log(err);
        
        return res.status(403).json({ success : false, message:"Invalied Token" })
    }
    // If the token is invalid, return an error response

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
