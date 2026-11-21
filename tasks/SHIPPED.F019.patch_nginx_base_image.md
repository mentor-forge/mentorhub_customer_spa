# F019 — Patch the Nginx base image built by CI

**Status**: Shipped
**Type**: Defect  
**Depends On**: F018  
**Issue**: https://github.com/mentor-forge/mentorhub_customer_spa/issues/24  
**Description**: Replace the floating Nginx runtime base with the latest patched stable Alpine image, refresh builds, and prove the packaged SPA still meets its deployment contract.

## Context

- `../mentorhub/DeveloperEdition/standards/ArchitecturePrinciples.md`
- `../mentorhub/DeveloperEdition/standards/spa_standards.md`
- `../mentorhub/DeveloperEdition/standards/sre_standards.md`
- `../mentorhub/DeveloperEdition/standards/security_standards.md`
- `../mentorhub_spa_utils/README.md`
- `README.md`
- `tasks/_PLANNING.md`
- `tasks/_ORCHESTRATE.md`
- `tasks/PENDING.F018.spa_migration_acceptance.md` (resolve by task ID after lifecycle renaming)
- `Dockerfile`
- `.github/workflows/docker-push.yml`
- `package.json`
- `scripts/docker-build.sh`
- `nginx.conf.template`
- `cypress.config.ts`
- `cypress/e2e/customer.cy.ts`
- `cypress/e2e/deployment.cy.ts`
- `cypress/e2e/navigation.cy.ts`
- `cypress/e2e/profile.cy.ts`
- [Official Nginx releases](https://nginx.org/en/download.html)
- [Official Nginx security advisories](https://nginx.org/en/security_advisories.html)
- [Official Docker image definitions](https://github.com/nginx/docker-nginx)

Execution follows F018, so its migrated registry/auth configuration is authoritative. Preserve the GitHub-hosted dependency migration and cloud-agnostic local runtime. Do not restore AWS CLI, OIDC, CodeArtifact endpoints, or CodeArtifact secrets. No production provider choice or AWS teardown is required for this security update.

The pre-migration Dockerfile uses `FROM nginx:stable-alpine`. The publishing workflow builds `linux/amd64,linux/arm64` on pushes to `main` and publishes `ghcr.io/mentor-forge/mentorhub_customer_spa:latest`. A floating tag does not identify the binary in an existing published image.

The planning guide contains inherited API wording and references a nonexistent `tasks/README_API.md`; use this SPA's actual `package.json`, README, and orchestration guide. No API contract or data schema change is needed.

## Goals

- At execution time, select the newest patched **stable** upstream Nginx release with an available official Alpine image supporting both target architectures. Record release/advisory URLs, retrieval date, version, image tag, and multi-platform index digest in Execution Notes. Do not copy an old version number from conversation history or silently switch to mainline.
- Identify applicable Nginx advisories using the actual image version, enabled modules (`nginx -V`), and effective configuration. The reported CVE was not supplied; distinguish confirmed affected findings from configuration-dependent or unrelated findings.
- Pin the Dockerfile runtime base to the verified explicit version tag plus multi-platform index digest, keeping Alpine and existing runtime startup behavior. Use the index digest rather than a single-architecture manifest digest.
- In `.github/workflows/docker-push.yml`, set `pull: true` on the existing build action. Keep publishing restricted to `push` on `main`, both target platforms, current registry tags, cache settings, and the migrated GitHub package authentication.
- Add `--pull` to the existing local scripts/docker-build.sh build command so local packaging follows the refreshed-base policy. Preserve the migrated GitHub npm BuildKit secret and all other build behavior.
- Verify the final application image's actual Nginx binary and configuration, rather than relying on a base tag or a successful Vite build. Record image IDs/digests and scan evidence per architecture.
- Document the chosen Nginx pin and the short verification/update procedure in README without duplicating the digest outside the Dockerfile.
- Preserve immutable promotion: build once and promote the same application digest through test, staging, and production. Post-merge CI must publish a fresh image; record its digest and verify its version before marking the security issue resolved. Do not manually publish or deploy during this task's pre-merge work.

### Craftsmanship Expectations

- Keep changes limited to Nginx base selection and fresh-base build behavior. Reuse the current build paths and existing deployment tests.
- Preserve journey prefixes, API proxy ownership, runtime IdP injection, cache headers, shared spa_utils auth/navigation behavior, and automation IDs.
- Do not change application dependency versions, authentication, API contracts, shared utility repositories, or infrastructure as part of this update.
- If a required patched multi-platform image, registry access, GitHub package credentials, Docker runtime, or backing service is unavailable, record the exact blocker and mark the task Blocked. Do not claim verification or weaken tests to pass.

## Testing Expectations

- Validate the YAML and diff: the base uses the verified pin; CI requests a pull, keeps both architectures, and retains its main-only publishing trigger. Use available existing lint tooling; do not introduce a dependency solely for this check.
- Using the GitHub npm authentication established by the predecessor tasks, with no AWS CLI/credentials prerequisite, run `npm ci --include=dev`, `npm run test`, and `npm run build`. Run the existing lint script only if present in package.json. Do not modify the lockfile for this base-image update.
- **Packaging verification**: run `npm run container`, then `npm run service`, then `npm run cypress:run` against the packaged SPA at `http://localhost:8388/customer/`. Stop Vite first. Confirm the running container image ID matches the freshly built local application image; a pulled old image is not evidence. Running the API alone does not run the SPA.
- In existing `cypress/e2e/deployment.cy.ts`, verify redirects, HTTP history fallback, fingerprinted asset caching, HTML/runtime-config `no-store`, matching root/prefixed runtime config, API `*.js` precedence, an authenticated least-privileged request, and an unauthenticated API failure. Use the complete existing Cypress suite without adding redundant tests or weakening assertions.
- Validate the generated configuration with `nginx -t -c /tmp/nginx.conf` inside the running SPA container. A bare `nginx -t` against a different config is insufficient.
- Also smoke-test the supported shared-origin `:8080/customer/` entry and its prefixed API path. Build the final application image for **both** amd64 and arm64 using the existing build/auth conventions (Buildx local exports or separate local platform tags; no registry push). Run `nginx -v` and `nginx -V` against each built image, with explicit platform selection/emulation where needed, and compare with the selected patched version.
- Scan each final application image using an available container scanner with current advisory data. Record scanner/database versions, target image identity, applicable Nginx findings and disposition, and remaining unrelated findings. Scanner unavailability or missing architecture validation is a blocker, not a passing result.
- Honor the existing pre-PR gate `npm run container && npm run api && npm run cypress:run`; because `npm run api` tears down the SPA stack, run `npm run service` after API setup and before Cypress so it actually exercises the newly built container. Record commands, results, image identities, and advisory decisions in Execution Notes. Publishing only occurs after human review and merge under existing CI. Leave a clearly identified post-merge check for the published multi-platform image's digest and binary versions; the issue remains open until that check succeeds.

## Outputs

Implementation may change only:
- `Dockerfile` — explicit patched stable Alpine tag and multi-platform digest.
- `.github/workflows/docker-push.yml` — fresh-base pull setting.
- `scripts/docker-build.sh` — fresh-base local build option.
- `README.md` — short Nginx update/verification procedure.
- `tasks/PENDING.F019.patch_nginx_base_image.md` — execution evidence and lifecycle update; rename to `tasks/SHIPPED.F019.patch_nginx_base_image.md` only after required pre-merge validation and commit, or the corresponding `BLOCKED.` filename if prerequisites fail.

Existing test files to execute unchanged:
- `cypress/e2e/customer.cy.ts`
- `cypress/e2e/deployment.cy.ts`
- `cypress/e2e/navigation.cy.ts`
- `cypress/e2e/profile.cy.ts`

All other files remain outside this task's output scope. If verification reveals a required config or test correction, record it for replanning rather than silently expanding outputs.

## Execution Notes

### Base selection and applicability

On November 21, 2026, the [upstream stable release listing](https://nginx.org/en/download.html)
identified Nginx 1.30.7 as the current stable release. The
[official Docker repository](https://github.com/nginx/docker-nginx) and
`docker buildx imagetools inspect nginx:1.30.7-alpine` confirmed both target
platforms in the official OCI image index
`sha256:caf4e1e032a20f9c3c5e28fc7f25ffd768ad8677b4975c54193075997b3a97e3`.
The index resolves to `sha256:4d1d4ce08432dc7dfe4af762cb224ce6b5273ae878f41e020ea2425d02ea91a4`
for AMD64 and `sha256:efd51f02e6ed0fc6d9d5bb6c700ba28b560e1c61dae9ad125bd5bad55cd2bd11`
for ARM64. The Dockerfile pins the index. The existing workflow's `pull: true`
and wrapper's `docker build --pull` already meet the fresh-base requirement.
Workflow YAML validation confirmed main-only delivery, both architectures,
GHCR tags and cache settings, and GitHub Packages BuildKit secret wiring.

The [upstream advisories](https://nginx.org/en/security_advisories.html) list
1.30.7 as fixed for the current stable resolver, alias/try-files, HTTP/2,
HTTP/3, TLS, mail and stream advisories. The prior running binary and the
reported CVE were unspecified, so exposure in an earlier published image is
unconfirmed. The effective Customer SPA configuration uses internal DNS
resolution and HTTP proxy/history routing. It has an HTTP listener on port 80
and does not enable HTTP/2, HTTP/3, TLS termination, mail, stream or PROXY
protocol. The history fallback uses `try_files` without an `alias` directive.

### Pre-merge acceptance

- Ran a clean `npm ci --include=dev` with GitHub Packages credentials and no
  AWS variables, `npm run test` (39 passed), and `npm run build` (passed).
  There is no lint script. `sh -n scripts/docker-build.sh`, `git diff --check`,
  and unchanged application lockfile and Cypress spec checks passed.
- Ran `npm run container` and used isolated equivalents of `npm run api` and
  `npm run service` to avoid the global `mh down`. Fresh seeded MongoDB and
  the Customer API backed the exact new Customer SPA ARM64 image; its running
  container’s image ID matched the local image ID. Ran the full
  `npm run cypress:run` at `http://localhost:8388/customer/` with Vite stopped.
  All 23 cases passed, including all eight deployment checks. The running
  container passed `nginx -t -c /tmp/nginx.conf`.
- The Developer Edition gateway configuration on isolated port 8080 served
  the shared-origin Customer page and runtime config. The prefixed API returned
  200 with the local test token and 401 without credentials.

### Image and scan evidence

Native ARM64 and emulated AMD64 application builds completed locally without
a registry push. `nginx -v` and `nginx -V` reported 1.30.7 on both final
images. The compiled capabilities include HTTP SSL, HTTP/2, HTTP/3, mail,
stream, and stream SSL preread. The effective configuration findings above
describe which of those features the SPA actually enables.

| Platform | Final local image ID |
| --- | --- |
| ARM64 | `sha256:2ca04556fd3a31d18c58ad8d3dcd6f1512fcaf32f3d8f64de8e1b318a62dcf13` |
| AMD64 | `sha256:7fd41542f5d16b7fe2cdd468dd833097675cd1afe150c17611e3a69c58bebca3` |

Trivy 0.76.2 scanned both final image archives using vulnerability DB schema
2, updated November 21, 2026 at 13:02 UTC and downloaded at 17:43 UTC. Both
Alpine 3.24.4 scans reported zero Nginx package findings and 12 separate
Alpine dependency findings each: five for libcrypto3, five for libssl3, one
for libxml2, and one for zlib. The libxml2 finding is high severity. Track
those dependency findings separately from this Nginx update. The binary
verification and upstream advisory check are independent of the package scan.

### Post-merge publication

After hosted CI publishes the image from main, record the GHCR multi-platform
index digest and both manifest digests. Pull the application by that immutable
digest for each platform and verify `nginx -v`, `nginx -V`, and the fresh
published-image scan against the pre-merge findings. Promote that same
application digest through environments. Keep issue 24 open until the
published evidence is verified.
