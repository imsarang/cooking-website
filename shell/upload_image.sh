#!/bin/bash

# Load environment variables
if [ -f "../.env.local" ]; then
    export $(grep -v '^#' ../.env.local | xargs)
else
    echo "❌ .env.local file not found. Please create one."
    exit 1
fi

IMAGE_FILE="../data/image_links.json"
LOG_FILE="../data/uploaded_images.json"
TEMP_LOG="tmp_upload_log.json"

# Check dependencies
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed."
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "❌ jq is not installed."
    exit 1
fi

# Clean temp log file
echo "[]" > "$TEMP_LOG"

# Process each image entry
jq -c '.images[]' "$IMAGE_FILE" | while read -r image; do
    filename=$(echo "$image" | jq -r '.filename')
    raw_url=$(echo "$image" | jq -r '.source_url')

    # Extract the actual image URL from the "imgurl=" query param
    actual_url=$(echo "$raw_url" | grep -oP '(?<=imgurl=)[^&]*' | sed 's/%3A/:/g; s/%2F/\//g')

    if [ -z "$actual_url" ]; then
        echo "⚠️ Skipping: no valid image URL found in source_url."
        continue
    fi

    echo "⬇️  Downloading $actual_url as $filename..."
    curl -L -o "$filename" "$actual_url"

    if [ ! -f "$filename" ]; then
        echo "❌ Failed to download $actual_url"
        continue
    fi

    echo "☁️  Uploading $filename to S3 bucket $BUCKET_NAME..."
    aws s3 cp "$filename" "s3://$AWS_BUCKET_NAME/image/$filename"

    # Append to temp log
    s3_url="https://$AWS_BUCKET_NAME.s3.amazonaws.com/image/$filename"
    jq -n --arg f "$filename" --arg u "$s3_url" '{"filename": $f, "url": $u}' >> "$TEMP_LOG"

    rm "$filename"
done

# Combine into valid JSON array
jq -s '.' "$TEMP_LOG" > "$LOG_FILE"
rm "$TEMP_LOG"

echo "✅ All valid images uploaded to S3. Log saved to $LOG_FILE."
