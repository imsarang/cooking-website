provider "aws" {
    region = "ap-south-1"
}

resource "aws_s3_bucket" "funfoods" {
    bucket = "funfoods-static-assets-01"

    tags = {
        name = "funfoods Bucket"
    }
}

