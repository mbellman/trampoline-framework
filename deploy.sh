yarn build
git add .

read -p "Commit message: " -i "no-message" message;
read -p "Version bump: " bump;

case $bump in
  "major" | "minor" | "patch")
    npm version $bump -m "Rebuilding and deploying %s ($message)";
    ;;
  *)
    echo "Invalid version bump!"
    exit 0;
    ;;
esac

git push
