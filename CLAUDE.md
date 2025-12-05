# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A WhatsApp-style conversational gut health quiz application that guides users through a health assessment with Rebecca Taylor (RNutr) as the guide. Users are routed to one of six personalized gut health protocols based on their responses. The application is built with vanilla HTML, CSS, and JavaScript for easy hosting anywhere.

## Tech Stack

- **HTML/CSS/JavaScript**: Vanilla implementation, no frameworks or build tools
- **Styling**: Mobile-first responsive design with WhatsApp-style chat bubbles
- **Data Collection**: Form submissions via Formspree + localStorage backup
- **Hosting**: Static files - can be hosted on any web server, GitHub Pages, Netlify, etc.

## Development Commands

This is a static site with no build process. To develop:

```bash
# Simply open index.html in a browser
# Or use a local server (recommended for testing):
python -m http.server 8000
# Then visit http://localhost:8000
```

For production, upload all files and directories to any web host.

## Architecture

### File Structure
```
/
├── index.html              # Main HTML structure (landing + chat pages)
├── css/
│   └── styles.css          # WhatsApp-style UI styling
├── js/
│   ├── quiz-content.js     # Quiz questions and flow content
│   ├── quiz-logic.js       # Scoring and red flag logic
│   └── quiz-app.js         # Main application controller
├── assets/
│   ├── rebecca-avatar.png  # Rebecca Taylor's avatar (to be added)
│   └── rebecca-avatar.svg  # SVG fallback avatar
├── CLAUDE.md               # This file
└── README.md               # Project readme
```

### Quiz Flow (5 Sections, 18 Questions)

1. **Landing Page**: Full-screen with team credentials, value proposition, and "Start My Assessment" button
2. **Intro Messages**: Rebecca introduces herself and explains the assessment
3. **Part 1 - Safety Screening**: 4 red flag questions (Rome IV criteria)
   - Unintentional weight loss, blood in stool, family history, colonoscopy status
   - Red flags trigger warning with option to exit or continue
4. **Part 2 - Symptom Pattern**: 5 questions about primary complaints and patterns
5. **Part 3 - History**: 3 questions about duration, diagnoses, and treatments tried
6. **Part 4 - Gut-Brain Connection**: 3 questions about stress and mental health impact
7. **Part 5 - Life Impact**: 1 question + 2 open-ended text responses
8. **Email Capture**: Name and email collection
9. **Confirmation**: Thank you message with next steps

### Protocol Routing Logic (js/quiz-logic.js)

The app routes users to 6 different protocols based on responses:

| Protocol | Trigger Conditions |
|----------|-------------------|
| **Protocol 6: Gut-Brain Dominant** | Significant stress + mental health impact (checked first) |
| **Protocol 5: Post-SIBO Recovery** | SIBO diagnosis or SIBO antibiotic treatment history |
| **Protocol 4: Mixed Pattern (IBS-M)** | Alternating symptoms or frequency/stool changes |
| **Protocol 3: Diarrhea-Dominant (IBS-D)** | Primary complaint: diarrhea, or increased frequency + loose stools |
| **Protocol 2: Constipation-Dominant (IBS-C)** | Primary complaint: constipation, or decreased frequency + hard stools |
| **Protocol 1: Bloating-Dominant** | Primary complaint: bloating or gas (default) |

Additional modifier: If stress impact is significant (not Gut-Brain protocol), "(with Gut-Brain support)" is appended.

### Data Structure

User responses are stored in the `state` object (js/quiz-app.js):

```javascript
{
  currentSection: string,     // Current quiz section
  currentStepIndex: number,   // Step within section
  answers: {                  // All question responses
    q1_weight_loss: string,
    q2_blood: string,
    // ... all question IDs
    q17_hardest_part: string, // Open-ended
    q18_vision: string,       // Open-ended
    had_red_flags: boolean
  },
  userName: string,
  userEmail: string,
  protocol: {
    protocol: number,
    name: string,
    description: string
  }
}
```

### Form Submission Configuration

**IMPORTANT**: Before deploying, update the Formspree URL in js/quiz-app.js:

```javascript
const CONFIG = {
  FORMSPREE_URL: 'https://formspree.io/f/YOUR_FORM_ID',
  // ...
};
```

