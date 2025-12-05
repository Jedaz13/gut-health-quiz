// Quiz Logic - Scoring, Red Flags, and Protocol Determination

/**
 * Check for red flags in safety screening answers
 * @param {Object} answers - User's answers object
 * @returns {boolean} - True if any red flags are present
 */
function checkRedFlags(answers) {
  const redFlagQuestions = ['q1_weight_loss', 'q2_blood', 'q3_family_history', 'q4_colonoscopy'];

  return redFlagQuestions.some(q => {
    const answer = answers[q];
    return answer === 'yes';
  });
}

/**
 * Determine the appropriate protocol based on user answers
 * @param {Object} answers - User's answers object
 * @returns {Object} - Protocol object with number, name, and description
 */
function determineProtocol(answers) {
  const {
    q5_primary_complaint,
    q8_frequency_change,
    q9_stool_change,
    q11_diagnosis,
    q12_tried,
    q13_stress,
    q14_mental_health
  } = answers;

  // Protocol 6: Gut-Brain Dominant (check first as it can override)
  if (q13_stress === 'significant' && q14_mental_health === 'yes') {
    return {
      protocol: 6,
      name: 'Gut-Brain Dominant',
      description: 'Stress-Triggered Pattern'
    };
  }

  // Protocol 5: Post-SIBO Recovery
  // Check if diagnosis includes SIBO or if they've tried SIBO antibiotics
  const hasSIBO = Array.isArray(q11_diagnosis)
    ? q11_diagnosis.includes('sibo')
    : q11_diagnosis === 'sibo';
  const triedSIBOAntibiotics = Array.isArray(q12_tried)
    ? q12_tried.includes('sibo_antibiotics')
    : q12_tried === 'sibo_antibiotics';

  if (hasSIBO || triedSIBOAntibiotics) {
    return {
      protocol: 5,
      name: 'Post-SIBO Recovery',
      description: 'Post-Antibiotic Recovery Pattern'
    };
  }

  // Protocol 4: Mixed/Alternating (IBS-M)
  if (q8_frequency_change === 'both' || q9_stool_change === 'alternates' || q5_primary_complaint === 'mixed') {
    return {
      protocol: 4,
      name: 'Mixed Pattern',
      description: 'IBS-M / Alternating Pattern'
    };
  }

  // Protocol 3: Diarrhea-Dominant (IBS-D)
  if (q5_primary_complaint === 'diarrhea' || (q8_frequency_change === 'more' && q9_stool_change === 'loose')) {
    return {
      protocol: 3,
      name: 'Diarrhea-Dominant',
      description: 'IBS-D Pattern'
    };
  }

  // Protocol 2: Constipation-Dominant (IBS-C)
  if (q5_primary_complaint === 'constipation' || (q8_frequency_change === 'less' && q9_stool_change === 'hard')) {
    return {
      protocol: 2,
      name: 'Constipation-Dominant',
      description: 'IBS-C Pattern'
    };
  }

  // Protocol 1: Bloating-Dominant (default for bloating or gas)
  if (q5_primary_complaint === 'bloating' || q5_primary_complaint === 'gas') {
    return {
      protocol: 1,
      name: 'Bloating-Dominant',
      description: 'Bloating Pattern'
    };
  }

  // Default fallback
  return {
    protocol: 1,
    name: 'Bloating-Dominant',
    description: 'General Gut Health Pattern'
  };
}

/**
 * Check if stress component should be added to protocol
 * @param {Object} answers - User's answers object
 * @param {Object} protocol - Current protocol object
 * @returns {Object} - Modified protocol with stress component if applicable
 */
function addStressComponent(answers, protocol) {
  const { q13_stress, q14_mental_health } = answers;

  // If already Gut-Brain protocol, no modification needed
  if (protocol.protocol === 6) {
    return protocol;
  }

  // Add gut-brain support if significant stress connection
  if (q13_stress === 'significant' || q14_mental_health === 'yes') {
    return {
      ...protocol,
      name: `${protocol.name} (with Gut-Brain support)`,
      hasStressComponent: true
    };
  }

  return protocol;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate name (not empty, reasonable length)
 * @param {string} name - Name to validate
 * @returns {boolean} - True if valid name
 */
function isValidName(name) {
  return name && name.trim().length >= 1 && name.trim().length <= 100;
}

/**
 * Format submission data for storage/sending
 * @param {Object} answers - User's answers
 * @param {Object} protocol - Determined protocol
 * @param {string} name - User's name
 * @param {string} email - User's email
 * @returns {Object} - Formatted submission data
 */
function formatSubmissionData(answers, protocol, name, email) {
  return {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    name: name,
    email: email,
    protocol: protocol,
    answers: answers,
    openResponses: {
      hardestPart: answers.q17_hardest_part || '',
      vision: answers.q18_vision || ''
    },
    metadata: {
      hasRedFlags: answers.had_red_flags === true,
      continuedAfterWarning: answers.continued_after_warning === true,
      completedAt: new Date().toISOString()
    }
  };
}

/**
 * Save submission to localStorage (MVP approach)
 * @param {Object} submission - Submission data
 */
function saveToLocalStorage(submission) {
  try {
    const existing = JSON.parse(localStorage.getItem('quizSubmissions') || '[]');
    existing.push(submission);
    localStorage.setItem('quizSubmissions', JSON.stringify(existing));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
}

/**
 * Get all submissions from localStorage (for admin use)
 * @returns {Array} - Array of submissions
 */
function getSubmissionsFromStorage() {
  try {
    return JSON.parse(localStorage.getItem('quizSubmissions') || '[]');
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    checkRedFlags,
    determineProtocol,
    addStressComponent,
    isValidEmail,
    isValidName,
    formatSubmissionData,
    saveToLocalStorage,
    getSubmissionsFromStorage
  };
}
