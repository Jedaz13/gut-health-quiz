// Configuration
const WEBHOOK_URL = 'YOUR_WEBHOOK_URL_HERE'; // Replace with your Make/Zapier webhook URL
const TYPING_DELAY = 1500; // Milliseconds to show typing indicator

// User data storage
const userData = {
    timestamp: new Date().toISOString(),
    responses: {},
    protocol: '',
    name: '',
    email: '',
    currentSituation: '',
    goals: ''
};

// Question flow
const questions = {
    welcome: {
        type: 'message',
        messages: [
            "Hi there! I'm here to help you understand your gut health better.",
            "I know how frustrating digestive issues can be - the bloating, discomfort, and uncertainty about what's causing it all.",
            "Together, we'll figure out what's happening and create a personalized protocol to help you feel better.",
            "Ready to get started?"
        ],
        buttons: ['Yes, let\'s begin!'],
        next: 'rome1'
    },

    // Rome IV Criteria - Red Flag Screening
    rome1: {
        type: 'choice',
        message: "First, I need to ask a few important health screening questions.",
        question: "Have you experienced any unintentional weight loss (more than 10 lbs in the past 6 months)?",
        buttons: ['Yes', 'No'],
        field: 'rome_weight_loss',
        next: 'rome2'
    },
    rome2: {
        type: 'choice',
        question: "Have you noticed blood in your stool?",
        buttons: ['Yes', 'No'],
        field: 'rome_blood_stool',
        next: 'rome3'
    },
    rome3: {
        type: 'choice',
        question: "Do you have a family history of colon cancer or inflammatory bowel disease?",
        buttons: ['Yes', 'No'],
        field: 'rome_family_history',
        next: 'rome4'
    },
    rome4: {
        type: 'choice',
        question: "Are you over 50 and have never had a colonoscopy?",
        buttons: ['Yes', 'No'],
        field: 'rome_no_colonoscopy',
        next: 'evaluateRome'
    },

    // Symptom Pattern Questions
    symptom1: {
        type: 'choice',
        message: "Great! Now let's understand your symptoms better.",
        question: "What is your PRIMARY digestive complaint?",
        buttons: [
            'Bloating/Gas',
            'Constipation',
            'Diarrhea',
            'Alternating constipation & diarrhea',
            'Recently treated for SIBO',
            'Anxiety/Depression affecting digestion'
        ],
        field: 'primary_complaint',
        next: 'symptom2'
    },
    symptom2: {
        type: 'choice',
        question: "How often do you experience these symptoms?",
        buttons: [
            'Daily',
            'Several times a week',
            'Once a week',
            'A few times a month'
        ],
        field: 'symptom_frequency',
        next: 'symptom3'
    },
    symptom3: {
        type: 'choice',
        question: "Do your symptoms get worse after eating?",
        buttons: ['Yes, usually', 'Sometimes', 'Rarely', 'No'],
        field: 'worse_after_eating',
        next: 'symptom4'
    },
    symptom4: {
        type: 'choice',
        question: "Have you noticed that certain foods trigger your symptoms?",
        buttons: ['Yes, definitely', 'I think so', 'Not sure', 'No'],
        field: 'food_triggers',
        next: 'symptom5'
    },
    symptom5: {
        type: 'choice',
        question: "Does stress or anxiety make your symptoms worse?",
        buttons: ['Yes, significantly', 'Yes, somewhat', 'Not really', 'No'],
        field: 'stress_impact',
        next: 'evaluateProtocol'
    },

    // Open-ended questions
    openEnded1: {
        type: 'text',
        question: "Thanks for sharing! Now, in your own words, tell me about your current situation. What are you dealing with day-to-day?",
        field: 'currentSituation',
        placeholder: 'Type your response here...',
        next: 'openEnded2'
    },
    openEnded2: {
        type: 'text',
        question: "What are your goals? Where do you want to be with your gut health?",
        field: 'goals',
        placeholder: 'Type your response here...',
        next: 'nameCapture'
    },

    // Contact information
    nameCapture: {
        type: 'text',
        message: "Perfect! I'm putting together your personalized protocol.",
        question: "What's your name?",
        field: 'name',
        placeholder: 'Your name',
        next: 'emailCapture'
    },
    emailCapture: {
        type: 'email',
        question: "And what's the best email to send your protocol to?",
        field: 'email',
        placeholder: 'your@email.com',
        next: 'thankYou'
    },

    // Thank you
    thankYou: {
        type: 'final',
        messages: [
            "Thank you! Your personalized gut health protocol is being prepared by our team.",
            "We'll review your responses and send a detailed protocol to your email within 24 hours.",
            "Check your inbox (and spam folder just in case) for your personalized plan!"
        ]
    }
};

