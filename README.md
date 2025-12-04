# Personalized Gut Health Protocol Quiz

A conversational gut health assessment tool that guides users through a health quiz and routes them to personalized protocols. Built with vanilla JavaScript for easy deployment anywhere.

## Features

- **iMessage-style Chat Interface**: Engaging conversational UI with typing indicators and smooth animations
- **Medical Screening**: Rome IV criteria screening for red flags that require medical attention
- **Smart Protocol Routing**: Automatically routes users to 1 of 6 protocols based on their symptoms:
  - Bloating Protocol
  - IBS-C (Constipation) Protocol
  - IBS-D (Diarrhea) Protocol
  - IBS-M (Mixed) Protocol
  - Post-SIBO Protocol
  - Gut-Brain Protocol
- **Data Collection**: Captures all responses and sends to webhook for processing
- **Mobile-First Design**: Responsive design that works beautifully on all devices

## Quick Start

### 1. Configure the Webhook

Open `app.js` and replace the webhook URL on line 2:

```javascript
const WEBHOOK_URL = 'YOUR_WEBHOOK_URL_HERE';
```

Replace with your Make.com or Zapier webhook URL.

### 2. Test Locally

Simply open `index.html` in your browser, or use a local server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`

### 3. Deploy

Upload all three files to any web host:
- `index.html`
- `styles.css`
- `app.js`

Works with: GitHub Pages, Netlify, Vercel, traditional web hosting, or any CDN.

## Quiz Flow

1. **Welcome** - Story-driven introduction
2. **Red Flag Screening** - Rome IV criteria questions (warns user but allows continuation)
3. **Symptom Assessment** - 5 questions about symptoms and patterns
4. **Open-Ended Questions** - Current situation and goals
5. **Contact Info** - Name and email capture
6. **Thank You** - Confirmation message

## Data Structure

The quiz collects and sends this data to your webhook:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "responses": {
    "rome_weight_loss": "No",
    "rome_blood_stool": "No",
    "primary_complaint": "Bloating/Gas",
    "symptom_frequency": "Daily",
    "worse_after_eating": "Yes, usually",
    "food_triggers": "Yes, definitely",
    "stress_impact": "Yes, somewhat"
  },
  "protocol": "Bloating Protocol",
  "name": "John Doe",
  "email": "john@example.com",
  "currentSituation": "User's description of their symptoms...",
  "goals": "User's health goals..."
}
```

## Customization

### Change Colors

Edit `styles.css`:
- Bot bubbles: `.message.bot .message-bubble` (line 74)
- User bubbles: `.message.user .message-bubble` (line 79)
- Header gradient: `.chat-header` (line 27)

### Add Questions

Edit the `questions` object in `app.js`:

```javascript
newQuestion: {
    type: 'choice',  // or 'text', 'email'
    question: "Your question here?",
    buttons: ['Option 1', 'Option 2'],
    field: 'field_name',
    next: 'nextQuestionId'
}
```

### Modify Protocol Logic

Edit the `determineProtocol()` function in `app.js` (line 375) to change how protocols are assigned.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## File Structure

```
/
├── index.html       # HTML structure
├── styles.css       # Chat UI styling
├── app.js          # Quiz logic and webhook integration
├── README.md       # This file
└── CLAUDE.md       # Developer documentation for Claude Code
```

## License

This project is provided as-is for use in your gut health protocol business.

## Support

For modifications or questions, refer to `CLAUDE.md` for detailed technical documentation.
