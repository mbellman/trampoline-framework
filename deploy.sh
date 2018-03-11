yarn build

read -p "Commit message: " -i "no-message" message;
read -p "Version bump: " bump;

case $bump in
  "major" | "minor" | "patch")
    git add .
    npm version $bump -m "Rebuilding and deploying %s ($message)";
    npm publish
    git push
    ;;
  *)
    echo "Invalid version bump!"
    ;;
esac
