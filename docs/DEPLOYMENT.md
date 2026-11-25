# Run and deploy the demo

```sh
pnpm install --frozen-lockfile
pnpm demo
```

For the built demo:

```sh
pnpm build
NUXT_DEMO_MODE=true HOST=0.0.0.0 PORT=3000 node .output/server/index.mjs
```

The application needs no database, secrets or external integrations. Set `NUXT_DEMO_MODE=true` explicitly for synthetic demonstrations. Without it, data APIs return an unavailable state. A running process is not a saved deployment and may need restarting after a Cloud computer resumes.

The retained Dockerfile uses a frozen lockfile, Node 24 and a non-root runtime. Example after building the image: `docker run --rm -p 3000:3000 -e NUXT_DEMO_MODE=true zonhack-demo`. Container execution has not been validated here; see project status. No public deployment has been performed. The owner subsequently authorized a GitHub source handoff; see `DEVELOPER_HANDOFF.md` for the complete setup and publishing guide.

On Codex Cloud, open the app in the shared Cloud browser/desktop. For a hosted owner preview, configure HTTP Previews for port 3000 in the environment and apply it to this chat. Cloud localhost URLs refer to the Cloud computer, not the user's local browser. The app listens on 0.0.0.0 for an authorized preview connection.

Do not load real data into this public demo adapter. Complete authentication, trusted tenant scope, read-only source integration and financial reconciliation before commercial deployment. Production integrations, billing and scheduled delivery are separate services, not simulated background actions.

The repository includes `deliverables/zonhack-demo.html` for no-install review and `.github/workflows/ci.yml` for validation. CI builds/tests/exports only; it does not publish a website. See the root handoff guide for Node, Docker and static-demo paths and the remaining production requirements.
