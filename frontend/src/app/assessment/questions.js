export const questions = [
  // ===== READING BASED (1–6) =====
  {
    id: 1,
    stimulusType: "paragraph",
    stimulus: "Read the following paragraph explaining how photosynthesis works.",
    question: "After reading, what do you do next?",
    options: [
      { text: "Rewrite the process in your own words", style: "R" },
      { text: "Draw a diagram of the process", style: "V" },
      { text: "Explain it aloud to yourself or someone", style: "A" },
      { text: "Try to relate it to a real-life example", style: "K" }
    ]
  },

  {
    id: 2,
    stimulusType: "reading",
    question: "You are given a two-page article describing climate change causes. To understand it better, you:",
    options: [
      { text: "Highlight and annotate the text", style: "R" },
      { text: "Convert it into a flowchart", style: "V" },
      { text: "Discuss it with a friend", style: "A" },
      { text: "Apply the ideas to real-world situations", style: "K" }
    ]
  },

  {
    id: 3,
    stimulusType: "reading",
    question: "You read instructions to solve a math problem. Before solving, you usually:",
    options: [
      { text: "Re-read the steps carefully", style: "R" },
      { text: "Visualize the problem in your head", style: "V" },
      { text: "Read it aloud", style: "A" },
      { text: "Start solving and adjust as you go", style: "K" }
    ]
  },

  {
    id: 4,
    stimulusType: "reading",
    question: "After reading a long theoretical explanation, you remember it best if you:",
    options: [
      { text: "Summarize it in writing", style: "R" },
      { text: "Sketch key points", style: "V" },
      { text: "Talk through the concept", style: "A" },
      { text: "Practice using it", style: "K" }
    ]
  },

  {
    id: 5,
    stimulusType: "reading",
    question: "You’re asked to learn from a PDF with no images. You mostly:",
    options: [
      { text: "Take structured notes", style: "R" },
      { text: "Create diagrams yourself", style: "V" },
      { text: "Read it aloud or use text-to-speech", style: "A" },
      { text: "Skip ahead to examples and problems", style: "K" }
    ]
  },

  {
    id: 6,
    stimulusType: "reading",
    stimulus:
      "Photosynthesis is the process by which green plants use sunlight, carbon dioxide, and water to produce glucose and oxygen. This process occurs in the chloroplasts and is essential for life on Earth.",
    question: "When reading becomes difficult, you:",
    options: [
      { text: "Slow down and re-read", style: "R" },
      { text: "Add visuals to help understanding", style: "V" },
      { text: "Ask someone to explain", style: "A" },
      { text: "Try using the knowledge practically", style: "K" }
    ]
  },

  {
    id: 7,
    stimulusType: "audio",
    question: "You listen to an audio explanation of a scientific process. After listening, you:",
    options: [
      { text: "Replay the audio", style: "A" },
      { text: "Visualize the process", style: "V" },
      { text: "Write down what you understood", style: "R" },
      { text: "Try applying the idea", style: "K" }
    ]
  },

  {
    id: 8,
    stimulusType: "audio",
    question: "A lecture is given without slides. You understand best when you:",
    options: [
      { text: "Focus on the speaker’s words", style: "A" },
      { text: "Imagine diagrams mentally", style: "V" },
      { text: "Take detailed notes", style: "R" },
      { text: "Later try solving related problems", style: "K" }
    ]
  },

  {
    id: 9,
    stimulusType: "audio",
    question: "You are learning pronunciation through audio clips. You mostly:",
    options: [
      { text: "Listen repeatedly", style: "A" },
      { text: "Watch videos with mouth movements", style: "V" },
      { text: "Read phonetic spellings", style: "R" },
      { text: "Practice speaking in conversations", style: "K" }
    ]
  },

  {
    id: 10,
    stimulusType: "audio",
    question: "After hearing instructions once, you prefer to:",
    options: [
      { text: "Hear them again", style: "A" },
      { text: "See them written or drawn", style: "V" },
      { text: "Write them down", style: "R" },
      { text: "Try the task immediately", style: "K" }
    ]
  },

  {
    id: 11,
    stimulusType: "audio",
    question: "If an explanation is only spoken, you:",
    options: [
      { text: "Enjoy and follow it easily", style: "A" },
      { text: "Wish for visuals", style: "V" },
      { text: "Convert it into notes", style: "R" },
      { text: "Feel the need to do something hands-on", style: "K" }
    ]
  },

  {
    id: 12,
    stimulusType: "audio",
    question: "While listening to a complex topic, you remember more if you:",
    options: [
      { text: "Focus carefully on the speaker", style: "A" },
      { text: "Imagine the concept visually", style: "V" },
      { text: "Write key points", style: "R" },
      { text: "Apply it later", style: "K" }
    ]
  },

  // ===== VISUAL & MIXED (13–18) =====
  {
    id: 13,
    stimulusType: "visual",
    question: "You are shown a diagram explaining a system. To fully understand it, you:",
    options: [
      { text: "Study it carefully", style: "V" },
      { text: "Listen to someone explain it", style: "A" },
      { text: "Write an explanation", style: "R" },
      { text: "Build or simulate the system", style: "K" }
    ]
  },

  {
    id: 14,
    stimulusType: "visual",
    question: "You watch an animation explaining a concept. After watching, you:",
    options: [
      { text: "Replay the video", style: "V" },
      { text: "Sketch what you saw", style: "V" },
      { text: "Describe it in words", style: "R" },
      { text: "Try doing a related activity", style: "K" }
    ]
  },

  {
    id: 15,
    stimulusType: "visual",
    question: "You see a chart with complex data. You understand it best by:",
    options: [
      { text: "Observing patterns visually", style: "V" },
      { text: "Having it explained verbally", style: "A" },
      { text: "Writing a summary", style: "R" },
      { text: "Using the data in a task", style: "K" }
    ]
  },

  {
    id: 16,
    stimulusType: "visual",
    question: "When studying with slides, you prefer:",
    options: [
      { text: "Slides with diagrams", style: "V" },
      { text: "Teacher explanation alongside", style: "A" },
      { text: "Text-heavy slides", style: "R" },
      { text: "Examples or demos", style: "K" }
    ]
  },

  {
    id: 17,
    stimulusType: "visual",
    question: "A flowchart is shown in class. You remember it better when you:",
    options: [
      { text: "Memorize the visual", style: "V" },
      { text: "Hear it explained", style: "A" },
      { text: "Rewrite it in words", style: "R" },
      { text: "Apply it step-by-step", style: "K" }
    ]
  },

  {
    id: 18,
    stimulusType: "visual",
    question: "If a diagram is unclear, you:",
    options: [
      { text: "Look at similar diagrams", style: "V" },
      { text: "Ask someone to explain", style: "A" },
      { text: "Read about it", style: "R" },
      { text: "Try recreating it physically", style: "K" }
    ]
  },

  // ===== ACTION & REAL WORLD (19–25) =====
  {
    id: 19,
    stimulusType: "task",
    question: "You are learning how to use a new device. You prefer to:",
    options: [
      { text: "Watch a demo", style: "V" },
      { text: "Listen to instructions", style: "A" },
      { text: "Read the manual", style: "R" },
      { text: "Explore it hands-on", style: "K" }
    ]
  },

  {
    id: 20,
    stimulusType: "task",
    question: "In a lab or practical session, you learn best by:",
    options: [
      { text: "Observing the experiment", style: "V" },
      { text: "Listening to instructions", style: "A" },
      { text: "Reading the procedure", style: "R" },
      { text: "Performing the experiment", style: "K" }
    ]
  },

  {
    id: 21,
    stimulusType: "task",
    question: "You understand a concept completely only after you:",
    options: [
      { text: "See it clearly", style: "V" },
      { text: "Hear it explained", style: "A" },
      { text: "Write about it", style: "R" },
      { text: "Do something with it", style: "K" }
    ]
  },

  {
    id: 22,
    stimulusType: "problem-solving",
    question: "While solving problems, you usually:",
    options: [
      { text: "Refer to diagrams", style: "V" },
      { text: "Think aloud", style: "A" },
      { text: "Write detailed steps", style: "R" },
      { text: "Learn through trial and error", style: "K" }
    ]
  },

  {
    id: 23,
    stimulusType: "revision",
    question: "Before an exam, you revise by:",
    options: [
      { text: "Reviewing visuals", style: "V" },
      { text: "Discussing with others", style: "A" },
      { text: "Reading and writing notes", style: "R" },
      { text: "Practicing questions", style: "K" }
    ]
  },

  {
    id: 24,
    stimulusType: "teaching",
    question: "If teaching someone else, you would:",
    options: [
      { text: "Use images and charts", style: "V" },
      { text: "Explain verbally", style: "A" },
      { text: "Give written notes", style: "R" },
      { text: "Demonstrate practically", style: "K" }
    ]
  },

  {
    id: 25,
    stimulusType: "final",
    question: "When learning something new, you feel confident when you can:",
    options: [
      { text: "Visualize it", style: "V" },
      { text: "Explain it aloud", style: "A" },
      { text: "Write it clearly", style: "R" },
      { text: "Apply it practically", style: "K" }
    ]
  }
];
