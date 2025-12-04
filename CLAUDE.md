# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A conversational gut health quiz application that uses a chat bubble interface (iMessage/Messenger style) to guide users through a health assessment and route them to one of six personalized gut health protocols. The application is built with vanilla HTML, CSS, and JavaScript for easy hosting anywhere.

## Tech Stack

- **HTML/CSS/JavaScript**: Vanilla implementation, no frameworks or build tools
- **Styling**: Mobile-first responsive design with iMessage-style chat bubbles
- **Data Collection**: Form data sent to webhook (Make/Zapier) for Google Sheets integration
- **Hosting**: Static files - can be hosted on any web server, GitHub Pages, Netlify, etc.

## Development Commands

This is a static site with no build process. To develop:

```bash
# Simply open index.html in a browser
# Or use a local server (recommended for testing):
python -m http.server 8000
# Then visit http://localhost:8000
```

For production, upload the three files (index.html, styles.css, app.js) to any web host.

## Architecture

### File Structure
```
/
├── index.html       # Main HTML structure with chat container
├── styles.css       # Chat bubble UI styling (iMessage-like)
└── app.js           # Quiz logic, flow control, and webhook integration
```

### Quiz Flow (7 Stages)

1. **Welcome Landing**: Full-screen welcome with headline "Discover Your Personal Gut Health Protocol" and "Begin Your Journey" button
2. **Chat Initiation**: After clicking start, transitions to chat interface with progress bar visible
3. **Red Flag Screening**: Rome IV criteria questions to identify serious conditions requiring medical attention
   - Allows users to continue after warning but flags the response
4. **Symptom Pattern Assessment**: 5 questions to determine symptoms and triggers
   - Routes user to appropriate protocol based on primary complaint
5. **Open-Ended Questions**: 2 text-based questions capturing current situation and goals
6. **Contact Information**: Name and email capture
7. **Thank You**: Confirmation that protocol will be emailed within 24 hours

### Progress Tracking

A progress bar appears at the top of the chat interface (after the welcome screen) showing completion percentage. The bar updates after each question is answered. Total questions: 14. Progress is calculated as `(completedQuestions / 14) * 100`.

### Protocol Routing Logic (app.js)

The app routes users to 6 different protocols based on their primary complaint:

- **Bloating Protocol**: Primary complaint = "Bloating/Gas"
- **IBS-C Protocol**: Primary complaint = "Constipation"
- **IBS-D Protocol**: Primary complaint = "Diarrhea"
- **IBS-M Protocol**: Primary complaint = "Alternating constipation & diarrhea"
- **Post-SIBO Protocol**: Primary complaint = "Recently treated for SIBO"
- **Gut-Brain Protocol**: Primary complaint = "Anxiety/Depression affecting digestion"

Additional modifier: If stress impact is significant, "(with Gut-Brain support)" is appended to non-Gut-Brain protocols.

### Data Structure

All user responses are stored in the `userData` object (app.js:7-16):

```javascript
{
    timestamp: ISO timestamp,
    responses: {}, // All question responses
    protocol: '',  // Calculated protocol name
    name: '',
    email: '',
    currentSituation: '', // Open-ended response 1
    goals: ''             // Open-ended response 2
}
```

### Webhook Configuration

**IMPORTANT**: Before deploying, update the webhook URL in app.js:3:
```javascript
const WEBHOOK_URL = 'YOUR_WEBHOOK_URL_HERE';
```

This should be replaced with your Make.com or Zapier webhook URL that forwards data to Google Sheets.

## Key Implementation Details

### Question System (app.js:17-147)

Questions are defined in the `questions` object with the following structure:
- `type`: 'choice', 'text', 'email', 'message', or 'final'
- `message`: Optional intro message before question
- `question`: The actual question text
- `buttons`: Array of choices (for type='choice')
- `field`: Database field name to store response
- `next`: ID of next question (or 'evaluateRome'/'evaluateProtocol' for branching)

### Special Evaluation Points

- `evaluateRome` (app.js:338-359): Checks for red flags and shows warning if needed
- `evaluateProtocol` (app.js:375-399): Determines which protocol to assign based on responses

### UI Interaction Patterns

- **Typing Indicator**: Shows 3 animated dots before each bot message (1.5s delay)
- **Message Animation**: Slide-in animation for new messages
- **Auto-scroll**: Chat automatically scrolls to show newest message
- **Input Types**:
  - Button choices for multiple choice questions
  - Text input with send button for open-ended responses
  - Email validation for email capture

## Styling Notes (styles.css)

- **Color Scheme**: Calming green tones (#52a675 primary, #3d8e5f darker green)
- **Mobile-first responsive design**
- **Welcome Screen**: Full-screen with centered content, green gradient button
- **Chat Bubbles**:
  - Bot messages: left-aligned, gray background (#e5e5ea) with tail
  - User messages: right-aligned, green background (#52a675) with tail
  - Border radius: 20px with one corner at 4px for tail effect
  - CSS pseudo-elements (::before and ::after) create iMessage-style bubble tails
- **Progress Bar**: White bar on semi-transparent background in header, animates on update
- **Warning messages**: Yellow background with left border (Rome IV red flags)
- **Breakpoint**: 768px for mobile adjustments
- **Full-height containers** on mobile (100vh)

## Modifications & Extensions

### Adding New Questions

1. Add question object to `questions` object in app.js
2. Set appropriate `type`, `message`, `question`, `buttons`, `field`, and `next`
3. Update previous question's `next` field to point to new question
4. If adding branching logic, create evaluation function similar to `evaluateRomeFlags()`

### Adding New Protocols

1. Update symptom pattern question buttons (app.js:60)
2. Add routing logic in `determineProtocol()` function (app.js:375-399)
3. Consider updating protocol refinement logic if needed

### Customizing Styling

- **Colors**: Update CSS colors in styles.css:
  - Primary green: #52a675 (user bubbles, buttons, gradients)
  - Dark green: #3d8e5f (hover states)
  - Bot bubbles: #e5e5ea
  - Background gradients: lines 9, 62, 96 in styles.css
- **Welcome Screen**: Edit headline/subheadline text in index.html:12-13
- **Timing**: Adjust `TYPING_DELAY` constant in app.js:3
- **Layout**: Modify `.chat-container` max-width and height in styles.css
- **Progress Bar**: Adjust totalQuestions (app.js:158) if adding/removing questions

## Testing Checklist

When making changes, test:
- [ ] Welcome screen displays correctly with headline and button
- [ ] "Begin Your Journey" button transitions to chat interface
- [ ] Progress bar appears after starting and updates correctly
- [ ] All question flows complete successfully
- [ ] Red flag warning displays for Rome IV criteria
- [ ] Protocol routing works for all 6 protocols
- [ ] Webhook receives complete data payload
- [ ] Mobile responsive design (test on actual device)
- [ ] Email validation prevents invalid emails
- [ ] Text inputs accept Enter key for submission
- [ ] Typing indicators display correctly
- [ ] Messages scroll properly on overflow
- [ ] Chat bubble tails render correctly on both sides
- [ ] Button clicks work without errors
- [ ] Green color scheme displays consistently
