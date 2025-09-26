# stage all changes
git add -A
# commit with a message
git commit -m "message"
# push current branch (triggers deploy)
git push

# see current branch
git branch

# create & switch to staging (first time)
git checkout -b staging
git push -u origin staging

# switch branches
git checkout staging
git checkout main
