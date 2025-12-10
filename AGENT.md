# AGENT NOTES FOR DONEZO

These notes help GitHub Copilot CLI run accurate commands in this repository.

## Project Snapshot
- **App**: Doink/Donezo – React 18 + Vite frontend with Tailwind, Framer Motion, Lucide, AWS Amplify Gen 2 backend (in `amplify/`).
- **Data**: AWS DynamoDB + Cognito via Amplify Data (see `amplify/data/resource.ts`) and custom `src/services/*` clients.
- **Key features**: Lists, todos, recurring tasks (recurrence JSON stored as AWSJSON), reminders, theming.

## Repo Layout Highlights
- `src/` – React app, `App.jsx` + modal components, `services/` for AWS calls, `utils/recurringTaskUtils.js` for scheduling.
- `amplify/` – Gen 2 backend definition; deploy with Amplify CLI.
- `aws-setup/` – Legacy helper scripts to provision DynamoDB + Cognito manually.
- Docs: `README.md`, `AWS_SETUP.md`, `MIGRATION.md`, platform-specific setup files.

## Environment & Credentials
1. Copy `.env.example` → `.env.local` and fill AWS secrets:
   ```env
   VITE_AWS_REGION=us-east-1
   VITE_AWS_COGNITO_USER_POOL_ID=<pool>
   VITE_AWS_COGNITO_CLIENT_ID=<client>
   VITE_AWS_DYNAMODB_TABLE_NAME=donezo-app
   VITE_AWS_ACCESS_KEY_ID=<key>
   VITE_AWS_SECRET_ACCESS_KEY=<secret>
   ```
2. Configure AWS CLI (`aws configure`) or export env vars before running backend commands.
3. IAM permissions must include DynamoDB CRUD + Cognito auth flows (see `AWS_SETUP.md`).

## Common Commands
| Purpose | Command |
| --- | --- |
| Install deps | `npm install` |
| Local dev (Vite) | `npm run dev` then open `http://localhost:3000` |
| Prod build | `npm run build` |
| Lint | `npm run lint` |
| Provision DynamoDB | `npm run setup:dynamodb` |
| Provision Cognito | `npm run setup:cognito` |
| Both AWS resources | `npm run setup:aws` |
| Amplify sandbox deploy (single run) | `npm run sandbox` (`npx ampx sandbox --once`) |
| Sandbox deploy without external providers | `npm run sandbox:local` |
| Delete sandbox env | `npm run sandbox:delete` |

## Amplify Backend Workflow
- Run from repo root with access to AWS credentials.
- `npx ampx sandbox --once` deploys backend code in `amplify/` to your personal cloud sandbox once and then exits (no file watching). This is the recommended flow for local backend validation or CI. See the Amplify Gen 2 CLI docs for sandbox options and troubleshooting (https://docs.amplify.aws/react/deploy-and-host/sandbox-environments/setup/).
- Use `npx ampx sandbox` *without* `--once` when you want watch-mode redeployments.
- Pass `--profile <aws-profile>` or set `AWS_REGION`/`AMPLIFY_EXTERNAL_PROVIDERS=false` (see `package.json` scripts) when needed.

## Data & Recurrence Gotchas
- `recurrence` attribute must be serialized JSON when sent to Amplify (see `src/services/dataService.js` helpers). Returning data is parsed before React components consume it.
- Recurring instances copy parent recurrence metadata; `calculateNextDueDate` + `generateRecurringInstances` expect normalized objects. Always set `recurrence.interval`, `type`, `days` (if custom), `end`, `endValue`.
- Default lists/settings come from `DEFAULT_LISTS` / `DEFAULT_SETTINGS` in `dataService`.

## Debug Tips
- If todo creation fails with `Variable 'recurrence' has an invalid value`, ensure the payload is a JSON string (handled via `formatRecurrenceInput`).
- AWS auth errors typically trace back to missing `VITE_AWS_COGNITO_CLIENT_ID` or outdated sandbox resources; re-run `npm run sandbox` after backend schema edits.
- For sandbox errors like `ParameterNotFound`, verify the AWS profile has AmplifyBackendDeployFullAccess or equivalent.

## Useful References
- Amplify sandbox environments walkthrough: https://docs.amplify.aws/react/deploy-and-host/sandbox-environments/setup/
- Account setup & credential troubleshooting: https://docs.amplify.aws/react/start/account-setup/

Keep this file updated whenever workflows change so Copilot CLI can act reliably.
