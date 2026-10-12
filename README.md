# Smart Pantry Pro

Build an MVP UI for a Receipt-to-Fridge App

Act as a senior product designer and frontend engineer. Design and implement a polished, realistic MVP for a consumer app that automatically converts grocery receipts into a digital household food inventory.

The goal is to create a visually impressive, usable prototype that feels like a real startup product ready for early user testing, not a generic AI-generated dashboard.

1. Product concept

The app helps people reduce food waste and save money by making it easy to know what food they have at home.

Core user flow:

The user scans or uploads a grocery receipt.

The app extracts products and their quantities.

The user quickly reviews and confirms the detected items.

The products are added to their fridge, freezer, or pantry.

The app shows which products should be used soon.

The user marks products as consumed, frozen, or discarded.

The initial target market is Poland. Use Polish UI copy and realistic examples of products and grocery receipts from Polish supermarkets.

2. Tech stack

Use the existing project stack if one is already configured. Otherwise use:

Next.js App Router

TypeScript

Tailwind CSS

shadcn/ui

Lucide icons

Keep components modular, maintainable, and ready for future backend integration.

Do not install unnecessary dependencies. Use the existing package manager and follow the project's conventions.

3. Visual direction

Create a premium, warm, modern consumer-product aesthetic.

Design principles:

Clean and minimal, with excellent visual hierarchy.

Warm off-white background rather than pure white everywhere.

Deep forest green as the primary brand color.

Muted sage accents, subtle borders, and restrained shadows.

Generous spacing and carefully aligned elements.

Rounded cards and controls, but avoid excessive pill shapes.

Strong typography, clear labels, readable secondary text.

Beautiful empty states, feedback states, and loading states.

Use small, tasteful food photography or product thumbnails only where they add real value.

Use Lucide icons consistently.

Avoid:

Generic AI dashboard aesthetics.

Excessive gradients, glassmorphism, neon colors, and floating decorations.

Huge hero sections that waste space in the actual app.

Emoji as the main interface icon system.

Too many cards, charts, badges, and decorative statistics.

Fake functionality represented by buttons that do nothing.

The app should feel closer to a carefully designed premium lifestyle product than an enterprise admin panel.

4. Main application layout

Build a responsive application with:

Desktop:

A compact left sidebar with logo, navigation, and a clear primary action to scan a receipt.

A main content area with consistent spacing and a sensible maximum width.

A top bar containing the page title, household context, and user menu.

Mobile:

A mobile-first layout with bottom navigation or another compact navigation pattern.

A prominent, easily accessible receipt-scanning action.

Cards and controls optimized for touch.

No horizontal overflow.

Navigation:

Overview

My food

Use soon

Scan receipt

Shopping list

Settings

Only implement fully functional prototype flows for the MVP-critical features. Other navigation items can show small, coherent placeholder screens.

5. Screen 1: Overview

This is the primary screen and should receive the most design attention.

Include:

Header

A friendly, understated greeting in Polish, such as:
"Cześć! Co dziś zjemy?"

Supporting text:
"Masz wszystko pod kontrolą. Zobacz, co warto wykorzystać."

Summary

Show three compact metrics:

Products currently at home.

Products that should be used soon.

Estimated value of products used or saved, if this can be clearly explained.

Use realistic sample data, for example:

24 produkty w domu

4 produkty do wykorzystania

86 zł wartości wykorzystanej żywności

Label estimates honestly. Do not imply precise financial savings without evidence.

Use soon section

This is the most important section.

Display a short, prioritized list of products that should be used soon. Each row should include:

Product image or tasteful thumbnail.

Product name.

Quantity.

Storage location.

Estimated freshness or expiry information.

A quick action to mark it as consumed.

Use realistic examples:

Mleko 2%, 1 l

Szpinak, 150 g

Pierś z kurczaka, 500 g

Jogurt naturalny, 2 szt.

Make urgency understandable without relying only on color.

Recently added

Show the latest items added from a scanned receipt, with a small indication of the receipt source.

Primary action

A prominent button:
"Skanuj paragon"

Secondary action:
"Dodaj produkt"

The receipt-scanning action must be visually dominant without overpowering the rest of the screen.

6. Screen 2: My food

Create a clean inventory view with:

Search.

Filters for fridge, freezer, and pantry.

Category filters.

