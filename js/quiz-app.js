// Quiz Application - Main Controller
// Dependencies: quiz-content.js, quiz-logic.js

// Configuration
const CONFIG = {
  // Make.com webhook URL
  WEBHOOK_URL: 'https://hook.eu1.make.com/5uubblyocz70syh9xptkg248ycauy5pd',
  // Avatar image path (fallback to SVG if PNG not available)
  AVATAR_PATH: 'assets/rebecca-avatar.png',
  AVATAR_FALLBACK: 'assets/rebecca-avatar.svg',
  // Default typing delay in ms
  DEFAULT_DELAY: 1000
};

// Avatar fallback handler
function getAvatarHTML() {
  return `<img src="${CONFIG.AVATAR_PATH}"
    alt="Rebecca"
    class="message-avatar"
    onerror="this.onerror=null; this.src='${CONFIG.AVATAR_FALLBACK}'; this.classList.add('avatar-fallback');">`;
}

// Application State
const state = {
  currentSection: 'intro',
  currentStepIndex: 0,
  answers: {},
  userName: '',
  userEmail: '',
  protocol: null,
  isProcessing: false,
  hasStarted: false
};

// DOM Elements
let landingPage, chatPage, chatArea, inputContainer;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  landingPage = document.getElementById('landingPage');
  chatPage = document.getElementById('chatPage');
  chatArea = document.getElementById('chatArea');
  inputContainer = document.getElementById('inputContainer');

  // Set up event listeners
  document.getElementById('startButton').addEventListener('click', startQuiz);
  document.getElementById('backButton').addEventListener('click', handleBack);
});

/**
 * Start the quiz - transition from landing to chat
 */
function startQuiz() {
  landingPage.classList.add('hidden');
  chatPage.classList.add('active');
  state.hasStarted = true;
  processSection('intro');
}

/**
 * Handle back button click
 */
function handleBack() {
  if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
    resetQuiz();
  }
}

/**
 * Reset the quiz to initial state
 */
function resetQuiz() {
  state.currentSection = 'intro';
  state.currentStepIndex = 0;
  state.answers = {};
  state.userName = '';
  state.userEmail = '';
  state.protocol = null;
  state.isProcessing = false;
  state.hasStarted = false;

  chatArea.innerHTML = '';
  inputContainer.innerHTML = '';

  chatPage.classList.remove('active');
  landingPage.classList.remove('hidden');
}

/**
 * Process a section of the quiz content
 * @param {string} sectionKey - Key of the section in quizContent
 */
async function processSection(sectionKey) {
  if (state.isProcessing) return;
  state.isProcessing = true;
  state.currentSection = sectionKey;
  state.currentStepIndex = 0;

  const section = quizContent[sectionKey];
  if (!section) {
    console.error('Section not found:', sectionKey);
    state.isProcessing = false;
    return;
  }

  // Process each step in the section
  for (let i = 0; i < section.length; i++) {
    state.currentStepIndex = i;
    const step = section[i];
    await processStep(step);
  }

  state.isProcessing = false;
}

/**
 * Process a single step (message, question, or buttons)
 * @param {Object} step - Step object from quizContent
 */
async function processStep(step) {
  const delay = step.delay || CONFIG.DEFAULT_DELAY;

  switch (step.type) {
    case 'message':
      await showTypingIndicator(delay);
      addMessage(replaceVariables(step.content), 'rebecca', step.isWarning);
      break;

    case 'question':
      // Only show typing indicator and message if there's content
      if (step.content) {
        await showTypingIndicator(delay);
        addMessage(replaceVariables(step.content), 'rebecca');
      }

      // Wait for user response
      await waitForResponse(step);
      break;

    case 'buttons':
      renderButtons(step.options);
      // Wait for button click
      await waitForButtonClick(step.options);
      break;
  }
}

/**
 * Show typing indicator for specified duration
 * @param {number} duration - Duration in milliseconds
 */
