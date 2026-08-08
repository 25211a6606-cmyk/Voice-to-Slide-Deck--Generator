# 🎙️ VoiceToSlide — AI-Powered Audio to PowerPoint Generator

Turn spoken knowledge into a professional PowerPoint in minutes. Upload audio (optionally a supporting PDF), pick how many slides you want, pay via the x402/Algorand TestNet flow using Lute Wallet, and receive an AI-generated .pptx that exactly matches the requested slide count.

---


Quick one-line summary
- VoiceToSlide converts uploaded audio into a validated slide deck (.pptx) using speech transcription, AI slide-structuring, and PptxGenJS for PowerPoint generation — with payments protected by the x402 + Algorand TestNet + Lute Wallet flow.

Table of contents
- Project status
- Architecture & high-level flow
- Project structure
- Component responsibilities
- Application flow (detailed)
- Technology stack
- Features
- Setup (local)
- Environment variables
- Important endpoints & health checks
- AI presentation pipeline & validation
- Error handling & troubleshooting
- Blockchain payment flow
- Security
- Hackathon / demo flow
- Why VoiceToSlide?
- Future improvements
- Git workflow
- License

---

Project status
- This repository represents an end-to-end working prototype / hackathon application that demonstrates transcription → AI slide generation → pptx creation with a protected payment path using Algorand TestNet and Lute Wallet. It is a prototype and not production-ready.

Architecture & high-level flow
- Frontend (Next.js, TypeScript, Tailwind) — user UI, uploads, preview, payment UI integration with Lute Wallet — localhost:5173
- Payment Gateway (Hono, TypeScript, x402 protection) — validates payment proofs, proxies/forwards authorized requests to AI backend — localhost:4020
- AI Backend (Express, Node.js) — speech transcription, optional PDF extraction, AI slide generation, PptxGenJS conversion, storage/serving of generated PPTX — localhost:4021

Logical flow (quick)
User → Frontend (upload + payment + wallet sign) → Payment Gateway (x402 verification) → AI Backend (transcribe → AI generate slides → validate → pptx) → Frontend preview → Download (.pptx)

ASCII diagram
```
User
  |
  v
Frontend (Next.js @ :5173)
  |-- Upload audio (+ optional PDF)
  |-- Request payment (x402) → Lute Wallet (Algorand TestNet)
  v
Payment Gateway (Hono @ :4020)  -- verifies payment proof (x402) --> AI Backend
                                                    |
                                                    v
                                             AI Backend (Express @ :4021)
                                                    |
                                                    v
                       Transcription -> AI slide generator -> PptxGenJS -> .pptx
                                                    |
                                                    v
                                              Frontend preview & download
```

Project structure
- Voice-to-Slide-Deck--Generator/
  - ai-backend/                # Express backend: transcription, AI, pptx generation, storage
  - payment-gateway/          # Hono-based payment gateway: x402 protection, payment verification, proxies
  - voice-to-slide-frontend/  # Next.js frontend app (upload, preview, wallet integration)
  - generate-samples.js       # (Utility script: sample generation or local testing harness)
  - .gitignore
  - README.md

(If your repo contains more or fewer files, use that actual layout — this README documents the intended structure and responsibilities.)

Component responsibilities

AI Backend (ai-backend/)
- controllers: Handle incoming API requests (e.g., create job, get result, health checks) and coordinate services.
- routes: Expose endpoints for the frontend/gateway to call (transcription, generate slides, serve generated PPTX).
- services:
  - transcription service: Accepts audio (multipart or URL), calls the configured speech-to-text provider to obtain a transcript. The transcript is the PRIMARY source of truth for slide generation.
  - PDF service: If a PDF is uploaded, extracts text and metadata to provide optional supporting context for the AI; must NOT override the audio transcript topic.
  - AI / GPT service: Accepts transcript (+ optional PDF context) and requested slide count and returns structured slide JSON (titles, bullet points, optionally visuals/layout hints).
    - NOTE: Do not claim a model by name unless present in the code; the backend uses whatever AI integration is configured via environment variables.
  - presentation generation: Converts structured slide JSON into an actual .pptx using PptxGenJS, ensuring the generated file contains exactly the requested number of slides.
  - storage service: Temporarily stores generated PPTX files and serves download URLs (or streams) to the frontend. Implements cleanup as needed.

Payment Gateway (payment-gateway/)
- environment configuration: Loads Algorand & x402-related secrets from environment variables (locally via .env).
- payment configuration: x402 middleware configuration and payment verification logic for Algorand TestNet.
- x402 middleware: Validates incoming HTTP requests that must be backed by a valid payment proof. Rejects or forwards based on verification.
- health route: Basic health endpoint for service readiness.
- transcription / slide-generation route(s): Protected by x402 — accept requests only with a verified payment proof, then forward or call the AI backend as appropriate.
- AI proxy: When authorized, the gateway proxies requests to the AI backend to keep AI endpoints protected behind payment.