// State management
let currentQuestion = 'welcome';
let isProcessing = false;
let totalQuestions = 14; // Total number of questions in the quiz
let completedQuestions = 0;

// DOM elements
const chatMessages = document.getElementById('chatMessages');
const chatInputContainer = document.getElementById('chatInputContainer');
const welcomeScreen = document.getElementById('welcomeScreen');
const chatContainer = document.getElementById('chatContainer');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');

// Start the quiz (called from welcome screen button)
function startQuiz() {
    console.log('=== QUIZ STARTING ===');
    console.log('Hiding welcome screen, showing chat container');
    welcomeScreen.style.display = 'none';
    chatContainer.style.display = 'flex';
    progressBar.style.display = 'block';
    init();
}

// Update progress bar
function updateProgress() {
    completedQuestions++;
    const percentage = (completedQuestions / totalQuestions) * 100;
    console.log('Progress updated:', completedQuestions, '/', totalQuestions, '=', percentage + '%');
    progressFill.style.width = percentage + '%';
}

// Initialize the quiz
function init() {
    console.log('init() called, starting with question:', currentQuestion);
    showQuestion(currentQuestion);
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot';
    typingDiv.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    scrollToBottom();
    return typingDiv;
}

// Add bot message
function addBotMessage(text, isWarning = false) {
    return new Promise((resolve) => {
        const typingIndicator = showTypingIndicator();

        setTimeout(() => {
            typingIndicator.remove();

            const messageDiv = document.createElement('div');
            messageDiv.className = 'message bot';

            if (isWarning) {
                messageDiv.innerHTML = `
                    <div class="message-bubble">
                        <div class="warning-message">
                            <strong>Important:</strong>
                            ${text}
                        </div>
                    </div>
                `;
            } else {
                messageDiv.innerHTML = `<div class="message-bubble">${text}</div>`;
            }

            chatMessages.appendChild(messageDiv);
            scrollToBottom();
            resolve();
        }, TYPING_DELAY);
    });
}

// Add user message
function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `<div class="message-bubble">${text}</div>`;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Scroll to bottom of chat
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show question based on type
async function showQuestion(questionId) {
    console.log('showQuestion called with:', questionId);

    const question = questions[questionId];
    if (!question) {
        console.error('Question not found:', questionId);
        return;
    }

    console.log('Question type:', question.type);

    // Handle multi-message sequences
    if (question.messages) {
        console.log('Showing', question.messages.length, 'messages');
        for (const msg of question.messages) {
            await addBotMessage(msg);
        }
    } else if (question.message) {
        console.log('Showing intro message');
        await addBotMessage(question.message);
    }

    // Show the actual question if it exists
    if (question.question) {
        console.log('Showing question');
        await addBotMessage(question.question);
    }

    // Render input based on type
    if (question.type === 'choice') {
        console.log('Rendering choice buttons');
        renderChoiceInput(question);
    } else if (question.type === 'text' || question.type === 'email') {
        console.log('Rendering text input');
        renderTextInput(question);
    } else if (question.type === 'final') {
        console.log('Final message, submitting data');
        chatInputContainer.innerHTML = '';
        await submitData();
    } else {
        console.log('Default: rendering choice buttons');
        renderChoiceInput(question);
    }
}