function showTypingIndicator(duration) {
  return new Promise(resolve => {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message rebecca typing-message';
    typingDiv.innerHTML = `
      ${getAvatarHTML()}
      <div class="message-bubble typing-bubble">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    chatArea.appendChild(typingDiv);
    scrollToBottom();

    setTimeout(() => {
      typingDiv.remove();
      resolve();
    }, duration);
  });
}

/**
 * Add a message to the chat
 * @param {string} content - Message content
 * @param {string} sender - 'rebecca' or 'user'
 * @param {boolean} isWarning - Whether to style as warning
 */
function addMessage(content, sender, isWarning = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;

  if (sender === 'rebecca') {
    const bubbleClass = isWarning ? 'message-bubble warning-bubble' : 'message-bubble';
    const warningIcon = isWarning ? '<span class="warning-icon">⚠️</span>' : '';
    messageDiv.innerHTML = `
      ${getAvatarHTML()}
      <div class="${bubbleClass}">${warningIcon}${content}</div>
    `;
  } else {
    messageDiv.innerHTML = `<div class="message-bubble">${content}</div>`;
  }

  chatArea.appendChild(messageDiv);
  scrollToBottom();
}

/**
 * Render option buttons with click handlers
 * @param {Array} options - Array of option objects
 * @param {Function} onClickCallback - Callback when button is clicked
 */
function renderButtons(options, onClickCallback) {
  // Always get fresh reference to inputContainer
  const container = document.createElement('div');
  container.className = 'options-container';

  options.forEach(option => {
    const button = document.createElement('button');
    button.className = 'option-button';
    button.textContent = option.text;
    button.dataset.value = option.value;
    button.dataset.next = option.next || '';

    // Add direct click handler to each button
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Button clicked:', option.text, option.value);
      if (onClickCallback) {
        onClickCallback(option.value, option.next || '', option.text, option);
      }
    });

    container.appendChild(button);
  });

  // Get fresh reference and clear
  const inputEl = document.getElementById('inputContainer');
  inputEl.innerHTML = '';
  inputEl.appendChild(container);
  scrollToBottom();
}

/**
 * Render multi-select checkboxes
 * @param {Array} options - Array of option objects
 */
function renderMultiSelect(options) {
  const container = document.createElement('div');
  container.className = 'options-container multi-select';

  options.forEach(option => {
    const label = document.createElement('label');
    label.className = 'checkbox-option';
    label.innerHTML = `
      <input type="checkbox" value="${option.value}">
      <span>${option.text}</span>
    `;

    label.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') {
        const checkbox = label.querySelector('input');
        checkbox.checked = !checkbox.checked;
      }
      label.classList.toggle('checked', label.querySelector('input').checked);
    });

    container.appendChild(label);
  });

  const continueBtn = document.createElement('button');
  continueBtn.className = 'continue-button';
  continueBtn.textContent = 'Continue';
  container.appendChild(continueBtn);

  inputContainer.innerHTML = '';
  inputContainer.appendChild(container);
  scrollToBottom();

  return continueBtn;
}

/**
 * Render text input
 * @param {string} placeholder - Placeholder text
 * @param {string} type - Input type ('text', 'email', 'name')
 */
function renderTextInput(placeholder, type = 'text') {
  const container = document.createElement('div');
  container.className = 'input-container';

  const inputType = type === 'email' ? 'email' : 'text';
  const isTextArea = type === 'text';

  if (isTextArea) {
    container.innerHTML = `
      <textarea placeholder="${placeholder}" rows="3"></textarea>
      <button class="send-button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"/>
        </svg>
      </button>
    `;
  } else {
    container.innerHTML = `
      <input type="${inputType}" placeholder="${placeholder}">
      <button class="send-button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"/>
        </svg>
      </button>
    `;
  }

  inputContainer.innerHTML = '';
  inputContainer.appendChild(container);

  const input = container.querySelector('textarea, input');
  input.focus();
  scrollToBottom();

  return { container, input, button: container.querySelector('.send-button') };
}

/**
 * Wait for button click and process the response
 * @param {Array} options - Array of option objects
 */
function waitForButtonClick(options) {
  return new Promise(resolve => {
    let clicked = false;

    const handleButtonClick = async (value, next, text, option) => {
      // Prevent double-clicks
      if (clicked) return;
      clicked = true;

      console.log('waitForButtonClick handler:', value, next);

      // Add user message
      addMessage(text, 'user');

      // Clear input
      document.getElementById('inputContainer').innerHTML = '';

      // Process the selection after a short delay
      setTimeout(async () => {
        await handleButtonSelection(value, next, options);
        resolve();
      }, 300);
    };

    // Render buttons with the click callback
    renderButtons(options, handleButtonClick);
  });
}

/**
 * Handle button selection
 * @param {string} value - Selected value
 * @param {string} next - Next section key
 * @param {Array} options - Original options array
 */
async function handleButtonSelection(value, next, options) {
  const selectedOption = options.find(o => o.value === value);

  // Store red flag status if applicable
  if (selectedOption && selectedOption.redFlag !== undefined) {
    const questionId = state.currentSection;
    state.answers[questionId] = value;
    if (selectedOption.redFlag) {
      state.answers.had_red_flags = true;
    }
  }

  // Handle special navigation
  if (next) {
    // Reset processing flag to allow next section to run
    state.isProcessing = false;
    await processSection(next);
  }
}

/**
 * Wait for user response to a question
 * @param {Object} step - Question step object
 */
function waitForResponse(step) {
  return new Promise(async (resolve) => {
    if (step.inputType === 'single') {
      // Single select buttons
      let clicked = false;

      const handleButtonClick = async (value, next, text, option) => {
        // Prevent double-clicks
        if (clicked) return;
        clicked = true;

        console.log('waitForResponse single handler:', value, step.next);

        addMessage(text, 'user');
        document.getElementById('inputContainer').innerHTML = '';

        // Store answer
        state.answers[step.id] = value;

        // Check for red flag
        if (option && option.redFlag) {
          state.answers.had_red_flags = true;
        }

        // Handle special navigation
        if (step.next === 'check_red_flags') {
          await handleRedFlagCheck();
        } else if (step.next) {
          setTimeout(() => {
            processSection(step.next);
          }, 300);
        }

        resolve();
      };

      // Render buttons with callback
      renderButtons(step.options, handleButtonClick);

    } else if (step.inputType === 'multi') {
      // Multi-select checkboxes
      const continueBtn = renderMultiSelect(step.options);

      continueBtn.addEventListener('click', () => {
        const selected = [];
        inputContainer.querySelectorAll('input:checked').forEach(cb => {
          selected.push(cb.value);
        });

        if (selected.length === 0) {
          return; // Require at least one selection
        }

        // Find text labels for selected options
        const selectedTexts = step.options
          .filter(o => selected.includes(o.value))
          .map(o => o.text);

        addMessage(selectedTexts.join(', '), 'user');
        inputContainer.innerHTML = '';

        // Store answer
        state.answers[step.id] = selected;

        if (step.next) {
          setTimeout(() => {
            processSection(step.next);
          }, 300);
        }

        resolve();
      });

    } else if (step.inputType === 'text' || step.inputType === 'name' || step.inputType === 'email') {
      // Text/email input
      const { input, button } = renderTextInput(step.placeholder, step.inputType);

      const handleSubmit = async () => {
        const value = input.value.trim();

        if (!value) return;

        // Validate email if needed
        if (step.inputType === 'email' && !isValidEmail(value)) {
          alert('Please enter a valid email address.');
          return;
        }

        addMessage(value, 'user');
        inputContainer.innerHTML = '';

        // Store answer
        state.answers[step.id] = value;

        // Store name/email in state
        if (step.id === 'name' || step.id === 'exit_name') {
          state.userName = value;
        } else if (step.id === 'email' || step.id === 'exit_email') {
          state.userEmail = value;
        }

        // Handle special flow for email capture completion
        if (step.next === 'final_message') {
          // Determine protocol before final message
          state.protocol = determineProtocol(state.answers);
          state.protocol = addStressComponent(state.answers, state.protocol);
        }

        if (step.next) {
          setTimeout(() => {
            processSection(step.next);
          }, 300);
        }

        resolve();
      };

      button.addEventListener('click', handleSubmit);
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSubmit();
        }
      });
    }
  });
}

/**
 * Handle red flag check after safety screening
 */
async function handleRedFlagCheck() {
  // Reset processing flag to allow next section to run
  state.isProcessing = false;
  if (state.answers.had_red_flags) {
    await processSection('red_flag_warning');
  } else {
    await processSection('part2_intro');
  }
}

/**
 * Replace template variables in text
 * @param {string} text - Text with {{variable}} placeholders
 * @returns {string} - Text with variables replaced
 */
function replaceVariables(text) {
  if (!text) return '';
  return text
    .replace(/\{\{name\}\}/g, state.userName || '')
    .replace(/\{\{email\}\}/g, state.userEmail || '');
}

/**
 * Scroll chat area to bottom with smooth scrolling
 */
function scrollToBottom() {
  // Use requestAnimationFrame to ensure DOM has updated before scrolling
  requestAnimationFrame(() => {
    chatArea.scroll({
      top: chatArea.scrollHeight,
      behavior: 'smooth'
    });
  });
}

/**
 * Submit the quiz data to Make.com webhook
 */
async function submitToWebhook() {
  const submission = formatSubmissionData(
    state.answers,
    state.protocol,
    state.userName,
    state.userEmail
  );

  // Save to localStorage as backup
  saveToLocalStorage(submission);

  // Build payload with all fields separately
  const payload = {
    // Contact info
    name: state.userName,
    email: state.userEmail,

    // Protocol info
    protocol_number: state.protocol.protocol,
    protocol_name: state.protocol.name,
    protocol_description: state.protocol.description,

    // Open-ended responses (Q17 & Q18) - easy access
    q17_hardest_part: state.answers.q17_hardest_part || '',
    q18_vision: state.answers.q18_vision || '',

    // All question answers separately
    q1_weight_loss: state.answers.q1_weight_loss || '',
    q2_blood: state.answers.q2_blood || '',
    q3_family_history: state.answers.q3_family_history || '',
    q4_colonoscopy: state.answers.q4_colonoscopy || '',
    q5_primary_complaint: state.answers.q5_primary_complaint || '',
    q6_frequency: state.answers.q6_frequency || '',
    q7_stool_type: state.answers.q7_stool_type || '',
    q8_bloating_timing: state.answers.q8_bloating_timing || '',
    q9_pain_location: state.answers.q9_pain_location || '',
    q10_duration: state.answers.q10_duration || '',
    q11_diagnoses: Array.isArray(state.answers.q11_diagnoses)
      ? state.answers.q11_diagnoses.join(', ')
      : (state.answers.q11_diagnoses || ''),
    q12_treatments: Array.isArray(state.answers.q12_treatments)
      ? state.answers.q12_treatments.join(', ')
      : (state.answers.q12_treatments || ''),
    q13_stress_impact: state.answers.q13_stress_impact || '',
    q14_anxiety_depression: state.answers.q14_anxiety_depression || '',
    q15_sleep_quality: state.answers.q15_sleep_quality || '',
    q16_life_impact: state.answers.q16_life_impact || '',

    // Red flag status
    had_red_flags: state.answers.had_red_flags || false,

    // Timestamp
    submitted_at: new Date().toISOString()
  };

  // Submit to Make.com webhook
  try {
    const response = await fetch(CONFIG.WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Webhook submission failed:', response.statusText);
    } else {
      console.log('Submission successful');
    }
  } catch (error) {
    console.error('Error submitting to webhook:', error);
  }

  return submission;
}

// Override the confirmation section to trigger form submission
const originalProcessSection = processSection;
processSection = async function(sectionKey) {
  if (sectionKey === 'confirmation') {
    // Submit data before showing confirmation
    await submitToWebhook();
  } else if (sectionKey === 'exit_final') {
    // Submit red flag exit data
    await submitRedFlagExit();
  }
  return originalProcessSection.call(this, sectionKey);
};

/**
 * Submit red flag exit data to Make.com webhook
 */
async function submitRedFlagExit() {
  // Build payload with all fields separately
  const payload = {
    // Contact info
    name: state.userName,
    email: state.userEmail,

    // Exit type
    submission_type: 'red_flag_exit',
    red_flag_exit: true,
    had_red_flags: true,

    // Protocol info (not determined for red flag exits)
    protocol_number: 0,
    protocol_name: 'Red Flag Exit',
    protocol_description: 'User exited after red flag warning - requested supportive tips',

    // Open-ended responses (Q17 & Q18) - may not be filled
    q17_hardest_part: state.answers.q17_hardest_part || '',
    q18_vision: state.answers.q18_vision || '',

    // All question answers separately (partial for red flag exits)
    q1_weight_loss: state.answers.q1_weight_loss || '',
    q2_blood: state.answers.q2_blood || '',
    q3_family_history: state.answers.q3_family_history || '',
    q4_colonoscopy: state.answers.q4_colonoscopy || '',
    q5_primary_complaint: state.answers.q5_primary_complaint || '',
    q6_frequency: state.answers.q6_frequency || '',
    q7_stool_type: state.answers.q7_stool_type || '',
    q8_bloating_timing: state.answers.q8_bloating_timing || '',
    q9_pain_location: state.answers.q9_pain_location || '',
    q10_duration: state.answers.q10_duration || '',
    q11_diagnoses: Array.isArray(state.answers.q11_diagnoses)
      ? state.answers.q11_diagnoses.join(', ')
      : (state.answers.q11_diagnoses || ''),
    q12_treatments: Array.isArray(state.answers.q12_treatments)
      ? state.answers.q12_treatments.join(', ')
      : (state.answers.q12_treatments || ''),
    q13_stress_impact: state.answers.q13_stress_impact || '',
    q14_anxiety_depression: state.answers.q14_anxiety_depression || '',
    q15_sleep_quality: state.answers.q15_sleep_quality || '',
    q16_life_impact: state.answers.q16_life_impact || '',

    // Timestamp
    submitted_at: new Date().toISOString()
  };

  // Save to localStorage as backup
  try {
    const existingData = localStorage.getItem('gutQuizRedFlagExits') || '[]';
    const submissions = JSON.parse(existingData);
    submissions.push(payload);
    localStorage.setItem('gutQuizRedFlagExits', JSON.stringify(submissions));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }

  // Submit to Make.com webhook
  try {
    const response = await fetch(CONFIG.WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('Webhook submission failed:', response.statusText);
    } else {
      console.log('Red flag exit submission successful');
    }
  } catch (error) {
    console.error('Error submitting to webhook:', error);
  }
}
