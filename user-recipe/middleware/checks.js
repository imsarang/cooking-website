import multer from 'multer'

export const checkAuth = (
    req,
    res,
    next
)=>{
    next()
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
    // next()
}

// export const checkVideo = (
//     req,
//     res,
//     next
// )=>{
//     const storage = multer.memoryStorage()
//     const upload = multer({storage})
//     upload.single("videoFile")(req,res,function(err){
//         if (err) {
//             console.error("Upload error:", err);
//             return res.status(400).json({ error: "File upload failed" });
//         }

//         if (!req.file) {
//             console.log("File not Found");

//             return res.status(400).json({ error: "No file uploaded" });
//         }

//         // Access the file buffer here
//         next()
//     })
// }