// Render choice buttons
function renderChoiceInput(question) {
    console.log('renderChoiceInput called, buttons:', question.buttons);
    console.log('Question field:', question.field, 'next:', question.next);

    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';

    question.buttons.forEach((btn, index) => {
        console.log('Creating button', index, ':', btn);
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = btn;
        button.addEventListener('click', () => {
            console.log('Click event fired for button:', btn);
            handleChoice(btn, question.field || '', question.next);
        });
        buttonGroup.appendChild(button);
    });

    chatInputContainer.innerHTML = '';
    chatInputContainer.appendChild(buttonGroup);
    console.log('Buttons appended to container, total buttons:', buttonGroup.children.length);
}

// Render text input
function renderTextInput(question) {
    const inputType = question.type === 'email' ? 'email' : 'text';

    const inputGroup = document.createElement('div');
    inputGroup.className = 'text-input-group';

    const input = document.createElement('input');
    input.type = inputType;
    input.className = 'text-input';
    input.id = 'textInput';
    input.placeholder = question.placeholder || 'Type here...';
    if (question.type === 'email') {
        input.required = true;
    }

    const sendButton = document.createElement('button');
    sendButton.className = 'send-button';
    sendButton.textContent = 'Send';
    sendButton.addEventListener('click', () => {
        handleTextInput(question.field, question.next);
    });

    // Allow Enter key to submit
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleTextInput(question.field, question.next);
        }
    });

    inputGroup.appendChild(input);
    inputGroup.appendChild(sendButton);

    chatInputContainer.innerHTML = '';
    chatInputContainer.appendChild(inputGroup);

    // Focus the input
    input.focus();
}

// Handle choice selection
async function handleChoice(choice, field, next) {
    console.log('Button clicked:', choice, 'field:', field, 'next:', next);

    if (isProcessing) {
        console.log('Already processing, ignoring click');
        return;
    }
    isProcessing = true;

    addUserMessage(choice);

    if (field) {
        userData.responses[field] = choice;
        console.log('Saved response:', field, '=', choice);
    }

    // Update progress
    updateProgress();

    chatInputContainer.innerHTML = '';

    // Special handling for evaluation points
    if (next === 'evaluateRome') {
        console.log('Evaluating Rome flags...');
        await evaluateRomeFlags();
    } else if (next === 'evaluateProtocol') {
        console.log('Determining protocol...');
        await determineProtocol();
    } else if (next === 'checkContinue') {
        console.log('Checking if user wants to continue after warning...');
        await checkContinue();
    } else {
        console.log('Moving to next question:', next);
        currentQuestion = next;
        await showQuestion(next);
    }

    isProcessing = false;
}

// Handle text input
async function handleTextInput(field, next) {
    console.log('Text input submitted, field:', field, 'next:', next);

    if (isProcessing) {
        console.log('Already processing, ignoring text input');
        return;
    }

    const input = document.getElementById('textInput');
    const value = input.value.trim();

    if (!value) {
        console.log('Empty input, ignoring');
        return;
    }

    console.log('Input value:', value);

    // Validate email if needed
    if (field === 'email' && !isValidEmail(value)) {
        console.log('Invalid email format');
        await addBotMessage("Please enter a valid email address.");
        return;
    }

    isProcessing = true;

    addUserMessage(value);
    userData[field] = value;
    console.log('Saved text input:', field, '=', value);

    // Update progress
    updateProgress();

    chatInputContainer.innerHTML = '';

    console.log('Moving to next question:', next);
    currentQuestion = next;
    await showQuestion(next);

    isProcessing = false;
}

