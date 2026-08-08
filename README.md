Create a comprehensive, professional, hackathon-ready README.md for my GitHub repository "Voice-to-Slide-Deck--Generator".

Write the ENTIRE README as one complete document. Do not give me instructions about how to write it. Do not give me multiple versions. Directly produce the final README content that I can copy into README.md.

The README must accurately describe the current project and its architecture.

PROJECT:

VoiceToSlide is an AI-powered web application that converts a user's uploaded audio into a professional PowerPoint presentation.

The user can:
- Upload an audio file containing their explanation, lecture, idea, or topic.
- Optionally upload a PDF containing supporting information.
- Specify the number of slides they want.
- Pay through the x402 payment flow using Algorand TestNet and Lute Wallet.
- Have the audio transcribed.
- Have AI understand the audio topic and generate the requested number of slides.
- Preview the generated presentation.
- Download the final PowerPoint (.pptx).

IMPORTANT CONTENT RULE:

The uploaded AUDIO is the PRIMARY source of truth.

The presentation topic, slide titles, bullet points, and overall presentation content must be based on the actual uploaded audio transcript.

The PDF is OPTIONAL and SECONDARY. If a PDF is uploaded, it should only be used as supporting information and must not override or replace the topic from the audio.

The system must not use hardcoded/demo topics, previous conversations, cached content, or unrelated sample presentations.

SLIDE COUNT:

The number of slides is dynamic.

The user can request any valid number of slides.

For example:
- User requests 3 → generate exactly 3 slides.
- User requests 5 → generate exactly 5 slides.
- User requests 8 → generate exactly 8 slides.
- User requests 10 → generate exactly 10 slides.

Do not describe the project as always generating 5 slides.

Explain that the requested slide count flows from the frontend to the AI generation pipeline and is validated before PowerPoint generation.

POWERPOINT:

Explain that AI-generated structured slide data is converted into an actual .pptx PowerPoint using PptxGenJS.

The downloaded PowerPoint must contain exactly the number of slides requested by the user.

The frontend preview and downloaded PowerPoint should use the same generated slide data.

VISUALS:

Explain that the presentation can contain relevant visual elements/images based on the actual topic of the uploaded audio.

Do not claim that external image generation or image search is implemented unless it actually exists in the repository.

If the current implementation uses visual layouts, icons, shapes, or images, describe them accurately without exaggerating capabilities.

BLOCKCHAIN:

The project contains a working x402 payment system.

Explain:

- x402 payment protocol
- Algorand TestNet
- Lute Wallet
- Payment Gateway
- Transaction signing
- Payment verification
- Protected AI endpoints

The blockchain/payment implementation must be described as a separate layer from AI presentation generation.

Architecture:

Frontend:
- Next.js
- TypeScript
- Tailwind CSS
- Runs on localhost:3000

Payment Gateway:
- Hono
- TypeScript
- x402
- Algorand TestNet
- Runs on localhost:4020

AI Backend:
- Express
- Node.js
- Speech transcription
- AI slide generation
- PDF text extraction
- PptxGenJS
- Runs on localhost:5000

PROJECT STRUCTURE:

Describe this structure:

Voice-to-Slide-Deck--Generator/
├── ai-backend/
├── payment-gateway/
├── voice-to-slide-frontend/
├── generate-samples.js
├── .gitignore
└── README.md

Explain the important directories and files based on the actual project structure.

AI BACKEND:

Explain the responsibilities of:
- controllers
- routes
- services
- transcription service
- PDF service
- AI/GPT service
- presentation generation
- storage service

PAYMENT GATEWAY:

Explain the responsibilities of:
- environment configuration
- payment configuration
- x402 middleware
- health route
- transcription route
- slide-generation route
- AI proxy

FRONTEND:

Explain the major pages/components such as:
- Home
- Upload
- Preview
- Download
- UploadCard
- TranscriptView
- SlideCard
- DownloadButton
- X402PaywallModal
- Lute Wallet integration
- API service

APPLICATION FLOW:

Clearly explain the complete flow:

User
→ Frontend
→ Audio/PDF upload
→ x402 payment
→ Lute Wallet
→ Algorand TestNet
→ Payment Gateway
→ AI Backend
→ Audio transcription
→ Optional PDF extraction
→ AI slide generation
→ Requested slide count validation
→ PptxGenJS
→ PowerPoint
→ Frontend preview
→ Download

Explain what happens at every stage.

TECHNOLOGY STACK:

Create a clear table containing:
Technology
Purpose

Include:
- Next.js
- React
- TypeScript
- Tailwind CSS
- Node.js
- Express
- Hono
- AI speech transcription
- AI language model
- PDF parser
- PptxGenJS
- x402
- Algorand TestNet
- Lute Wallet
- Git
- GitHub

Do not claim a specific AI model name unless it is actually confirmed by the project code.

FEATURES:

Include a strong feature list covering:
- Audio upload
- Speech transcription
- AI topic understanding
- Dynamic slide count
- Optional PDF support
- AI-generated slide content
- Professional PPT generation
- Relevant visual support
- Presentation preview
- PPT download
- x402 payment
- Algorand TestNet
- Lute Wallet
- Error handling
- End-to-end workflow

SETUP:

Provide clear instructions for cloning and running the project.

Repository:

https://github.com/25211a6606-cmyk/Voice-to-Slide-Deck--Generator.git

Explain that the project requires Node.js and npm.

Provide installation instructions for:

1. ai-backend
2. payment-gateway
3. voice-to-slide-frontend

Provide commands such as:

git clone ...
cd Voice-to-Slide-Deck--Generator

Then separate installation and startup instructions for each service.

Use the actual scripts from package.json if they can be determined from the repository. Do not invent commands.

ENVIRONMENT VARIABLES:

Explain that API keys and secrets must NOT be committed to GitHub.

Explain .env usage.

Show a safe example using placeholder values only:

OPENAI_API_KEY=your_key_here

Do not include real API keys.

Mention that .env files should remain local and are protected by .gitignore.

Do not expose wallet private keys or payment secrets.

LOCAL DEVELOPMENT:

Explain the expected local services:

Frontend:
http://localhost:3000

Payment Gateway:
http://localhost:4020

AI Backend:
http://localhost:5000

Explain the health endpoint:

GET http://localhost:4020/health

Expected response:

{
  "status": "ok"
}

API:

Document the important endpoints that actually exist in the project.

For each endpoint include:
- Method
- Path
- Purpose
- Whether it is protected by x402

Only document endpoints that are actually present in the code.

Do not invent API endpoints.

AI PRESENTATION PIPELINE:

Explain this clearly:

Audio
↓
Speech Transcription
↓
Transcript
↓
Optional PDF Text Extraction
↓
Transcript + Supporting PDF Context
↓
AI Slide Generation
↓
Requested Slide Count Validation
↓
Structured Slide JSON
↓
PptxGenJS
↓
.pptx
↓
Preview + Download

Explain why the transcript is the primary source.

QUALITY AND VALIDATION:

Explain that the system should validate:
- Audio transcription
- Non-empty transcript
- AI response structure
- Requested slide count
- Slide titles
- Slide bullet points
- PPT generation
- Preview consistency

Explain that the system should not fall back to fake/demo presentations if generation fails.

ERROR HANDLING:

Include common issues such as:
- Backend not running
- Payment returns 402
- Wallet signing failure
- Missing API key
- Empty transcript
- Invalid AI response
- Incorrect slide count
- PPT generation failure

Give concise explanations and troubleshooting commands where appropriate.

BLOCKCHAIN PAYMENT FLOW:

Explain this clearly:

Frontend
↓
x402 protected request
↓
Lute Wallet
↓
User signs Algorand TestNet transaction
↓
Payment proof
↓
Payment Gateway
↓
Payment verification
↓
AI Backend
↓
AI service

Explain that HTTP 402 means payment is required or a valid payment proof has not been provided.

Do not provide instructions for bypassing payment.

SECURITY:

Include:
- Never commit .env files
- Never expose API keys
- Never expose wallet private keys
- Use environment variables
- Keep production secrets outside Git
- Use appropriate network configuration
- Use Algorand TestNet for development/testing

HACKATHON VALUE:

Explain the project's value as the combination of:

AI
+
Speech Understanding
+
Document Context
+
Automated Presentation Generation
+
Blockchain Payments

Explain the problem being solved and why the application is useful.

Include a section called "Why VoiceToSlide?" explaining that users can turn spoken knowledge into structured presentations without manually creating every slide.

DEMO FLOW:

Provide a simple hackathon demonstration flow:

1. Open the application.
2. Upload an audio recording.
3. Optionally upload a PDF.
4. Select the desired number of slides.
5. Connect Lute Wallet.
6. Approve the Algorand TestNet payment.
7. Wait for transcription and AI processing.
8. Review the generated presentation.
9. Verify that the topic matches the audio.
10. Verify that the requested number of slides was generated.
11. Download the PowerPoint.

PROJECT STATUS:

Describe the project as an end-to-end working prototype/hackathon application, but do not claim production readiness unless supported by the code.

FUTURE IMPROVEMENTS:

Suggest realistic future improvements such as:
- More presentation themes
- Better visual generation
- Charts and diagrams
- Speaker notes
- Multi-language support
- Improved PDF semantic retrieval
- Cloud deployment
- Authentication
- Collaboration
- Analytics
- Production blockchain deployment

Do not claim these features already exist.

GIT WORKFLOW:

Include basic commands:

git status
git add .
git commit -m "Describe changes"
git push

Explain that API keys must never be committed.

LICENSE:

Do not invent a license if one does not exist.

State that the project currently does not specify a license if appropriate.

IMPORTANT WRITING STYLE:

Make the README:
- Professional
- Detailed
- Easy for judges to understand
- Easy for developers to set up
- Well organized
- Visually attractive using Markdown
- Use headings
- Use tables
- Use code blocks
- Use diagrams using ASCII/Markdown where useful
- Use emojis sparingly
- Clearly separate AI, frontend, payment, and blockchain responsibilities

Start with:

# 🎙️ VoiceToSlide — AI-Powered Audio to PowerPoint Generator

Then include a strong one-line description.

Do not include fictional claims.

Do not expose secrets.

Do not claim features that are not implemented.

The final output must be ONE COMPLETE README.md document and nothing else.