Frontend (voice-to-slide-frontend/)
- Major pages / components:
  - Home: Project introduction and start point.
  - Upload: Upload inputs for audio file and optional PDF, slide count selector.
  - Preview: Renders the generated slides (preview uses the same generated JSON as PPTX).
  - Download: Download button for the final .pptx.
  - UploadCard: Component to accept/upload audio and optional PDF.
  - TranscriptView: Shows the AI or raw transcript derived from uploaded audio.
  - SlideCard: UI representation of each generated slide (title, bullets, visual hint).
  - DownloadButton: Triggers download of the generated .pptx (same data as preview).
  - X402PaywallModal: Payment modal that begins x402 flow and triggers Lute Wallet interaction.
  - Lute Wallet integration: Connects to Lute Wallet for Algorand TestNet signing of x402 transactions.
  - API service: Client library used to call local Payment Gateway endpoints, handle auth/payment proof headers, and fetch generation results.

Application flow — detailed (what happens at every stage)
1. User chooses audio file (and optionally a supporting PDF) and the desired slide count in the frontend Upload page.
2. Frontend uploads audio/PDF to the frontend server or passes them to the Payment Gateway depending on implementation. Typically the frontend sends an initial request to the Payment Gateway for a protected generation request.
3. Payment: Frontend triggers x402 payment flow:
   - X402 flow requests a payment proof via the Payment Gateway.
   - Lute Wallet is invoked (user-facing wallet) to sign an Algorand TestNet transaction.
   - User approves the transaction in Lute Wallet.
   - Wallet returns a signed transaction/proof to the frontend.
4. The frontend sends the signed proof + audio/PDF metadata to the Payment Gateway endpoint.
5. Payment Gateway verifies payment proof with Algorand TestNet and its x402 middleware:
   - If invalid, returns HTTP 402 (Payment Required) or an error.
   - If valid, forwards or issues an authorized request to the AI Backend.
6. AI Backend:
   - Accepts the audio (or a reference URL) and optional PDF.
   - Runs speech transcription (speech-to-text).
   - Performs optional PDF text extraction (PDF is secondary; only supports extra context).
   - Passes transcript + optional PDF context + requested slide count to AI slide generation service.
   - Validates AI response structure and ensures the requested slide count is satisfied.
   - Converts validated slide JSON into a .pptx file using PptxGenJS.
   - Stores the .pptx and returns a URL or streams it back via the gateway.
7. Frontend receives slide JSON for immediate preview (same data used for the downloaded .pptx).
8. User previews slides, and if satisfied, clicks Download to retrieve the exact .pptx file with the requested number of slides.

Why the transcript is primary
- The system uses the audio transcript as the PRIMARY source of truth for topic, slide titles, and bullet points. Any optional PDF is only supporting context and cannot override or replace the topic deduced from audio.

Technology stack (table)

| Technology | Purpose |
|---|---|
| Next.js | Frontend framework and server-side rendering for the UI |
| React | UI component library used in the frontend |
| TypeScript | Static typing across frontend, backend, and gateway |
| Tailwind CSS | Styling for the frontend |
| Node.js | Runtime for backend services |
| Express | AI Backend HTTP server |
| Hono | Lightweight framework used for the Payment Gateway |
| AI speech transcription (configured provider) | Converts audio → transcript |
| AI language model (configured provider) | Generates structured slide JSON from transcript |
| PDF parser (configured library) | Extracts text from optional PDFs |
| PptxGenJS | Converts structured slides → .pptx files |
| x402 | Payment protection middleware / protocol used to gate AI endpoints |
| Algorand TestNet | Blockchain network used for test payments |
| Lute Wallet | Wallet used for signing Algorand TestNet transactions |
| Git | Version control |
| GitHub | Repository hosting |

Features
- Audio upload (user-supplied audio is the authoritative source)
- Speech transcription (speech → text)
- AI-based topic understanding and slide generation
- Dynamic slide count (user-requested slide count is strictly enforced)
- Optional PDF for additional context (secondary to audio)
- AI-generated slide content (titles + bullets + visual hints)
- PPT generation via PptxGenJS (downloadable .pptx)
- Presentation preview in frontend (same data used for .pptx)
- Relevant visual support hints in generated JSON (if supported) — visuals are topic-based; no external image search claimed unless implemented
- x402 payment protection
- Algorand TestNet + Lute Wallet signing flow
- Error handling in each stage of pipeline
- End-to-end workflow demonstrating AI + Web + Blockchain integration

Setup — Local development
Requirements
- Node.js (recommended LTS)
- npm (or yarn)
- Git
- Lute Wallet (browser extension or compatible wallet for Algorand TestNet)
- Basic familiarity with running multiple services locally

