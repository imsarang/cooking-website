const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
    try {
        // Parse the incoming request
        const body = JSON.parse(event.body);
        const { file, fileName, fileType } = body;
        
        // Decode the base64 file
        const buffer = Buffer.from(file, 'base64');
        
        // Determine the folder based on file type
        const folder = fileType.startsWith('image/') ? 'images' : 'videos';
        
        // Upload to S3
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: `${folder}/${fileName}`,
            Body: buffer,
            ContentType: fileType
        };
        
        await s3.upload(params).promise();
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST'
            },
            body: JSON.stringify({
                message: 'File uploaded successfully',
                fileUrl: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${folder}/${fileName}`
            })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST'
            },
            body: JSON.stringify({
                message: 'Error uploading file',
                error: error.message
            })
        };
    }
}; 