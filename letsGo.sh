# Extract the last part of the folder path
FOLDER_NAME=$(basename "$PWD")
MODIFIED_NAME=$(echo "$FOLDER_NAME" | tr '-' ' ')

# Update the manifest.json file with the folder name
jq --arg folderName "$FOLDER_NAME" --arg modifiedName "$MODIFIED_NAME" '.id = $folderName | .name = $modifiedName' manifest.json > tmp.json && mv tmp.json manifest.json

pnmp install
git status
webstorm .
cursor .
tmux new-session -d -s "$FOLDER_NAME" "npm run dev"