Clone repository
```bash
git clone https://github.com/25211a6606-cmyk/Voice-to-Slide-Deck--Generator.git
cd Voice-to-Slide-Deck--Generator
```

Per-service install & run
> Note: Use the actual npm scripts in each package.json if they differ. If a service has different startup scripts (e.g., `dev`, `start`, `serve`) use what’s present in the package.json.

1) AI Backend
```bash
cd ai-backend
npm install
# typical dev command (if package.json provides it)
npm run dev
# or to run production/start
npm start
```
- Exposes AI endpoints and PPTX generation (expected at http://localhost:4021 by default).

2) Payment Gateway
```bash
cd ../payment-gateway
npm install
npm run dev   # or npm start depending on package scripts
```
- Runs Hono gateway on http://localhost:4020 by default.
- Health endpoint: GET http://localhost:4020/health (expected response below)

3) Frontend
```bash
cd ../voice-to-slide-frontend
npm install
npm run dev   # Next.js dev server, usually at http://localhost:5173
# or npm start for a production-style run
```

Health endpoint (Payment Gateway)
- GET http://localhost:4020/health
- Expected JSON response:
```json
{
  "status": "ok"
}
```

Environment variables & .env
- Do NOT commit API keys, secrets, wallet keys, or private keys.
- Use .env files locally and add them to .gitignore.
- Example placeholders (do not use real secrets):

```
# ai-backend/.env
OPENAI_API_KEY=your_openai_api_key_here
SPEECH_PROVIDER_API_KEY=your_speech_api_key_here
STORAGE_DIR=./storage
PORT=4021

# payment-gateway/.env
ALGOD_API_KEY=your_algod_api_key_here
X402_SHARED_SECRET=your_x402_shared_secret_here
ALGOD_NET=testnet
PORT=4020

# voice-to-slide-frontend/.env
NEXT_PUBLIC_API_GATEWAY=http://localhost:4020
NEXT_PUBLIC_PAYMENT_AMOUNT=100000  # example microAlgos amount for test flows
```

- Never commit .env files or any real credentials. If you accidentally commit secrets, rotate them immediately.

Important endpoints (what to check in code)
- Payment Gateway
  - GET /health — healthcheck (not protected)
  - Payment-protected endpoints (x402 middleware) that accept the signed proof + payload and forward/trigger AI generation (names vary; check the gateway routes for exact paths). These routes are intended to be protected — unauthorized requests should fail with HTTP 402 or 401 depending on verification.

- AI Backend
  - Transcription & generation endpoints — typically accept audio or audio URL + optional PDF and a requested slide count. Implementation details (path names and method signatures) are in ai-backend/routes — please inspect those files for exact information.

Important: Only the /health endpoint response is guaranteed by the repository notes above. For precise route names and request bodies, check the corresponding route files in ai-backend/ and payment-gateway/ — this README intentionally avoids inventing exact endpoint paths where they are not explicitly specified in source.

AI presentation pipeline (full)
1. Audio (user upload)
2. Speech Transcription → transcript (PRIMARY)
3. Optional PDF text extraction → supporting context (SECONDARY)
4. Transcript + Optional PDF context → AI slide generator
5. Requested Slide Count Validation → ensure exactly N slides
6. Structured Slide JSON → PptxGenJS
7. .pptx file generated (exactly N slides)
8. Frontend preview (renders same structured JSON)
9. Download (.pptx)

Why the transcript is primary
- The audio transcript contains the user's actual content and intent. The AI slide generation must base slide titles and bullets primarily on transcript content. The optional PDF supplements but cannot override the transcript's detected topic.

Quality & validation (what the system checks)
- Audio transcription present and non-empty
- Transcript coherency (basic validation)
- AI response conforms to expected JSON schema (e.g., slide objects, title, bullets)
- Requested slide count matches the number of slides in AI response
- Slide titles and bullet points are non-empty
- PPT generation completes successfully and contains the expected number of slides
- Preview JSON and generated .pptx are consistent

Error handling — common issues & troubleshooting
- Backend not running
  - Symptom: frontend shows errors when calling API or 500 responses
  - Fix: Start ai-backend and payment-gateway; check logs, run `npm run dev` or `npm start` as appropriate.
- Payment returns 402
  - Symptom: Payment Gateway rejects request with HTTP 402
  - Fix: Ensure wallet transaction was signed correctly, Algorand TestNet chosen in wallet, and gateway x402 config matches signing flow.
- Wallet signing failure
  - Symptom: Wallet refuses transaction or user cancels
  - Fix: Ensure Lute Wallet is connected, account selected, and network set to Algorand TestNet.
- Missing API key
  - Symptom: 401 / provider errors for transcription or AI
  - Fix: Add provider keys to .env and restart services.
