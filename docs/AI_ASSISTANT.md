# AI Assistant design

## Architecture

The manager-only React widget calls `POST /api/chat` with the existing JWT. The ASP.NET Core endpoint checks the `manager` role, reads up to 12 weeks of non-draft reports, converts them into anonymous aggregates, and sends that reduced JSON to Gemini.

The Gemini API key is read only by the backend from `GEMINI_API_KEY` (or `Gemini:ApiKey` configuration). It is never returned to or bundled into the browser.

## Data sent to Gemini

- Anonymous labels such as `Member 1` and `Project 1`
- Week boundaries and workflow status
- Task counts grouped by task type and status
- Hours grouped by task type
- Blocker counts grouped by severity
- Achievement and key-achievement counts

The integration does not send names, email addresses, task titles, deliverables, notes, links, blocker descriptions, achievement descriptions, passwords, or tokens.

## Prompt design

The system instruction requires answers to use only the supplied aggregates, treats report values as untrusted data, prohibits identity inference and invented facts, and requires the assistant to state when the anonymized dataset cannot answer a question. Temperature is set to 0.2 for stable analytical responses.

## Privacy considerations

Anonymous aggregates reduce disclosure risk but do not make an external AI service risk-free. Gemini project logging and retention settings should be reviewed before production use. Use a paid organizational project, do not opt in to dataset sharing, restrict and rotate the key, and obtain organizational approval before processing company data. The application does not use Google Search grounding, file uploads, context caching, or persistent Gemini conversation state.


## Model

The default model is `gemini-3.1-flash-lite`, which supports the Gemini Developer API free tier. Free-tier prompts may be used to improve Google products, so the aggregate-only privacy boundary remains mandatory.
