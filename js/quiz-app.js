// Quiz Application - Main Controller
// Dependencies: quiz-content.js, quiz-logic.js

// Configuration
const CONFIG = {
  // Formspree form ID - replace with your actual form ID
  FORMSPREE_URL: 'https://formspree.io/f/YOUR_FORM_ID',
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
      await showTypingIndicator(delay);
      addMessage(replaceVariables(step.content), 'rebecca');

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
 * Render option buttons
 * @param {Array} options - Array of option objects
 */
function renderButtons(options) {
  const container = document.createElement('div');
  container.className = 'options-container';

  options.forEach(option => {
    const button = document.createElement('button');
    button.className = 'option-button';
    button.textContent = option.text;
    button.dataset.value = option.value;
    button.dataset.next = option.next || '';
    container.appendChild(button);
  });

  inputContainer.innerHTML = '';
  inputContainer.appendChild(container);
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
    const handleClick = (e) => {
      if (e.target.classList.contains('option-button')) {
        const value = e.target.dataset.value;
        const next = e.target.dataset.next;
        const text = e.target.textContent;

        // Add user message
        addMessage(text, 'user');

        // Clear input
        inputContainer.innerHTML = '';

        // Process the selection
        setTimeout(async () => {
          await handleButtonSelection(value, next, options);
          resolve();
        }, 300);
      }
    };

    inputContainer.addEventListener('click', handleClick, { once: true });
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
      renderButtons(step.options);

      const handleClick = async (e) => {
        if (e.target.classList.contains('option-button')) {
          const value = e.target.dataset.value;
          const text = e.target.textContent;

          addMessage(text, 'user');
          inputContainer.innerHTML = '';

          // Store answer
          state.answers[step.id] = value;

          // Check for red flag
          const option = step.options.find(o => o.value === value);
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
        }
      };

      inputContainer.addEventListener('click', handleClick, { once: true });

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
        if (step.id === 'name') {
          state.userName = value;
        } else if (step.id === 'email') {
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
 * Scroll chat area to bottom
 */
function scrollToBottom() {
  setTimeout(() => {
    chatArea.scrollTop = chatArea.scrollHeight;
  }, 50);
}

/**
 * Submit the quiz data to Formspree
 */
async function submitToFormspree() {
  const submission = formatSubmissionData(
    state.answers,
    state.protocol,
    state.userName,
    state.userEmail
  );

  // Save to localStorage as backup
  saveToLocalStorage(submission);

  // Submit to Formspree
  try {
    const response = await fetch(CONFIG.FORMSPREE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: state.userName,
        email: state.userEmail,
        protocol: state.protocol.name,
        protocol_description: state.protocol.description,
        hardest_part: state.answers.q17_hardest_part || '',
        vision: state.answers.q18_vision || '',
        all_answers: JSON.stringify(state.answers),
        submitted_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.error('Formspree submission failed:', response.statusText);
    } else {
      console.log('Submission successful');
    }
  } catch (error) {
    console.error('Error submitting to Formspree:', error);
  }

  return submission;
}

// Override the confirmation section to trigger form submission
const originalProcessSection = processSection;
processSection = async function(sectionKey) {
  if (sectionKey === 'confirmation') {
    // Submit data before showing confirmation
    await submitToFormspree();
  }
  return originalProcessSection.call(this, sectionKey);
};
