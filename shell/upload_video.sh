#!/bin/bash

# Load environment variables
if [ -f "../.env.local" ]; then
    export $(grep -v '^#' ../.env.local | xargs)
else
    echo "❌ .env.local file not found. Please create one."
    exit 1
fi

VIDEO_FILE="../data/video_links.json"
LOG_FILE="../data/uploaded_videos.json"
TEMP_LOG="tmp_video_upload_log.json"

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

# Process each video entry
jq -c '.videos[]' "$VIDEO_FILE" | while read -r video; do
    filename=$(echo "$video" | jq -r '.filename')
    source_url=$(echo "$video" | jq -r '.source_url')

    echo "⬇️  Downloading $source_url as $filename..."
    curl -L -o "$filename" "$source_url"

    if [ ! -f "$filename" ]; then
        echo "❌ Failed to download $source_url"
        continue
    fi

    echo "☁️  Uploading $filename to S3 bucket $AWS_BUCKET_NAME..."
    aws s3 cp "$filename" "s3://$AWS_BUCKET_NAME/video/$filename"

    # Append to temp log
    s3_url="https://$AWS_BUCKET_NAME.s3.amazonaws.com/video/$filename"
    jq -n --arg f "$filename" --arg u "$s3_url" '{"filename": $f, "url": $u}' >> "$TEMP_LOG"

    rm "$filename"
done

# Combine into valid JSON array
jq -s '.' "$TEMP_LOG" > "$LOG_FILE"
rm "$TEMP_LOG"

echo "✅ All valid videos uploaded to S3. Log saved to $LOG_FILE."
