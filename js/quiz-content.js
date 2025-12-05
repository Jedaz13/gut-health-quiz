// Quiz Content Data Structure
// All messages, questions, and flow logic

const quizContent = {

  // INTRO SEQUENCE
  intro: [
    {
      type: "message",
      delay: 1500,
      content: "Hi! I'm Rebecca, one of the clinical nutritionists here at Gut Healing Academy.\n\nI'll be guiding you through this assessment today."
    },
    {
      type: "message",
      delay: 1000,
      content: "With years of helping women overcome chronic digestive issues, I've learned that gut problems aren't one-size-fits-all. What works for one person can make another worse.\n\nThat's why we start here - understanding YOUR specific pattern."
    },
    {
      type: "message",
      delay: 1000,
      content: "This takes about 5 minutes. Your answers stay confidential, and at the end, I'll personally review your responses and send you a protocol matched to your exact situation.\n\nReady to get started?"
    },
    {
      type: "buttons",
      options: [
        { text: "Yes, let's do this", value: "start", next: "part1_intro" },
        { text: "Tell me more first", value: "more_info", next: "more_info" }
      ]
    }
  ],

  more_info: [
    {
      type: "message",
      delay: 1000,
      content: "Of course!\n\nThis assessment uses the same diagnostic framework gastroenterologists use (called Rome IV criteria) to identify your symptom pattern.\n\nBased on your answers, we'll match you to one of 6 clinically-developed protocols - covering everything from bloating-dominant patterns to gut-brain connection issues.\n\nYou'll receive your personalized protocol within 24-48 hours, reviewed by our team.\n\nNo generic advice. No guessing."
    },
    {
      type: "buttons",
      options: [
        { text: "Ready now", value: "start", next: "part1_intro" }
      ]
    }
  ],

  // PART 1: SAFETY SCREENING
  part1_intro: [
    {
      type: "message",
      delay: 1000,
      content: "Before we dive into your symptoms, I need to ask a few safety questions.\n\nThese help me make sure this assessment is right for you - and that you don't need to see a doctor first."
    },
    {
      type: "question",
      id: "q1_weight_loss",
      delay: 800,
      content: "Have you lost more than 10 lbs in the past 3 months without trying to?",
      inputType: "single",
      options: [
        { text: "Yes", value: "yes", redFlag: true },
        { text: "No", value: "no", redFlag: false }
      ],
      next: "q2_blood"
    }
  ],

  q2_blood: [
    {
      type: "question",
      id: "q2_blood",
      delay: 800,
      content: "Have you noticed blood in your stool, or stools that are black and tarry?",
      inputType: "single",
      options: [
        { text: "Yes", value: "yes", redFlag: true },
        { text: "No", value: "no", redFlag: false }
      ],
      next: "q3_family_history"
    }
  ],

  q3_family_history: [
    {
      type: "question",
      id: "q3_family_history",
      delay: 800,
      content: "Does anyone in your immediate family have colon cancer or inflammatory bowel disease (Crohn's, Ulcerative Colitis)?",
      inputType: "single",
      options: [
        { text: "Yes", value: "yes", redFlag: true },
        { text: "No", value: "no", redFlag: false },
        { text: "I'm not sure", value: "unsure", redFlag: false }
      ],
      next: "q4_colonoscopy"
    }
  ],

  q4_colonoscopy: [
    {
      type: "question",
      id: "q4_colonoscopy",
      delay: 800,
      content: "Are you over 50 and have NOT had a colonoscopy in the past 10 years?",
      inputType: "single",
      options: [
        { text: "Yes", value: "yes", redFlag: true },
        { text: "No", value: "no", redFlag: false },
        { text: "I'm under 50", value: "under50", redFlag: false }
      ],
      next: "check_red_flags"
    }
  ],

  // RED FLAG HANDLING
  red_flag_warning: [
    {
      type: "message",
      delay: 1000,
      content: "I want to pause here for a moment.\n\nBased on what you've shared, I'd recommend speaking with a doctor before starting any gut protocol.",
      isWarning: true
    },
    {
      type: "message",
      delay: 1000,
      content: "This doesn't mean something is wrong - it just means your symptoms deserve professional evaluation first. Many women get cleared quickly and come right back to complete this.\n\nOur protocols are designed to complement medical care, not replace it. I want you to heal safely."
    },
    {
      type: "buttons",
      options: [
        { text: "I understand - I'll return after seeing my doctor", value: "exit", next: "exit_message" },
        { text: "I've already been evaluated and cleared", value: "continue", next: "part2_intro" }
      ]
    }
  ],

  exit_message: [
    {
      type: "message",
      delay: 1000,
      content: "That's the right call.\n\nBefore you go - I'd love to send you some gentle gut-supportive tips you can use while you wait for your appointment. Nothing intense, just small things that can help you feel a bit better in the meantime."
    },
    {
      type: "question",
      id: "exit_name",
      delay: 800,
      content: "What's your first name?",
      inputType: "name",
      placeholder: "Your first name",
      next: "exit_get_email"
    }
  ],

  exit_get_email: [
    {
      type: "message",
      delay: 800,
      content: "Nice to meet you, {{name}}!\n\nWhere should I send your supportive tips?"
    },
    {
      type: "question",
      id: "exit_email",
      delay: 500,
      inputType: "email",
      placeholder: "your@email.com",
      next: "exit_final"
    }
  ],

  exit_final: [
    {
      type: "message",
      delay: 1000,
      content: "Perfect, {{name}}! I'll send those tips your way.\n\nOnce you've been cleared by your doctor, come back and complete this assessment - we'll match you to the right protocol for your situation."
    },
    {
      type: "message",
      delay: 1000,
      content: "Take care of yourself, and I'll see you soon."
    }
  ],

  // PART 2: SYMPTOM PATTERN
  part2_intro: [
    {
      type: "message",
      delay: 1000,
      content: "Great - let's move forward."
    },
    {
      type: "message",
      delay: 1000,
      content: "Now I want to understand what's actually going on with your gut.\n\nThese next questions are based on the Rome IV criteria - the same diagnostic framework gastroenterologists use worldwide."
    },
    {
      type: "question",
      id: "q5_primary_complaint",
      delay: 800,
      content: "What bothers you MOST right now? Pick the one that dominates your day.",
      inputType: "single",
      options: [
        { text: "Bloating - I wake up flat and look pregnant by evening", value: "bloating" },
        { text: "Constipation - Not going for days, pushing hard, never feeling fully \"done\"", value: "constipation" },
        { text: "Diarrhea - Urgency, loose stools, can't trust my body", value: "diarrhea" },
        { text: "The unpredictability - I swing between constipation and diarrhea", value: "mixed" },
        { text: "Pain and cramping that disrupts my focus", value: "pain" },
        { text: "Gas that makes me avoid being around people", value: "gas" },
        { text: "Heartburn or reflux that burns no matter what I eat", value: "reflux" }
      ],
      next: "q6_frequency"
    }
  ],

  q6_frequency: [
    {
      type: "question",
      id: "q6_frequency",
      delay: 800,
      content: "How often does this happen?",
      inputType: "single",
      options: [
        { text: "Every single day - it's my baseline now", value: "daily" },
        { text: "Several times a week - I'm always bracing for it", value: "several_weekly" },
        { text: "Weekly - bad days are predictable", value: "weekly" },
        { text: "A few times a month - flares come and go", value: "monthly" }
      ],
      next: "q7_bm_relief"
    }
  ],

  q7_bm_relief: [
    {
      type: "question",
      id: "q7_bm_relief",
      delay: 800,
      content: "When you do have a bowel movement, does your pain or discomfort get better?",
      inputType: "single",
      options: [
        { text: "Yes - relief is temporary but real", value: "yes" },
        { text: "Sometimes - it's unpredictable", value: "sometimes" },
        { text: "No - going doesn't help the pain", value: "no" },
        { text: "I don't really have pain, just other symptoms", value: "no_pain" }
      ],
      next: "q8_frequency_change"
    }
  ],

  q8_frequency_change: [
    {
      type: "question",
      id: "q8_frequency_change",
      delay: 800,
      content: "During a flare, what happens to your bathroom frequency?",
      inputType: "single",
      options: [
        { text: "I go MORE often", value: "more" },
        { text: "I go LESS often", value: "less" },
        { text: "It swings both ways depending on the day", value: "both" },
        { text: "Frequency doesn't really change", value: "no_change" }
      ],
      next: "q9_stool_change"
    }
  ],

  q9_stool_change: [
    {
      type: "question",
      id: "q9_stool_change",
      delay: 800,
      content: "What about your stool during flares - what changes?",
      inputType: "single",
      options: [
        { text: "It gets loose, watery, or urgent", value: "loose" },
        { text: "It gets hard, lumpy, or difficult to pass", value: "hard" },
        { text: "It alternates - I never know which it'll be", value: "alternates" },
        { text: "It stays about the same", value: "same" }
      ],
      next: "part3_intro"
    }
  ],

  // PART 3: HISTORY
  part3_intro: [
    {
      type: "message",
      delay: 1000,
      content: "Now let's talk about what you've already been through.\n\nI know you've tried things. Probably a lot of things. The average woman I work with has already spent thousands on supplements, diets, and appointments that didn't work.\n\nThis helps me understand what hasn't worked so we don't waste your time repeating it."
    },
    {
      type: "question",
      id: "q10_duration",
      delay: 800,
      content: "How long have you been dealing with gut issues?",
      inputType: "single",
      options: [
        { text: "3-6 months - this is relatively new", value: "3-6_months" },
        { text: "6-12 months - it's becoming my normal", value: "6-12_months" },
        { text: "1-3 years - I've tried a few things", value: "1-3_years" },
        { text: "3-5 years - I've tried many things", value: "3-5_years" },
        { text: "5+ years - I've tried everything", value: "5+_years" }
      ],
      next: "q11_diagnosis"
    }
  ],

  q11_diagnosis: [
    {
      type: "question",
      id: "q11_diagnosis",
      delay: 800,
      content: "Have you received any diagnosis? Select all that apply.",
      inputType: "multi",
      options: [
        { text: "IBS (Irritable Bowel Syndrome)", value: "ibs" },
        { text: "SIBO (Small Intestinal Bacterial Overgrowth)", value: "sibo" },
        { text: "IBD (Crohn's or Ulcerative Colitis)", value: "ibd" },
        { text: "GERD / Acid Reflux", value: "gerd" },
        { text: "Food intolerances or sensitivities", value: "food_intolerance" },
        { text: "No formal diagnosis - doctors say tests look \"normal\"", value: "no_diagnosis" },
        { text: "Other", value: "other" }
      ],
      next: "q12_tried"
    }
  ],

  q12_tried: [
    {
      type: "question",
      id: "q12_tried",
      delay: 800,
      content: "What have you already tried? Select all that apply.",
      inputType: "multi",
      options: [
        { text: "Low FODMAP diet", value: "low_fodmap" },
        { text: "Gluten-free", value: "gluten_free" },
        { text: "Dairy-free", value: "dairy_free" },
        { text: "Probiotics (any brand)", value: "probiotics" },
        { text: "Digestive enzymes", value: "enzymes" },
        { text: "Prescription medications (PPIs, antispasmodics, etc.)", value: "prescription" },
        { text: "Antibiotics for SIBO (Rifaximin, etc.)", value: "sibo_antibiotics" },
        { text: "Herbal antimicrobials", value: "herbal" },
        { text: "Strict elimination diets", value: "elimination" },
        { text: "Nothing yet - I'm just starting to look for answers", value: "nothing" }
      ],
      next: "part4_intro"
    }
  ],

  // PART 4: GUT-BRAIN CONNECTION
  part4_intro: [
    {
      type: "message",
      delay: 1000,
      content: "Now I want to ask about something most gut programs completely miss.\n\nEver notice how stress goes straight to your stomach? That knot before a big meeting. The bathroom urgency before a flight.\n\nThat's not coincidence - it's biology."
    },
    {
      type: "message",
      delay: 1200,
      content: "Your gut and brain are connected by a direct nerve line called the vagus nerve. Think of it like a two-way phone call that never hangs up.\n\nWhen your brain panics, your gut gets the message instantly. When your gut is inflamed, your brain feels foggy and anxious.\n\nThis is why you can't diet your way out of a stressed gut. And why calming your mind alone won't fix a bacterial imbalance.\n\nWe have to work both ends of the line."
    },
    {
      type: "question",
      id: "q13_stress",
      delay: 800,
      content: "When life gets stressful, what happens to your gut?",
      inputType: "single",
      options: [
        { text: "It gets significantly worse - stress is a clear trigger", value: "significant" },
        { text: "There's some connection, but it's not the whole picture", value: "some" },
        { text: "Honestly, I haven't noticed a pattern", value: "none" }
      ],
      next: "q14_mental_health"
    }
  ],

  q14_mental_health: [
    {
      type: "question",
      id: "q14_mental_health",
      delay: 800,
      content: "Has dealing with your gut affected your mental health?",
      inputType: "single",
      options: [
        { text: "Yes - I feel anxious, depressed, or hopeless because of this", value: "yes" },
        { text: "Sometimes - bad gut days are bad mental health days", value: "sometimes" },
        { text: "No - my mood is separate from my gut", value: "no" }
      ],
      next: "q15_sleep"
    }
  ],

  q15_sleep: [
    {
      type: "question",
      id: "q15_sleep",
      delay: 800,
      content: "How's your sleep?",
      inputType: "single",
      options: [
        { text: "Poor - I wake up, can't fall asleep, or don't feel rested", value: "poor" },
        { text: "Hit or miss - some nights okay, others rough", value: "mixed" },
        { text: "Generally good - sleep isn't my issue", value: "good" }
      ],
      next: "part5_intro"
    }
  ],

  // PART 5: LIFE IMPACT
  part5_intro: [
    {
      type: "message",
      delay: 1000,
      content: "We're almost done. These last questions aren't about your symptoms.\n\nThey're about what your gut has stolen from you."
    },
    {
      type: "message",
      delay: 1000,
      content: "The trips you didn't take. The dinners you skipped. The moments you were there physically but mentally mapping the nearest bathroom.\n\nI ask because healing isn't just about better digestion. It's about getting your life back."
    },
    {
      type: "question",
      id: "q16_life_impact",
      delay: 800,
      content: "How much has this taken from your life?",
      inputType: "single",
      options: [
        { text: "Everything - I've changed jobs, stopped traveling, missed things I can't get back", value: "severe" },
        { text: "A lot - I regularly say no to things I want to say yes to", value: "moderate" },
        { text: "Some - it's frustrating but I manage around it", value: "mild" }
      ],
      next: "q17_hardest_part"
    }
  ],

  q17_hardest_part: [
    {
      type: "message",
      delay: 800,
      content: "I'd like to hear from you directly now.\n\nIn your own words: What's the hardest part about living with gut issues right now?\n\nBe specific. Maybe it's dreading lunch at work. Maybe it's your daughter's wedding next year. Maybe it's how your partner looks at you when you cancel plans again.\n\nWhatever it is - I want to hear it."
    },
    {
      type: "question",
      id: "q17_hardest_part",
      delay: 500,
      inputType: "text",
      placeholder: "Type your response here...",
      next: "q17_response"
    }
  ],

  q17_response: [
    {
      type: "message",
      delay: 1000,
      content: "Thank you for sharing that. I know it's not easy."
    },
    {
      type: "message",
      delay: 800,
      content: "One more question:\n\nIf you woke up tomorrow and your gut just... worked - what would you do first? What would feel different?\n\nPicture it. Eating without calculating. Getting dressed without planning for bloating. Saying yes to that trip."
    },
    {
      type: "question",
      id: "q18_vision",
      delay: 500,
      inputType: "text",
      placeholder: "Type your response here...",
      next: "email_capture"
    }
  ],

  // EMAIL CAPTURE
  email_capture: [
    {
      type: "message",
      delay: 1000,
      content: "I have a clear picture now of what's going on.\n\nBased on everything you've shared, I'm going to match you to one of our 6 clinically-developed protocols - specific to YOUR symptom pattern.\n\nThis isn't generic advice. It's a week-by-week plan built for exactly what you're dealing with."
    },
    {
      type: "question",
      id: "name",
      delay: 800,
      content: "What's your first name?",
      inputType: "name",
      placeholder: "Your first name",
      next: "get_email"
    }
  ],

  get_email: [
    {
      type: "message",
      delay: 800,
      content: "Nice to meet you, {{name}}!\n\nWhere should I send your personalized protocol?"
    },
    {
      type: "question",
      id: "email",
      delay: 500,
      inputType: "email",
      placeholder: "your@email.com",
      next: "final_message"
    }
  ],

  final_message: [
    {
      type: "message",
      delay: 1000,
      content: "Perfect. Here's what happens next:\n\n✓ I'll personally review your responses\n✓ Match you to the right protocol for your pattern\n✓ Send everything to your inbox within 24-48 hours"
    },
    {
      type: "message",
      delay: 1000,
      content: "Your protocol will include:\n\n• Your specific gut pattern identified\n• Week 1 daily interventions matched to YOUR symptoms\n• The exact foods to focus on (and avoid) for your pattern\n• What to track so you can see progress"
    },
    {
      type: "message",
      delay: 800,
      content: "Ready to get your protocol?"
    },
    {
      type: "buttons",
      options: [
        { text: "Get My Protocol", value: "submit", next: "confirmation" }
      ]
    }
  ],

  confirmation: [
    {
      type: "message",
      delay: 1000,
      content: "Done!\n\nThank you, {{name}}. Your assessment is with me now.\n\nCheck your inbox within 24-48 hours for your personalized gut healing protocol."
    },
    {
      type: "message",
      delay: 1000,
      content: "The fact that you took 5 minutes to do this tells me something important - you're ready to stop guessing and start healing.\n\nThat's exactly where real change begins.\n\nTalk soon,\nRebecca"
    }
  ]
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = quizContent;
}
