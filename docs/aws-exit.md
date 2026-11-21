# Customer SPA AWS exit audit

The current lock pins SPA Utils 1.0.6 to its CodeArtifact tarball. The tracked
root npm configuration routes the Mentor Forge scope to CodeArtifact. The local
build wrapper obtains an AWS token and passes it to the Dockerfile as the
`codeartifact_token` BuildKit secret. The GitHub publishing workflow does the
same after assuming an AWS role. Additional npm configuration such as `scripts/.npmrc` is ignored. Developer setup in the README still refers to CodeArtifact.

The cutover uses the published SPA Utils 1.0.7 package from GitHub Packages.
The Admin SPA lock records the GitHub Packages tarball URL and integrity for
that version, providing a known consumer pin. Confirm Customer SPA access
separately.
Verify a clean consumer install using the project’s read-scoped package token
and verify that GitHub Actions can read the package. Keep the rest of npm on
the public registry. Preserve the exact version, resolved URL, and integrity
in the lockfile. Roll back a later version by restoring the previously verified
GitHub Packages pin and its matching lockfile together.

Customer SPA delegates URL auth bootstrap and stored-session synchronization to
SPA Utils. Vite uses `VITE_IDP_LOGIN_URI`, and the packaged app reads
`IDP_LOGIN_URI` through the generated runtime configuration. Nginx uses
`API_HOST` and `API_PORT` to proxy Customer API requests. The app has no direct
Cognito or AWS SDK wiring in tracked application sources. Keep the Customer
routes, claims, runtime auth configuration, and API proxy behavior through the
package and image changes.

The unpinned Nginx runtime uses the stable Alpine tag. The separate Nginx task
will select and validate a version for both supported architectures. The
packaged Cypress suite remains the gate for Nginx behavior. Check Vite coverage
separately during acceptance.

## GitHub Packages lock

Set `GITHUB_TOKEN` to a GitHub Packages read token and run `npm ci`. The
tracked npm configuration uses that variable only at the GitHub Packages
host. SPA Utils is pinned to the exact published 1.0.7 tarball and its
verified SHA-512 integrity. The three remaining CodeArtifact tarball URLs
moved to public npm with their versions and integrity unchanged.

An authenticated install and a second locked install with an empty cache
and empty user and global npm configuration both passed. GitHub Packages
returned HTTP 401 when fetching the pinned tarball without a token. All 39
unit tests and the production build passed. Hosted repository-token validation
and packaged Cypress acceptance follow in their respective tasks.

## Container build

Set `GITHUB_TOKEN` to a credential with GitHub Packages read access and run
`npm run container`. The wrapper forwards it as the `github_npm_token` BuildKit
secret. The dependency install uses `npm ci` and a registry-scoped configuration
on a temporary mount. The Docker context excludes root and nested npm config
files. The runtime image contains the Nginx deployment and built assets.
`CUSTOMER_SPA_IMAGE` can override the default GHCR image tag for isolated builds.