1. Create a free account at [formspree.io](https://formspree.io)
2. Create a new form and copy the form ID
3. Replace `YOUR_FORM_ID` with your actual form ID

Data is also saved to localStorage as a backup.

### Rebecca Taylor Avatar

**IMPORTANT**: Add the Rebecca Taylor avatar image:

1. Save the provided image as `assets/rebecca-avatar.png`
2. Recommended size: 200x200px or larger (will be scaled down)
3. The SVG fallback will be used if PNG is not available

## Key Implementation Details

### Quiz Content Structure (js/quiz-content.js)

Questions are defined in the `quizContent` object with sections containing arrays of steps:

```javascript
{
  type: 'message' | 'question' | 'buttons',
  id: string,           // For questions only
  delay: number,        // Typing indicator duration
  content: string,      // Message text
  inputType: 'single' | 'multi' | 'text' | 'email' | 'name',
  options: [{           // For single/multi/buttons
    text: string,
    value: string,
    redFlag: boolean,   // For safety questions
    next: string        // Next section key
  }],
  next: string          // Next section after response
}
```

### Special Flow Points

- `check_red_flags`: After safety screening, routes to warning or continues
- `red_flag_warning`: Displays warning with exit/continue options
- `confirmation`: Triggers form submission before showing final message

### UI Components

- **Typing Indicator**: 3 animated dots before each bot message
- **Message Animation**: Fade-in animation for new messages
- **Auto-scroll**: Chat scrolls to newest message
- **Input Types**:
  - Single-select buttons
  - Multi-select checkboxes with "Continue" button
  - Text/textarea input with send button
  - Email input with validation

## Styling Notes (css/styles.css)

### Color Palette
```css
--primary-green: #25D366;      /* WhatsApp green - buttons, online indicator */
--chat-bg: #ECE5DD;            /* WhatsApp chat background */
--white: #FFFFFF;              /* Rebecca's message bubbles */
--user-bubble: #DCF8C6;        /* User's message bubbles (light green) */
--text-dark: #111B21;          /* Primary text */
--text-secondary: #667781;     /* Secondary text */
--header-bg: #075E54;          /* Dark teal header */
--disclaimer-bg: #F0F0F0;      /* Light gray for disclaimer */
--warning-red: #DC3545;        /* Red flag warnings */
```

### Key Styling Features
- Mobile-first responsive design
- WhatsApp-style message bubbles (left/right aligned)
- Persistent medical disclaimer footer
- Animated typing indicator
- Online status indicator with pulse animation

## Modifications & Extensions

### Adding New Questions

1. Add question object to appropriate section in `js/quiz-content.js`
2. Set appropriate `type`, `id`, `content`, `inputType`, `options`, and `next`
3. Update the `next` property of the previous question to point to new section
4. If multi-select, update protocol logic in `js/quiz-logic.js` if needed

### Adding New Protocols

1. Update `determineProtocol()` function in `js/quiz-logic.js`
2. Add new routing conditions
3. Return new protocol object with number, name, and description

### Customizing Styling

- **Colors**: Update CSS variables in `:root` in `css/styles.css`
- **Layout**: Modify `.chat-page` max-width in CSS
- **Timing**: Adjust `DEFAULT_DELAY` in `js/quiz-app.js`

## Testing Checklist

When making changes, test:
- [ ] Landing page displays correctly with credentials
- [ ] "Start My Assessment" button transitions to chat
- [ ] All 18 questions flow correctly
- [ ] Red flag warning displays and routes properly
- [ ] Multi-select questions work (select/deselect, continue)
- [ ] Text inputs accept submissions (button + Enter key)
- [ ] Email validation works
- [ ] Protocol routing works for all 6 protocols
- [ ] Form submission to Formspree works
- [ ] localStorage backup saves data
- [ ] Mobile responsive design works
- [ ] Typing indicators display correctly
- [ ] Medical disclaimer footer stays visible
- [ ] Avatar fallback works if PNG missing

## Common Issues

### Avatar not showing
- Ensure `assets/rebecca-avatar.png` exists
- Check browser console for 404 errors
- SVG fallback should display if PNG missing

### Form not submitting
- Verify Formspree URL is correct
- Check browser console for errors
- Data still saves to localStorage as backup

### Styling issues on mobile
- Test on actual device, not just browser resize
- Check viewport meta tag in HTML
- Verify CSS media queries
