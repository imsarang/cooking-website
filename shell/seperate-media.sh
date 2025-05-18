#!/bin/bash

# Input file
JSON_FILE="../data/media_links.json"

# output files
IMAGE_FILE="../data/image_links.json"
VIDEO_FILE="../data/video_links.json"

# using jq to filter the JSON file
# check if jq is installed 
if ! command -v jq &> /dev/null;
then
    echo "jq could not be found. Please install jq to use this script."
    echo "trying to install jq..."

    if [["$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get install jq
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install jq
    elif [[ "$OSTYPE" == "cygwin" ]]; then
        echo "Cygwin is not supported."
    elif [[ "$OSTYPE" == "msys" ]]; then
        echo "MSYS is not supported."
        exit 1
    else
        echo "Unknown OS. Please install jq manually."
        exit 1
    fi
fi

# extract and split links

echo "jq is installed, Proceeding with the script..."

# Extract images with supported extensions (.jpg, .jpeg, .png)
jq '{images: .images | map(select(.filename | test("\\.(jpg|jpeg|png)$"; "i")))}' "$JSON_FILE" > "$IMAGE_FILE"

# Extract videos with supported extensions (.mp4, .mov)
jq '{videos: .videos | map(select(.filename | test("\\.(mp4|mov)$"; "i")))}' "$JSON_FILE" > "$VIDEO_FILE"

echo "✅ Extracted image links to: $IMAGE_FILE"
echo "✅ Extracted video links to: $VIDEO_FILE"