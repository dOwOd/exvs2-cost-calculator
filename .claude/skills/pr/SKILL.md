## Create PR Workflow
1. Verify current branch is NOT main: `git branch --show-current`
2. If on main, create and checkout a new branch: `git checkout -b issue-{number}-{description}`
3. Stage and commit all changes with a descriptive message
4. Push the branch: `git push -u origin HEAD`
5. Create PR with `gh pr create --fill --base main`
6. Update specifications.md and CLAUDE.md file structure map if needed
7. Report the PR URL