// Validate email
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Evaluate Rome IV flags
async function evaluateRomeFlags() {
    console.log('Evaluating Rome IV flags...');
    console.log('Rome responses:', userData.responses);

    const hasRedFlags =
        userData.responses.rome_weight_loss === 'Yes' ||
        userData.responses.rome_blood_stool === 'Yes' ||
        userData.responses.rome_family_history === 'Yes' ||
        userData.responses.rome_no_colonoscopy === 'Yes';

    console.log('Has red flags:', hasRedFlags);

    if (hasRedFlags) {
        await addBotMessage(
            "Based on your responses, I recommend speaking with a healthcare provider before starting any protocol. These symptoms could indicate a condition that needs medical attention.",
            true
        );
        await addBotMessage("However, you can still continue with the assessment if you'd like. Would you like to proceed?");

        renderChoiceInput({
            buttons: ['Yes, continue', 'No, I\'ll see a doctor first'],
            field: 'continue_after_warning',
            next: 'checkContinue'
        });

        userData.responses.had_red_flags = 'Yes';
    } else {
        userData.responses.had_red_flags = 'No';
        console.log('No red flags, continuing to symptom1');
        currentQuestion = 'symptom1';
        await showQuestion('symptom1');
    }
}

// Check if user wants to continue after warning
async function checkContinue() {
    console.log('checkContinue called');
    console.log('continue_after_warning response:', userData.responses.continue_after_warning);

    if (userData.responses.continue_after_warning === 'Yes, continue') {
        console.log('User chose to continue, going to symptom1');
        currentQuestion = 'symptom1';
        await showQuestion('symptom1');
    } else {
        console.log('User chose to see doctor first, ending quiz');
        await addBotMessage("That's a wise decision. Please consult with a healthcare provider. Take care!");
        chatInputContainer.innerHTML = '';
    }
}

// Determine protocol based on symptom responses
async function determineProtocol() {
    console.log('Determining protocol...');
    const primaryComplaint = userData.responses.primary_complaint;
    console.log('Primary complaint:', primaryComplaint);
    let protocol = '';

    // Protocol routing logic
    if (primaryComplaint === 'Bloating/Gas') {
        protocol = 'Bloating Protocol';
    } else if (primaryComplaint === 'Constipation') {
        protocol = 'IBS-C Protocol';
    } else if (primaryComplaint === 'Diarrhea') {
        protocol = 'IBS-D Protocol';
    } else if (primaryComplaint === 'Alternating constipation & diarrhea') {
        protocol = 'IBS-M Protocol';
    } else if (primaryComplaint === 'Recently treated for SIBO') {
        protocol = 'Post-SIBO Protocol';
    } else if (primaryComplaint === 'Anxiety/Depression affecting digestion') {
        protocol = 'Gut-Brain Protocol';
    }

    // Refine based on stress impact for gut-brain connection
    if (userData.responses.stress_impact === 'Yes, significantly' && protocol !== 'Gut-Brain Protocol') {
        protocol = protocol + ' (with Gut-Brain support)';
    }

    userData.protocol = protocol;
    console.log('Assigned protocol:', protocol);

    await addBotMessage(`Based on your responses, you'd benefit most from our ${protocol}.`);
    await addBotMessage("Now I'd like to learn a bit more about your specific situation...");

    console.log('Moving to openEnded1');
    currentQuestion = 'openEnded1';
    await showQuestion('openEnded1');
}

// Submit data to webhook
async function submitData() {
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            console.error('Webhook submission failed:', response.statusText);
            // Still show success message to user to not disrupt their experience
        }
    } catch (error) {
        console.error('Error submitting data:', error);
        // Still show success message to user
    }
}

// Make startQuiz accessible globally for the button onclick
window.startQuiz = startQuiz;

// Don't auto-start on page load - wait for user to click the start button
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== PAGE LOADED ===');
    console.log('DOM elements check:');
    console.log('- welcomeScreen:', welcomeScreen ? 'found' : 'NOT FOUND');
    console.log('- chatContainer:', chatContainer ? 'found' : 'NOT FOUND');
    console.log('- chatMessages:', chatMessages ? 'found' : 'NOT FOUND');
    console.log('- chatInputContainer:', chatInputContainer ? 'found' : 'NOT FOUND');
    console.log('- progressBar:', progressBar ? 'found' : 'NOT FOUND');
    console.log('- progressFill:', progressFill ? 'found' : 'NOT FOUND');
    console.log('Ready for user to click "Begin Your Journey" button');
});
