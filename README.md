# Smart Issue Board

Live Demo: [Your Vercel URL here]

## Why I Chose Next.js

I chose Next.js because:
- **Fast setup**: App Router makes routing simple with folder structure
- **Vercel integration**: Seamless deployment to Vercel (one-click deploy)
- **Built-in optimization**: Automatic code splitting and fast performance
- **React familiarity**: I'm comfortable with React and Next.js extends it well
- **TypeScript support**: Out of the box, which helps catch errors early

## Firestore Data Structure
```
issues (collection)
  └── {issueId} (document)
      ├── title: string
      ├── description: string
      ├── priority: "Low" | "Medium" | "High"
      ├── status: "Open" | "In Progress" | "Done"
      ├── assignedTo: string
      ├── createdAt: Timestamp
      └── createdBy: string (user email)
```

**Why this structure:**
- Simple flat structure - easy to query and filter
- All issue data in one document - no complex joins needed
- `createdAt` as Timestamp allows easy sorting (newest first)
- `createdBy` tracks who created each issue
- No separate users collection needed since we only store email

## Similar Issue Handling

I implemented a simple string matching approach:
- When creating an issue, check if the new title contains (or is contained in) any existing issue title
- Case-insensitive comparison for better matching
- If found, show a browser confirmation dialog with the similar issue title
- User can choose to proceed or cancel

**Why this approach:**
- Quick to implement and works for most cases
- No external libraries needed
- Browser `confirm()` is simple and clear
- Real-time check before submission

**Future improvements:**
- Use fuzzy string matching (Levenshtein distance)
- Check description similarity too
- Show list of all similar issues, not just first match
- Better UI (modal instead of browser confirm)

## What Was Confusing/Challenging

1. **Firebase configuration with environment variables**: Initially hardcoded values, then had to refactor for Vercel deployment
2. **Status transition logic**: Had to think about where to validate (frontend vs backend rules)
3. **TypeScript types**: Some Firebase types needed `any` due to time constraints
4. **Similar issue detection**: Balancing simplicity vs accuracy

## What I Would Improve Next

1. **Better similar issue detection**: Use Levenshtein distance or TF-IDF for smarter matching
2. **Real-time updates**: Use Firestore `onSnapshot` instead of manual refresh
3. **Better UI/UX**: 
   - Loading states
   - Toast notifications instead of alerts
   - Drag-and-drop for status changes
   - Issue detail modal
4. **Firestore security rules**: Currently in test mode, needs proper authentication rules
5. **Edit/Delete functionality**: Currently can only create issues
6. **Search functionality**: Filter by title/description text
7. **User profiles**: Allow setting display name instead of just email
8. **Comments on issues**: Discussion thread for each issue
9. **Pagination**: For when there are many issues

## Setup Instructions

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env.local` with Firebase config (see `.env.example`)
4. Run development server: `npm run dev`
5. Open http://localhost:3000

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Vercel