- Empty transcript
  - Symptom: AI generation fails or returns invalid content
  - Fix: Re-upload audio, check transcription logs, ensure audio quality/format is supported.
- Invalid AI response (wrong structure)
  - Symptom: Generation fails validation
  - Fix: Inspect AI service logs and adjust prompt/template or validation logic.
- Incorrect slide count
  - Symptom: Generated deck has different number of slides
  - Fix: Validation should reject; check generation logic and enforce N slides before PPT conversion.
- PPT generation failure
  - Symptom: Error while using PptxGenJS
  - Fix: Check structured JSON, remove unsupported elements, validate resources, and review PptxGenJS usage in presentation generation service.

Blockchain payment flow (detailed)
1. Frontend triggers x402 protected request to the Payment Gateway.
2. Payment Gateway responds with payment challenge or expects a signed transaction proof.
3. Frontend uses Lute Wallet (Algorand TestNet) to sign the payment transaction.
4. User signs the transaction via Lute Wallet UI.
5. Wallet returns a signed-proof to the frontend.
6. Frontend forwards the signed payment proof to the Payment Gateway.
7. Payment Gateway verifies the proof on Algorand TestNet and accepts or rejects.
8. If verified, Payment Gateway forwards the authorized request to AI Backend / initiates the generation flow.
9. AI Backend processes request and returns generated content.

- HTTP 402: indicates payment required or invalid/absent payment proof. Do not bypass the payment gateway — the x402 protocol is designed to gate expensive AI operations.

Security & best practices
- Never commit .env files, API keys, or wallet private keys.
- Keep production secrets out of Git and ENV files in CI/CD secret stores.
- For local development use Algorand TestNet — do not use MainNet keys in development.
- Use environment variables for all secrets and configuration.
- Validate incoming files and sanitize any user-provided data.
- Limit storage retention for generated artifacts and audit access.

Hackathon / demo flow (concise)
1. Start all three services locally (frontend :5173, gateway :4020, ai-backend :4021).
2. Open http://localhost:5173.
3. Upload an audio recording (short demo speech).
4. Optionally upload a PDF to provide supporting context.
5. Enter desired slide count (e.g., 5).
6. Click Generate — X402Paywall modal appears.
7. Connect Lute Wallet and approve Algorand TestNet transaction.
8. Wait for transcription and AI processing to finish.
9. Preview the generated slides and confirm the topic matches audio.
10. Verify exactly N slides generated.
11. Download the .pptx and open in PowerPoint or compatible viewer.

Why VoiceToSlide?
- Problem solved: Converting spoken knowledge (lectures, pitches, ideas) into a structured, presentation-ready format is time-consuming. VoiceToSlide automates transcription, topic understanding, and slide creation while ensuring the user's spoken content remains authoritative.
- Hackathon value: Demonstrates AI + speech understanding + document context + automated presentation generation + blockchain-protected monetization in a single, demonstrable flow.

Future improvements (realistic & actionable)
- Additional presentation themes and styling templates
- Automated visual generation (topic-relevant images) with attribution and ethical controls
- Charts & simple diagrams generated from data in audio or provided PDFs
- Speaker notes extraction from transcript
- Multi-language transcription & translation
- Improved PDF semantic retrieval (local embeddings)
- Cloud deployment with scalable worker queues
- Authentication & user accounts
- Collaboration & slide editing
- Analytics on deck usage and generation quality
- Move x402 to production-ready payment integration and Algorand mainnet support (with security review)

Git workflow (quick)
```bash
git status
git add .
git commit -m "Describe changes"
git push
```
- Never commit API keys or private wallet keys.

License
- If this repository does not include a LICENSE file, then no open-source license has been explicitly granted. Add an appropriate license (MIT, Apache-2.0, etc.) if you want to define reuse and distribution terms.

Final notes & recommendations
- Confirm exact API paths and npm scripts by inspecting each service's package.json and route files:
  - ai-backend/package.json
  - payment-gateway/package.json
  - voice-to-slide-frontend/package.json
  - ai-backend/routes/* and payment-gateway/routes/*
- Keep secrets local and ephemeral. Use the configuration placeholders in .env only for local testing and use CI/CD secret stores for deployments.
- The generated .pptx must always contain the exact number of slides requested: ensure strict validation between AI output and PptxGenJS conversion.
- The audio transcript is the authoritative source; optional PDFs only supply supporting context.

If you want, I can:
- Draft example .env templates for each subproject with placeholder keys only,
- Produce a quick checklist for testing the payment flow locally with Algorand TestNet and Lute Wallet,
- Or generate example request / response JSON schemas for the AI slide JSON format used by the presentation generator.

Enjoy building — this project showcases a compelling intersection of AI, speech, document context, and blockchain protections suitable for a standout hackathon demo.
