provider "aws" {
    region = "ap-south-1"
}

resource "aws_s3_bucket" "funfoods" {
    bucket = "funfoods-static-assets-01"

    tags = {
        name = "funfoods Bucket"
    }
}

# IAM role for Lambda
resource "aws_iam_role" "lambda_role" {
    name = "media_upload_lambda_role"

    assume_role_policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Action = "sts:AssumeRole"
                Effect = "Allow"
                Principal = {
                    Service = "lambda.amazonaws.com"
                }
            }
        ]
    })
}

# IAM policy for S3 access
resource "aws_iam_policy" "lambda_s3_policy" {
    name = "lambda_s3_policy"
    policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Effect = "Allow"
                Action = [
                    "s3:PutObject",
                    "s3:GetObject",
                    "s3:ListBucket"
                ]
                Resource = [
                    "arn:aws:s3:::${aws_s3_bucket.funfoods.bucket}",
                    "arn:aws:s3:::${aws_s3_bucket.funfoods.bucket}/*"
                ]
            }
        ]
    })
}

# Attach policy to role
resource "aws_iam_role_policy_attachment" "lambda_s3_attachment" {
    role       = aws_iam_role.lambda_role.name
    policy_arn = aws_iam_policy.lambda_s3_policy.arn
}

# Lambda function
resource "aws_lambda_function" "media_upload" {
    filename         = "./worker/lambda/uploadMedia.zip"
    function_name    = "media-upload"
    role            = aws_iam_role.lambda_role.arn
    handler         = "uploadMedia.handler"
    runtime         = "nodejs18.x"
    timeout         = 30
    memory_size     = 256

    environment {
        variables = {
            BUCKET_NAME = aws_s3_bucket.funfoods.bucket
        }
    }
}

# API Gateway
# create the api ; in aws console, name of api : media-upload-api 

resource "aws_apigatewayv2_api" "lambda_api" {
    name          = "media-upload-api"
    protocol_type = "HTTP"
}

# create a stage : dev/prod
resource "aws_apigatewayv2_stage" "lambda_stage" {
    api_id = aws_apigatewayv2_api.lambda_api.id
    name   = "prod"
    auto_deploy = true
}

# integrate the api with lambda function
resource "aws_apigatewayv2_integration" "lambda_integration" {
    api_id           = aws_apigatewayv2_api.lambda_api.id
    integration_type = "AWS_PROXY"

    connection_type    = "INTERNET"
    description        = "Lambda integration"
    integration_method = "POST"
    integration_uri    = aws_lambda_function.media_upload.invoke_arn
}

# create the integrated api lambda route
resource "aws_apigatewayv2_route" "lambda_route" {
    api_id    = aws_apigatewayv2_api.lambda_api.id
    route_key = "POST /upload"
    target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# Lambda permission for API Gateway
resource "aws_lambda_permission" "api_gw" {
    statement_id  = "AllowExecutionFromAPIGateway"
    action        = "lambda:InvokeFunction"
    function_name = aws_lambda_function.media_upload.function_name
    principal     = "apigateway.amazonaws.com"
    source_arn    = "${aws_apigatewayv2_api.lambda_api.execution_arn}/*/*"
}

# expose the api end point
output "api_endpoint" {
    value = "${aws_apigatewayv2_api.lambda_api.api_endpoint}/prod/upload"
}

