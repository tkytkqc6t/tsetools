### STEPS to CREATE BRANCH AND COMMIT YOUR CODE

## Checkout MAIN branch an Create your BRANCH

# Step 1: 
- Fetch all remote branches to local:<br>
git fetch --all

- Show all branches on local:<br>
git branch -r

# Step 2:
- Checkout main branch and create your new branch (should follow up latest branch at step 1) <br>

git checkout main<br>

git pull origin main<br>

git checkout -b v1-2 <br> 
Note: Replace v1-2 with yours <br>

- Update the code

# Step 3:
- Pull Main branch to make sure you have latest code <br>

git pull origin main

- Commit your new code<br>
git add .
git commit -m "Put your comment for fix or feature"
git push

# Step 4:
- Admin will review and merge the code

