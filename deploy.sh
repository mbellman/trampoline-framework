read -p "Version bump (major | minor | patch): " bump;

case $bump in
  "major" | "minor" | "patch")
    read -p "Commit message: " -e -i "$bump update" message;

    git add .
    npm version $bump -m "Deploying %s";
    npm publish
    git push
    ;;
  *)
    echo "Invalid version bump!"
    ;;
esac