A list/grid toggle only if it genuinely improves usability.

Product rows or cards showing quantity and freshness.

Quick actions to mark an item as consumed, frozen, or discarded.

An easy way to add a product manually.

Use a realistic but manageable sample inventory.

Make the interface useful with 20 to 30 sample products, without making the page feel cluttered.

Support search and filtering in the prototype.

7. Screen 3: Receipt scanning and review

This is the signature feature. Design it as a polished, multi-step flow.

Step A: Upload

Provide an obvious dropzone and upload button, plus a mobile-friendly camera/upload affordance.

Polish copy:
"Zamień paragon w zapasy"
"Zrób zdjęcie lub wybierz plik. Resztę przygotujemy za Ciebie."

Allow the user to select a sample receipt if camera capture or OCR is not configured.

Step B: Processing

Show a convincing processing state with clear progress feedback:

Odczytywanie paragonu

Rozpoznawanie produktów

Przygotowywanie listy

Do not simulate an endless loading state.

Step C: Review detected items

Display extracted items in an editable table or mobile-friendly list.

Include:

Product name.

Quantity.

Optional price.

Storage destination.

A confidence or review indicator only when useful.

Allow the user to:

Edit a product name.

Change the quantity.

Change storage location.

Remove an incorrectly detected item.

Add a missing item.

Include a realistic sample Polish receipt with typical product names, decimal commas, weights, and prices.

Use example items such as:

MLEKO UHT 2% 1L

POMIDOR MALINOWY

FILET Z KURCZAKA

JOGURT NATURALNY

CHLEB ŻYTNI

Clearly distinguish between actual OCR results and sample/demo data.

Step D: Confirmation

Show a concise summary and a clear action:
"Dodaj produkty do lodówki"

After confirmation, update the inventory and show a success state.

The entire flow must work with sample data, even without a real OCR service.

8. Screen 4: Use soon

Create a focused screen for reducing food waste.

Group products into:

Warto wykorzystać dzisiaj

Na najbliższe dni

Bez pilnego terminu

Show the estimated freshness window, not a falsely precise expiry date when it is unknown.

Each item should support:

Mark as consumed.

Mark as frozen.

Adjust the estimated date.

Use neutral and accessible visual indicators. Avoid making every item look like an emergency.

Include a compact, useful empty state when no items require attention.

9. Interaction requirements

The prototype must be interactive, not just a static mockup.

Implement:

Navigation between screens.

Search and inventory filters.

Receipt upload or sample receipt selection.

Editable receipt items.

Adding confirmed products to inventory.

Marking products as consumed.

Moving products to the freezer.

Adding a product manually.

Toasts or clear inline feedback.

Empty states where appropriate.

Use local mock data and client-side state. Persisting to a database is not required for this design prototype.

Do not implement fake authentication, billing, AI chat, or unnecessary features.

10. Data model

Use TypeScript types similar to:

Product:

id

name

quantity

unit

category

storageLocation

addedAt

estimatedUseBy

freshnessConfidence

sourceReceiptId

status

Receipt:

id

storeName

purchaseDate

total

items

processingStatus

Keep the model simple. Avoid unnecessary abstractions.

Treat estimated expiry dates as estimates. The UI should not suggest that a receipt contains actual expiry dates.

11. UX priorities

Optimize for these principles in order:

The user immediately understands what food they have.

The user can scan a receipt with minimal friction.

Reviewing detected products takes seconds, not minutes.

The user can mark food as consumed with one action.

Products that need attention are easy to identify.

The interface stays pleasant and useful even with incomplete data.

Prefer progressive disclosure over showing every possible detail at once.

12. Deliverables

Implement the prototype directly in the project.

Before finishing:

Verify that the application builds.

Fix TypeScript errors and broken imports.

Test all main interactions.

Check desktop and mobile layouts.

Ensure the main workflow works from receipt selection through inventory update.

Add realistic Polish sample data.

Avoid TODO buttons in the main user journey.

Focus on a small number of excellent screens rather than many mediocre screens.

The final result should make a potential user think:

"This looks great, I understand what it does immediately, and scanning my shopping receipt would genuinely save me time."

Do not stop after producing a plan or a description. Inspect the existing project, implement the UI, and verify the working prototype.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8c8f101a-bdc1-532f-a7d8-d68f339b5608).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
