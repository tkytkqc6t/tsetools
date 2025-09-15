# 🚀 Git Branching & Workflow Guideline

## 🔒 Step 1. Protect **backup branch `v1-1`**
- Create `v1-1` from `main` (already done).  
- Protect `v1-1` so no one can modify it:  
  - Go to **Repo → Settings → Branches → Add rule**.  
  - Select `v1-1`.  
  - Enable:  
    - ✅ Prevent direct pushes  
    - ✅ Prevent deletion  
    - (Optional) Require Pull Request before merging  
- Result: `v1-1` becomes **read-only backup**.  

---

## 🔀 Step 2. Create **development branch `v1-2`**
Branch off either from `main` or from `v1-1`:

```bash
# From main (recommended for clean base)
git checkout main
git pull origin main
git checkout -b v1-2

# OR from v1-1 (if you want to continue that snapshot)
git checkout v1-1
git pull origin v1-1
git checkout -b v1-2

# Push new branch to remote
git push -u origin v1-2
```

---

## 🛠️ Step 3. Develop on **`v1-2`**
- Do all updates and commits here.  

```bash
git add .
git commit -m "Your feature or fix"
git push
```

- Repeat until ready to merge.  

---

## 🔁 Step 4. Merge **`v1-2` → `main`**
Two ways:

### A. Pull Request (recommended)
1. Push your latest code:
   ```bash
   git push
   ```
2. On GitHub/GitLab, click **Compare & pull request**.  
3. Base branch = `main`, Compare branch = `v1-2`.  
4. Review → Merge.  
5. (Optional) Delete branch `v1-2` after merge.  

### B. Git commands (direct merge, no review)
```bash
git checkout main
git pull origin main
git merge v1-2
git push origin main
```

---

✅ **Summary:**  
- `v1-1` = backup, read-only.  
- `v1-2` = development branch.  
- `main` = production branch (updated only via merge).  
