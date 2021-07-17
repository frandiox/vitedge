# Vitedge Contributing Guide

👍🎉 First off, thanks for taking the time to contribute! 🎉👍
These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

- [How Can I Help](#how-can-i-help)
- [Running the Project Locally](#running-the-project-locally)
- [Pull Request Guidelines](#pull-request-guidelines)

## How Can I Help

If you want to contribute to the project but you are not sure what to do, have a look at the roadmap in the main readme file. Open an issue for anything there that is not yet done and ask for details or discuss how to approach it.

Other than that, bug fixes and general feedback are always welcome.

## Running the Project Locally

Make sure you use Node >= 14 first.

1. Clone the project.
2. Run `yarn` in the `src` directory to install dependencies.
3. Move to any directory under `examples/` (vue/react/etc), install dependencies with `yarn` and run `yarn dev` (or `yarn dev:spa`).
4. For reloading changes in from the `src` folder, run `yarn refresh && yarn dev` from any example.
5. Run `yarn build && yarn serve:node` in any example to test a production build. To test it in Workers, modify `wrangler.toml` with your account ID and use `yarn serve:worker` instead.

## Pull Request Guidelines

- Checkout a topic branch from a base branch, e.g. `master`, and merge back against that branch.

- If adding a new feature:

  - Provide a convincing reason to add this feature. Ideally, you should open a suggestion issue first and have it approved before working on it.

- If fixing bug:

  - If you are resolving a special issue, add `(fix #xxxx[,#xxxx])` (#xxxx is the issue id) in your PR title for a better release log, e.g. `update entities encoding/decoding (fix #3899)`.
  - Provide a detailed description of the bug in the PR. Live demo preferred.

- It's OK to have multiple small commits as you work on the PR.

- Please use Prettier following the current configuration for this repo.
