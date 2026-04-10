"use client";

import { useState, useEffect, useRef } from "react";

const BG = "#0f172a";
const BG_SURFACE = "#1e293b";
const BG_CARD = "#1e293b";
const BG_ELEVATED = "#273449";
const BLUE = "#3b82f6";
const BLUE_LIGHT = "rgba(59,130,246,0.12)";
const BLUE_MID = "rgba(59,130,246,0.18)";
const BLUE_DARK = "#2563eb";
const BLUE_SOFT = "rgba(59,130,246,0.3)";
const TEXT = "#f1f5f9";
const TEXT_MUTED = "#94a3b8";
const BORDER = "#2d3f55";
const BORDER_MID = "#334155";
const WHITE = "#ffffff";

const questions = [
  {
    id: 1, stimulusType: "reading", tag: "Reading Passage",
    stimulus: {
      type: "passage", label: "Read the following passage carefully, then answer the question below.",
      content: `Photosynthesis is the biochemical process by which plants, algae, and some bacteria convert light energy — usually from the sun — into chemical energy stored as glucose. The process takes place in the chloroplasts, where the green pigment chlorophyll absorbs sunlight. Carbon dioxide is drawn in through tiny pores called stomata, while water is absorbed through the roots. The light energy splits water molecules, releasing oxygen as a byproduct into the atmosphere. The captured energy is then used to combine carbon dioxide molecules into glucose — a sugar the plant uses for growth, repair, and reproduction.`
    },
    question: "You've finished reading that passage. What do you naturally do next to make sure it sticks?",
    options: [
      { text: "Rewrite the key steps in my own words", style: "R" },
      { text: "Sketch a diagram linking sunlight → chlorophyll → glucose", style: "V" },
      { text: "Explain the process aloud to myself or someone else", style: "A" },
      { text: "Think of a real plant and mentally trace the process in it", style: "K" }
    ]
  },
  {
    id: 2, stimulusType: "reading", tag: "Reading Passage",
    stimulus: {
      type: "passage", label: "Read the following excerpt carefully, then answer.",
      content: `Climate change is primarily driven by the greenhouse effect — a process in which certain gases in Earth's atmosphere trap heat from the sun. Carbon dioxide (CO₂), methane (CH₄), and nitrous oxide (N₂O) are the main culprits. Since the Industrial Revolution, human activities such as burning fossil fuels, deforestation, and large-scale agriculture have significantly increased concentrations of these gases. As a result, global average temperatures have risen approximately 1.1°C above pre-industrial levels, causing more frequent extreme weather events, rising sea levels, and disruption to ecosystems worldwide.`
    },
    question: "You need to summarise this excerpt for class. How do you approach it?",
    options: [
      { text: "Highlight key terms, then write a structured paragraph", style: "R" },
      { text: "Convert cause-effect relationships into a flowchart", style: "V" },
      { text: "Discuss the main ideas with a classmate to solidify understanding", style: "A" },
      { text: "Think of real-world examples of each effect mentioned", style: "K" }
    ]
  },
  {
    id: 3, stimulusType: "reading", tag: "Reading Passage",
    stimulus: {
      type: "passage", label: "Read the following word problem carefully before answering.",
      content: `A train departs Station A at 9:00 AM traveling at 80 km/h. Another train departs Station B — which is 400 km away — at 10:00 AM traveling toward Station A at 100 km/h. At what time will the two trains meet? To solve this, you must account for the head start of the first train and set up an equation where the combined distances equal 400 km.`
    },
    question: "Before writing a single number, what do you typically do first?",
    options: [
      { text: "Re-read and underline every piece of given information", style: "R" },
      { text: "Draw a line with both trains and label their positions", style: "V" },
      { text: "Talk through the steps aloud or whisper them to myself", style: "A" },
      { text: "Start plugging in numbers and course-correct as I go", style: "K" }
    ]
  },
  {
    id: 4, stimulusType: "audio", tag: "Audio Clip",
    stimulus: {
      type: "audio", label: "Press play to hear a short explanation, then answer the question below.",
      audioText: `The water cycle — also called the hydrological cycle — describes the continuous movement of water within Earth and its atmosphere. It begins when the sun heats surface water in oceans, lakes, and rivers, causing evaporation: water turns into vapor and rises. As it ascends and cools, it condenses around tiny particles to form clouds in a process called condensation. When enough water droplets gather, they fall back to Earth as precipitation — rain, snow, or hail. This water then flows across land as runoff, soaks into soil, or accumulates in bodies of water, and the cycle begins again.`,
      voiceRate: 0.92, voicePitch: 1.0
    },
    question: "You just listened to that explanation. What helps you retain it best?",
    options: [
      { text: "Listen again, pausing at each stage to absorb it", style: "A" },
      { text: "Visualise each stage — sun, vapor, clouds, rain — as a mental movie", style: "V" },
      { text: "Write out each stage from memory in sequence", style: "R" },
      { text: "Trace the water path through a real river or lake I know", style: "K" }
    ]
  },
  {
    id: 5, stimulusType: "audio", tag: "Audio Clip",
    stimulus: {
      type: "audio", label: "Listen to the following instructions, then answer.",
      audioText: `To safely change a car tire: First, park on a flat stable surface and apply the handbrake. Loosen the lug nuts slightly while the tire is still on the ground. Then place the jack under the vehicle's jack point and raise the car until the flat tire is about six inches off the ground. Remove the lug nuts fully, pull off the flat tire, mount the spare, hand-tighten the lug nuts in a star pattern, lower the car, and then fully tighten the nuts. Check the spare's pressure before driving.`,
      voiceRate: 0.90, voicePitch: 0.95
    },
    question: "You heard those instructions just once. How do you make sure you don't forget them?",
    options: [
      { text: "Replay the audio until the sequence is fixed in memory", style: "A" },
      { text: "Picture each physical step happening as a clear scene", style: "V" },
      { text: "Write them out as a numbered checklist immediately", style: "R" },
      { text: "Head outside and work through each step on an actual car", style: "K" }
    ]
  },
  {
    id: 6, stimulusType: "audio", tag: "Audio Clip",
    stimulus: {
      type: "audio", label: "Listen to this mini-lecture segment, then answer.",
      audioText: `Supply and demand is the foundation of market economics. The law of demand states that as the price of a product rises, consumers will buy less of it — and vice versa. The law of supply states that as price rises, producers are willing to supply more. When these forces interact, they reach an equilibrium price — the point where the quantity consumers want to buy exactly equals the quantity producers want to sell. External factors like consumer preferences, production costs, and government policy can shift these curves, changing the equilibrium.`,
      voiceRate: 0.91, voicePitch: 1.05
    },
    question: "The lecture moves on. To process what you just heard, you:",
    options: [
      { text: "Tune in closely — careful listening is enough for me", style: "A" },
      { text: "Mentally picture the supply-demand graph with crossing curves", style: "V" },
      { text: "Jot down 'demand ↓ as price ↑' and 'supply ↑ as price ↑'", style: "R" },
      { text: "Think of something I recently bought and apply the concept", style: "K" }
    ]
  },
  {
    id: 7, stimulusType: "visual", tag: "Visual Diagram",
    stimulus: { type: "diagram", label: "Study the diagram below carefully, then answer.", diagramType: "cell" },
    question: "After studying the cell diagram, how do you best internalise its structure?",
    options: [
      { text: "Keep examining it until spatial relationships are memorised", style: "V" },
      { text: "Describe what I see aloud: 'nucleus in the centre, mitochondria nearby…'", style: "A" },
      { text: "Write a labelled list: nucleus = control centre, mitochondria = energy…", style: "R" },
      { text: "Sketch my own version from memory to see what I know", style: "K" }
    ]
  },
  {
    id: 8, stimulusType: "visual", tag: "Visual Chart",
    stimulus: { type: "diagram", label: "Examine this bar chart carefully, then answer.", diagramType: "chart" },
    question: "This chart contains a lot of data. What is your instinctive approach to understanding it?",
    options: [
      { text: "Scan for visual patterns — tallest bars, trends, outliers", style: "V" },
      { text: "Ask someone to narrate the key takeaways for me", style: "A" },
      { text: "Write a sentence describing what each group of bars shows", style: "R" },
      { text: "Think about what real decisions this data would influence", style: "K" }
    ]
  },
  {
    id: 9, stimulusType: "visual", tag: "Visual Diagram",
    stimulus: { type: "diagram", label: "Look at the flowchart below, then answer.", diagramType: "flowchart" },
    question: "The flowchart describes a decision process. How do you work through it?",
    options: [
      { text: "Trace each path visually, following arrows with my eyes", style: "V" },
      { text: "Narrate the steps aloud — 'if X then Y, otherwise Z…'", style: "A" },
      { text: "Rewrite the branches as a written if-then list", style: "R" },
      { text: "Plug in a real scenario and walk through the chart with it", style: "K" }
    ]
  },
  {
    id: 10, stimulusType: "scenario", tag: "Scenario",
    stimulus: null,
    question: "You just got a new smartphone. No one explains it to you. What do you do?",
    options: [
      { text: "Watch a YouTube walkthrough or unboxing video", style: "V" },
      { text: "Call a friend and have them guide me through setup verbally", style: "A" },
      { text: "Read the quick-start guide step by step", style: "R" },
      { text: "Start tapping and exploring — figure it out as I go", style: "K" }
    ]
  },
  {
    id: 11, stimulusType: "scenario", tag: "Scenario",
    stimulus: null,
    question: "You're revising the night before a major exam. Your most effective strategy is:",
    options: [
      { text: "Re-reading diagrams, concept maps, and colour-coded notes", style: "V" },
      { text: "Discussing key concepts with a study partner or explaining aloud", style: "A" },
      { text: "Reading notes and rewriting important ideas from memory", style: "R" },
      { text: "Working through as many past questions and problems as possible", style: "K" }
    ]
  },
  {
    id: 12, stimulusType: "scenario", tag: "Scenario",
    stimulus: null,
    question: "You need to teach a difficult concept to a classmate. Your natural approach is:",
    options: [
      { text: "Draw a diagram or visual on paper to show how it works", style: "V" },
      { text: "Explain it conversationally, using analogies and voice", style: "A" },
      { text: "Write a concise explanation or bullet points for them to read", style: "R" },
      { text: "Do a live demonstration or work through a real example together", style: "K" }
    ]
  },
  {
    id: 13, stimulusType: "scenario", tag: "Scenario",
    stimulus: null,
    question: "During a lab session a procedure isn't working. How do you troubleshoot?",
    options: [
      { text: "Re-examine the setup visually to spot what looks off", style: "V" },
      { text: "Talk through each step aloud with a partner", style: "A" },
      { text: "Go back to the written procedure and read it carefully", style: "R" },
      { text: "Adjust variables one by one and observe what changes", style: "K" }
    ]
  },
  {
    id: 14, stimulusType: "scenario", tag: "Scenario",
    stimulus: null,
    question: "You feel you truly 'understand' a concept only when you can:",
    options: [
      { text: "Picture it clearly as an image or mental model", style: "V" },
      { text: "Explain it fluently to someone without hesitating", style: "A" },
      { text: "Write a clear definition or structured explanation", style: "R" },
      { text: "Use it to solve a real problem or complete a task", style: "K" }
    ]
  },
  {
    id: 15, stimulusType: "scenario", tag: "Scenario",
    stimulus: null,
    question: "You encounter a confusing topic. What is your first instinct?",
    options: [
      { text: "Look for a good infographic, video, or visual explanation online", style: "V" },
      { text: "Call or message someone and ask them to explain it", style: "A" },
      { text: "Search for a well-written article or textbook section", style: "R" },
      { text: "Find a practice problem and learn by doing it", style: "K" }
    ]
  }
];

function CellDiagram() {
  return (
    <svg viewBox="0 0 420 280" style={{width:"100%",maxWidth:440,display:"block",margin:"0 auto"}}>
      <ellipse cx="210" cy="140" rx="195" ry="125" fill="rgba(59,130,246,0.08)" stroke="rgba(59,130,246,0.25)" strokeWidth="2" strokeDasharray="7 3"/>
      <ellipse cx="200" cy="130" rx="60" ry="50" fill="rgba(59,130,246,0.15)" stroke={BLUE} strokeWidth="2"/>
      <ellipse cx="200" cy="130" rx="28" ry="22" fill="rgba(59,130,246,0.25)" stroke="#60a5fa" strokeWidth="1.5"/>
      <text x="200" y="134" textAnchor="middle" fontSize="9" fill="#93c5fd" fontWeight="700">Nucleus</text>
      <text x="200" y="145" textAnchor="middle" fontSize="7" fill="#60a5fa">nucleolus</text>
      <ellipse cx="322" cy="98" rx="33" ry="17" fill="rgba(251,191,36,0.12)" stroke="#f59e0b" strokeWidth="1.5"/>
      <line x1="291" y1="98" x2="355" y2="98" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2"/>
      <text x="322" y="102" textAnchor="middle" fontSize="8" fill="#fbbf24">Mitochondria</text>
      <ellipse cx="112" cy="188" rx="28" ry="14" fill="rgba(251,191,36,0.12)" stroke="#f59e0b" strokeWidth="1.5"/>
      <text x="112" y="192" textAnchor="middle" fontSize="7.5" fill="#fbbf24">Mitochondria</text>
      <path d="M265 148 Q285 138 275 162 Q265 182 285 172" fill="none" stroke="#a78bfa" strokeWidth="2"/>
      <text x="297" y="166" fontSize="7.5" fill="#a78bfa">ER</text>
      <path d="M128 100 Q148 95 143 108 Q138 120 158 115 Q178 110 173 123" fill="none" stroke="#34d399" strokeWidth="2"/>
      <text x="136" y="92" textAnchor="middle" fontSize="8" fill="#6ee7b7">Golgi</text>
      {[{cx:308,cy:150},{cx:250,cy:192},{cx:158,cy:212},{cx:338,cy:172}].map((r,i)=>(
        <circle key={i} cx={r.cx} cy={r.cy} r="5" fill="#f59e0b" stroke="#d97706" strokeWidth="1"/>
      ))}
      <text x="352" y="154" fontSize="6.5" fill={TEXT_MUTED}>Ribosomes</text>
      <ellipse cx="193" cy="215" rx="22" ry="14" fill="rgba(6,182,212,0.12)" stroke="#06b6d4" strokeWidth="1.5"/>
      <text x="193" y="219" textAnchor="middle" fontSize="7.5" fill="#67e8f9">Vacuole</text>
      <text x="395" y="34" textAnchor="end" fontSize="8" fill={TEXT_MUTED}>Cell Membrane</text>
      <line x1="368" y1="32" x2="330" y2="18" stroke={BORDER_MID} strokeWidth="1"/>
    </svg>
  );
}

function BarChart() {
  const data = [
    { label: "2019", V: 34, A: 28, R: 22, K: 16 },
    { label: "2020", V: 29, A: 31, R: 25, K: 15 },
    { label: "2021", V: 26, A: 35, R: 22, K: 17 },
    { label: "2022", V: 24, A: 32, R: 27, K: 17 },
    { label: "2023", V: 22, A: 30, R: 29, K: 19 },
  ];
  const colors = { V: "#3b82f6", A: "#06b6d4", R: "#818cf8", K: "#34d399" };
  const maxH = 110; const barW = 10; const groupW = 50;
  const styles = ["V","A","R","K"];
  return (
    <svg viewBox="0 0 320 195" style={{width:"100%",maxWidth:440,display:"block",margin:"0 auto"}}>
      <text x="160" y="14" textAnchor="middle" fontSize="9" fill={TEXT_MUTED} fontWeight="700">Preferred Learning Style by Year (%)</text>
      {[0,25,50,75,100].map(v=>(
        <g key={v}>
          <line x1="40" y1={155-v*maxH/100} x2="295" y2={155-v*maxH/100} stroke={BORDER} strokeWidth="0.8"/>
          <text x="35" y={158-v*maxH/100} textAnchor="end" fontSize="7" fill={TEXT_MUTED}>{v}</text>
        </g>
      ))}
      {data.map((d,gi)=>{
        const gx = 50 + gi*groupW;
        return (
          <g key={d.label}>
            {styles.map((s,si)=>{
              const h = (d[s]/100)*maxH;
              return <rect key={s} x={gx+si*(barW+1)} y={155-h} width={barW} height={h} fill={colors[s]} rx="2" opacity="0.85"/>;
            })}
            <text x={gx+22} y="170" textAnchor="middle" fontSize="8" fill={TEXT_MUTED}>{d.label}</text>
          </g>
        );
      })}
      {styles.map((s,i)=>(
        <g key={s} transform={`translate(${45+i*64},183)`}>
          <rect width="9" height="9" fill={colors[s]} rx="2"/>
          <text x="12" y="8.5" fontSize="7.5" fill={TEXT_MUTED}>{s==="V"?"Visual":s==="A"?"Auditory":s==="R"?"Reading":"Kinesthetic"}</text>
        </g>
      ))}
    </svg>
  );
}

function Flowchart() {
  return (
    <svg viewBox="0 0 340 295" style={{width:"100%",maxWidth:420,display:"block",margin:"0 auto"}}>
      <defs>
        <marker id="arr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L7,3 z" fill={TEXT_MUTED}/>
        </marker>
      </defs>
      <ellipse cx="170" cy="22" rx="55" ry="16" fill={BLUE}/>
      <text x="170" y="26" textAnchor="middle" fontSize="9" fontWeight="700" fill={WHITE}>NEW TOPIC</text>
      <line x1="170" y1="38" x2="170" y2="54" stroke={TEXT_MUTED} strokeWidth="1.5" markerEnd="url(#arr)"/>
      <polygon points="170,57 220,79 170,101 120,79" fill={BG_ELEVATED} stroke={BLUE} strokeWidth="1.5"/>
      <text x="170" y="76" textAnchor="middle" fontSize="8" fill={TEXT}>Prior</text>
      <text x="170" y="86" textAnchor="middle" fontSize="8" fill={TEXT}>knowledge?</text>
      <line x1="220" y1="79" x2="263" y2="79" stroke={TEXT_MUTED} strokeWidth="1.5" markerEnd="url(#arr)"/>
      <text x="240" y="75" textAnchor="middle" fontSize="7.5" fill="#34d399" fontWeight="700">YES</text>
      <rect x="263" y="67" width="62" height="24" rx="6" fill="rgba(52,211,153,0.12)" stroke="#34d399" strokeWidth="1.5"/>
      <text x="294" y="79" textAnchor="middle" fontSize="8" fill="#6ee7b7">Connect &amp;</text>
      <text x="294" y="89" textAnchor="middle" fontSize="8" fill="#6ee7b7">Extend</text>
      <line x1="170" y1="101" x2="170" y2="118" stroke={TEXT_MUTED} strokeWidth="1.5" markerEnd="url(#arr)"/>
      <text x="157" y="113" fontSize="7.5" fill="#f87171" fontWeight="700">NO</text>
      <rect x="115" y="118" width="110" height="26" rx="6" fill={BLUE_MID} stroke={BLUE} strokeWidth="1.5"/>
      <text x="170" y="135" textAnchor="middle" fontSize="8.5" fill="#93c5fd" fontWeight="600">Choose a format</text>
      <line x1="170" y1="144" x2="170" y2="160" stroke={TEXT_MUTED} strokeWidth="1.5" markerEnd="url(#arr)"/>
      <polygon points="170,162 220,184 170,206 120,184" fill={BG_ELEVATED} stroke={BLUE} strokeWidth="1.5"/>
      <text x="170" y="181" textAnchor="middle" fontSize="8" fill={TEXT}>Do you</text>
      <text x="170" y="191" textAnchor="middle" fontSize="8" fill={TEXT}>understand?</text>
      <line x1="220" y1="184" x2="263" y2="184" stroke={TEXT_MUTED} strokeWidth="1.5" markerEnd="url(#arr)"/>
      <text x="240" y="180" textAnchor="middle" fontSize="7.5" fill="#34d399" fontWeight="700">YES</text>
      <ellipse cx="294" cy="184" rx="28" ry="14" fill={BLUE}/>
      <text x="294" y="188" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={WHITE}>DONE ✓</text>
      <line x1="170" y1="206" x2="170" y2="223" stroke={TEXT_MUTED} strokeWidth="1.5" markerEnd="url(#arr)"/>
      <text x="157" y="219" fontSize="7.5" fill="#f87171" fontWeight="700">NO</text>
      <rect x="115" y="223" width="110" height="26" rx="6" fill="rgba(251,146,60,0.1)" stroke="#f97316" strokeWidth="1.5"/>
      <text x="170" y="240" textAnchor="middle" fontSize="8.5" fill="#fb923c">Try another method</text>
      <path d="M115,236 Q62,236 62,130 Q62,118 115,128" fill="none" stroke={TEXT_MUTED} strokeWidth="1.5" markerEnd="url(#arr)" strokeDasharray="4 2"/>
    </svg>
  );
}

function AudioPlayer({ audioText, voiceRate = 0.91, voicePitch = 1 }) {
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const startRef = useRef(null);
  const duration = (audioText.split(" ").length / 2.5) * (1 / voiceRate) * 1000;

  const stop = () => { window.speechSynthesis.cancel(); clearInterval(intervalRef.current); setPlaying(false); };

  const play = () => {
    if (playing) { stop(); return; }
    setDone(false); setProgress(0);
    const utt = new SpeechSynthesisUtterance(audioText);
    utt.rate = voiceRate; utt.pitch = voicePitch;
    utt.onend = () => { clearInterval(intervalRef.current); setPlaying(false); setDone(true); setProgress(100); };
    window.speechSynthesis.speak(utt);
    setPlaying(true);
    startRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setProgress(Math.min(((Date.now()-startRef.current)/duration)*100, 98));
    }, 150);
  };

  useEffect(() => () => stop(), []);

  return (
    <div style={{
      background: BG_ELEVATED, border:`1.5px solid ${BORDER_MID}`,
      borderRadius:14, padding:"18px 20px"
    }}>
      <div style={{display:"flex", alignItems:"center", gap:16}}>
        <button onClick={play} style={{
          width:48, height:48, borderRadius:"50%", border:"none", cursor:"pointer",
          background: playing ? BLUE_DARK : BLUE,
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
          boxShadow: playing ? `0 0 0 4px rgba(59,130,246,0.25)` : "0 2px 12px rgba(59,130,246,0.3)",
          transition:"all 0.2s"
        }}>
          {playing
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill={WHITE}><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill={WHITE}><polygon points="5,3 19,12 5,21"/></svg>
          }
        </button>
        <div style={{flex:1}}>
          <div style={{display:"flex", justifyContent:"space-between", marginBottom:8}}>
            <span style={{fontSize:12, color: done ? "#34d399" : BLUE, fontWeight:600}}>
              {done ? "✓ Clip played — ready to answer" : playing ? "Playing audio…" : "Audio clip ready"}
            </span>
            {!done && <span style={{fontSize:12, color:TEXT_MUTED}}>{playing ? "Tap to pause" : "Tap to play"}</span>}
          </div>
          <div style={{background: BORDER, borderRadius:4, height:6, overflow:"hidden"}}>
            <div style={{
              width:`${progress}%`, height:"100%", borderRadius:4,
              background: done ? "#34d399" : BLUE,
              transition:"width 0.15s linear"
            }}/>
          </div>
          <div style={{display:"flex", alignItems:"flex-end", gap:2, marginTop:8, height:20}}>
            {Array.from({length:40}).map((_,i) => {
              const h = 4 + Math.abs(Math.sin(i * 0.8 + i % 3) * 10) + Math.abs(Math.cos(i * 0.5) * 5);
              const active = progress > (i / 39) * 100;
              return (
                <div key={i} style={{
                  width:4, borderRadius:2, height:h,
                  background: active ? BLUE : BORDER_MID,
                  transition:"background 0.1s"
                }}/>
              );
            })}
          </div>
        </div>
      </div>
      {!done && !playing && (
        <p style={{fontSize:11.5, color:TEXT_MUTED, margin:"10px 0 0", paddingLeft:64}}>
          Please listen before selecting your answer
        </p>
      )}
    </div>
  );
}

function PassageDisplay({ content }) {
  return (
    <div style={{
      background: BG_ELEVATED, border:`1px solid ${BORDER_MID}`,
      borderLeft:`4px solid ${BLUE}`, borderRadius:"0 12px 12px 0",
      padding:"20px 22px"
    }}>
      <p style={{fontFamily:"'Georgia','Cambria',serif", fontSize:13.5, lineHeight:1.85, color:"#cbd5e1", margin:0}}>
        {content}
      </p>
    </div>
  );
}

function DiagramDisplay({ diagramType }) {
  const label = { cell:"Animal Cell — Organelle Structure", chart:"Survey: Preferred Learning Style by Year (%)", flowchart:"Study Decision Flowchart" }[diagramType];
  return (
    <div style={{background: BG_ELEVATED, border:`1px solid ${BORDER_MID}`, borderRadius:14, padding:"20px 16px"}}>
      <div style={{fontSize:10.5, color:TEXT_MUTED, marginBottom:14, textTransform:"uppercase", letterSpacing:1, fontWeight:700, textAlign:"center"}}>{label}</div>
      {diagramType === "cell" && <CellDiagram/>}
      {diagramType === "chart" && <BarChart/>}
      {diagramType === "flowchart" && <Flowchart/>}
    </div>
  );
}

function OptionButton({ opt, index, selected, onSelect }) {
  const letters = ["A","B","C","D"];
  const isSelected = selected === index;
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={() => onSelect(index)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:"flex", alignItems:"flex-start", gap:14, width:"100%",
        padding:"14px 16px", borderRadius:12, cursor:"pointer", textAlign:"left",
        background: isSelected ? BLUE_LIGHT : hovered ? BG_ELEVATED : BG_CARD,
        border:`1.5px solid ${isSelected ? BLUE : hovered ? BORDER_MID : BORDER}`,
        boxShadow: isSelected ? `0 0 0 3px rgba(59,130,246,0.2)` : "none",
        transition:"all 0.15s"
      }}
    >
      <div style={{
        width:30, height:30, borderRadius:8, flexShrink:0,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:12, fontWeight:700,
        background: isSelected ? BLUE : BG_SURFACE,
        color: isSelected ? WHITE : TEXT_MUTED,
        border:`1.5px solid ${isSelected ? BLUE : BORDER_MID}`,
        transition:"all 0.15s"
      }}>{letters[index]}</div>
      <span style={{fontSize:13.5, color: isSelected ? "#93c5fd" : TEXT, lineHeight:1.55, paddingTop:5, fontWeight: isSelected ? 600 : 400}}>
        {opt.text}
      </span>
    </button>
  );
}

function Results({ answers }) {
  const labels = { V:"Visual", A:"Auditory", R:"Reading / Writing", K:"Kinesthetic" };
  const shades = { V: BLUE, A:"#06b6d4", R:"#818cf8", K:"#34d399" };
  const descriptions = {
    V: "You learn best through images, diagrams, and spatial understanding. Charts, concept maps, and visual metaphors help you encode and recall information most effectively.",
    A: "You learn best through listening and speaking. Discussions, verbal explanations, podcasts, and talking through ideas are your strongest pathways to understanding.",
    R: "You learn best through reading and writing. Taking structured notes, reading well-written material, and expressing ideas in writing suits you best.",
    K: "You learn best through practice, experience, and hands-on engagement. Doing, experimenting, and real-world application cement knowledge for you."
  };
  const tips = {
    V: ["Use colour-coded notes and mind maps", "Watch video explanations and animations", "Turn concepts into diagrams before memorising"],
    A: ["Record lectures and replay them", "Study aloud or join study groups", "Use text-to-speech for long readings"],
    R: ["Write summaries after every session", "Create structured outlines and lists", "Read multiple sources on the same topic"],
    K: ["Solve practice problems first, then read theory", "Apply concepts to real-world situations", "Build, simulate, or act out what you're learning"]
  };

  const scores = { V:0, A:0, R:0, K:0 };
  answers.forEach((a,i) => { if (a !== null) scores[questions[i].options[a].style]++; });
  useEffect(() => {
    try {
      localStorage.setItem("vark_scores", JSON.stringify(scores));
    } catch (e) {}
  }, [scores]);
  const total = Object.values(scores).reduce((a,b)=>a+b,0) || 1;
  const sorted = Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  const dominant = sorted[0][0];
  const isMultimodal = sorted[1][1] >= sorted[0][1] - 1;

  return (
    <div style={{maxWidth:620, margin:"0 auto", padding:"0 20px 80px"}}>
      <div style={{
        background: `linear-gradient(135deg, #1e3a5f 0%, #0f2340 100%)`,
        border:`1px solid rgba(59,130,246,0.3)`,
        borderRadius:20, padding:"36px 32px", marginBottom:24, textAlign:"center",
      }}>
        <div style={{
          display:"inline-block", background:"rgba(59,130,246,0.2)",
          border:"1px solid rgba(59,130,246,0.4)",
          borderRadius:20, padding:"4px 16px", fontSize:11, fontWeight:700,
          color:"#93c5fd", letterSpacing:2, marginBottom:16, textTransform:"uppercase"
        }}>Your Results</div>
        <h2 style={{fontSize:30, fontWeight:900, color:WHITE, margin:"0 0 10px", letterSpacing:-0.5}}>
          {isMultimodal ? "Multimodal Learner" : `${labels[dominant]} Learner`}
        </h2>
        <p style={{color:"#94a3b8", fontSize:14, lineHeight:1.65, maxWidth:420, margin:"0 auto"}}>
          {isMultimodal
            ? `Your scores spread across multiple styles. Your primary lean is ${labels[dominant]}, but you adapt well to different formats.`
            : descriptions[dominant]}
        </p>
      </div>

      <div style={{background:BG_CARD, border:`1px solid ${BORDER}`, borderRadius:16, padding:"24px", marginBottom:20}}>
        <h3 style={{fontSize:12, fontWeight:700, color:TEXT_MUTED, letterSpacing:1, textTransform:"uppercase", margin:"0 0 20px"}}>Score Breakdown</h3>
        <div style={{display:"flex", flexDirection:"column", gap:16}}>
          {sorted.map(([style, count]) => (
            <div key={style}>
              <div style={{display:"flex", justifyContent:"space-between", marginBottom:7}}>
                <span style={{fontSize:13.5, fontWeight:700, color:shades[style]}}>{labels[style]}</span>
                <span style={{fontSize:12, color:TEXT_MUTED}}>{count} / {total} answers</span>
              </div>
              <div style={{background:BORDER, borderRadius:6, height:10, overflow:"hidden"}}>
                <div style={{
                  width:`${(count/total)*100}%`, height:"100%", borderRadius:6,
                  background:shades[style], transition:"width 1s cubic-bezier(.4,0,.2,1)",
                  opacity:0.85
                }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{background:BLUE_LIGHT, border:`1px solid rgba(59,130,246,0.25)`, borderRadius:16, padding:"24px", marginBottom:20}}>
        <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:14}}>
          <div style={{width:10, height:10, borderRadius:"50%", background:BLUE}}/>
          <span style={{fontSize:12, fontWeight:800, color:"#93c5fd", letterSpacing:1.5, textTransform:"uppercase"}}>
            Primary Style — {labels[dominant]}
          </span>
        </div>
        <p style={{fontSize:13.5, color:"#cbd5e1", lineHeight:1.7, margin:"0 0 18px"}}>{descriptions[dominant]}</p>
        <div style={{borderTop:`1px solid rgba(59,130,246,0.2)`, paddingTop:16}}>
          <p style={{fontSize:11.5, fontWeight:700, color:"#93c5fd", margin:"0 0 10px", textTransform:"uppercase", letterSpacing:0.8}}>Study Tips</p>
          <div style={{display:"flex", flexDirection:"column", gap:9}}>
            {tips[dominant].map((tip,i) => (
              <div key={i} style={{display:"flex", gap:10, alignItems:"flex-start"}}>
                <div style={{width:6, height:6, borderRadius:"50%", background:BLUE, marginTop:6, flexShrink:0}}/>
                <span style={{fontSize:13, color:"#cbd5e1", lineHeight:1.55}}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{display:"flex", flexDirection:"column", gap:12}}>
        <button onClick={() => window.location.href = "/results"} style={{
          width:"100%", padding:"15px", borderRadius:12,
          background:`linear-gradient(135deg, ${BLUE}, ${BLUE_DARK})`,
          color:WHITE, fontSize:14, fontWeight:700,
          border:"none", cursor:"pointer",
          boxShadow:"0 4px 20px rgba(59,130,246,0.25)"
        }}>
          View Your Results →
        </button>
        <button onClick={() => window.location.reload()} style={{
          width:"100%", padding:"15px", borderRadius:12,
          background:"transparent", color:"#93c5fd", fontSize:14, fontWeight:600,
          border:`1.5px solid rgba(59,130,246,0.3)`, cursor:"pointer"
        }}>
          Retake Assessment
        </button>
      </div>
    </div>
  );
}

export default function VARKAssessment() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);
  const [fading, setFading] = useState(false);

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;

  const tagIcon = { "Reading Passage":"📄", "Audio Clip":"🎧", "Visual Diagram":"🖼", "Visual Chart":"📊", "Scenario":"💡" };
  const tagBg   = { "Reading Passage": BLUE_LIGHT, "Audio Clip":"rgba(251,146,60,0.1)", "Visual Diagram":"rgba(167,139,250,0.1)", "Visual Chart":"rgba(6,182,212,0.1)", "Scenario":"rgba(52,211,153,0.1)" };
  const tagClr  = { "Reading Passage": BLUE, "Audio Clip":"#fb923c", "Visual Diagram":"#a78bfa", "Visual Chart":"#22d3ee", "Scenario":"#34d399" };

  const navigate = (dir) => {
    setFading(true);
    setTimeout(() => {
      if (dir === "next") {
        const na = [...answers]; na[current] = selected; setAnswers(na);
        if (current === questions.length - 1) { setFinished(true); return; }
        setCurrent(c => c+1); setSelected(answers[current+1]);
      } else {
        setCurrent(c => c-1); setSelected(answers[current-1]);
      }
      setFading(false);
    }, 180);
  };

  if (finished) return (
    <div style={{minHeight:"100vh", background:BG, paddingTop:48, fontFamily:"'Plus Jakarta Sans','Segoe UI',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      <div style={{textAlign:"center", marginBottom:32}}>
        <div style={{display:"inline-flex", alignItems:"center", gap:8, marginBottom:6}}>
          <div style={{width:8, height:8, borderRadius:"50%", background:BLUE}}/>
          <h1 style={{fontSize:14, fontWeight:800, color:"#93c5fd", margin:0, letterSpacing:2, textTransform:"uppercase"}}>VARK Assessment</h1>
        </div>
        <p style={{fontSize:13, color:TEXT_MUTED, margin:0}}>Assessment complete</p>
      </div>
      <Results answers={answers} />
    </div>
  );

  return (
    <div style={{minHeight:"100vh", background:BG, fontFamily:"'Plus Jakarta Sans','Segoe UI',sans-serif", color:TEXT}}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>

      {/* Sticky Navbar */}
      <div style={{
        background:"#0a1628",
        borderBottom:`1px solid rgba(59,130,246,0.15)`,
        padding:"0 24px", position:"sticky", top:0, zIndex:50,
        boxShadow:"0 1px 20px rgba(0,0,0,0.4)"
      }}>
        <div style={{maxWidth:640, margin:"0 auto", padding:"16px 0"}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
            <div>
              <h1 style={{fontSize:15, fontWeight:800, color:"#93c5fd", margin:0, letterSpacing:-0.3}}>VARK Assessment</h1>
              <p style={{fontSize:11, color:TEXT_MUTED, margin:"2px 0 0"}}>Discover your learning style</p>
            </div>
            <div style={{
              background:"rgba(59,130,246,0.15)", border:`1px solid rgba(59,130,246,0.3)`,
              borderRadius:8, padding:"5px 12px", fontSize:12, fontWeight:700, color:"#93c5fd"
            }}>
              {current + 1} / {questions.length}
            </div>
          </div>
          <div style={{background:BORDER, borderRadius:6, height:4, overflow:"hidden"}}>
            <div style={{
              width:`${progress}%`, height:"100%", borderRadius:6,
              background:`linear-gradient(90deg, ${BLUE}, #06b6d4)`,
              transition:"width 0.4s cubic-bezier(.4,0,.2,1)"
            }}/>
          </div>
        </div>
      </div>

      {/* Question content */}
      <div style={{
        maxWidth:640, margin:"0 auto", padding:"28px 20px 120px",
        opacity: fading ? 0 : 1,
        transform: fading ? "translateY(8px)" : "translateY(0)",
        transition:"opacity 0.18s, transform 0.18s"
      }}>
        <div style={{
          display:"inline-flex", alignItems:"center", gap:7, marginBottom:20,
          padding:"6px 14px", borderRadius:20,
          background:tagBg[q.tag], border:`1px solid ${tagClr[q.tag]}44`,
          color:tagClr[q.tag], fontSize:12, fontWeight:700
        }}>
          <span>{tagIcon[q.tag]}</span>
          <span style={{textTransform:"uppercase", letterSpacing:1}}>{q.tag}</span>
        </div>

        {q.stimulus && (
          <div style={{marginBottom:22}}>
            <p style={{fontSize:12, color:TEXT_MUTED, marginBottom:10, fontWeight:500}}>{q.stimulus.label}</p>
            {q.stimulus.type === "passage" && <PassageDisplay content={q.stimulus.content}/>}
            {q.stimulus.type === "audio"   && <AudioPlayer audioText={q.stimulus.audioText} voiceRate={q.stimulus.voiceRate} voicePitch={q.stimulus.voicePitch}/>}
            {q.stimulus.type === "diagram" && <DiagramDisplay diagramType={q.stimulus.diagramType}/>}
          </div>
        )}

        {q.stimulus && (
          <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:20}}>
            <div style={{flex:1, height:1, background:BORDER}}/>
            <span style={{fontSize:10.5, color:TEXT_MUTED, fontWeight:700, letterSpacing:1, textTransform:"uppercase"}}>Your Response</span>
            <div style={{flex:1, height:1, background:BORDER}}/>
          </div>
        )}

        <h2 style={{fontSize:18, fontWeight:800, color:TEXT, lineHeight:1.45, marginBottom:20, letterSpacing:-0.3}}>
          {q.question}
        </h2>

        <div style={{display:"flex", flexDirection:"column", gap:10}}>
          {q.options.map((opt,i) => (
            <OptionButton key={i} opt={opt} index={i} selected={selected} onSelect={setSelected}/>
          ))}
        </div>
      </div>

      {/* Bottom nav bar */}
      <div style={{
        position:"fixed", bottom:0, left:0, right:0,
        background:"rgba(10,22,40,0.97)", backdropFilter:"blur(12px)",
        borderTop:`1px solid rgba(59,130,246,0.15)`, padding:"14px 20px"
      }}>
        <div style={{maxWidth:640, margin:"0 auto", display:"flex", gap:12}}>
          <button onClick={() => navigate("back")} disabled={current === 0} style={{
            flex:1, padding:"13px", borderRadius:12,
            background: "transparent",
            border:`1.5px solid ${current===0 ? BORDER : BORDER_MID}`,
            color: current===0 ? "#475569" : "#94a3b8",
            fontSize:14, fontWeight:600, cursor:current===0?"not-allowed":"pointer",
            transition:"all 0.15s"
          }}>← Back</button>
          <button onClick={() => navigate("next")} disabled={selected === null} style={{
            flex:2, padding:"13px", borderRadius:12, border:"none",
            background: selected !== null ? `linear-gradient(135deg, ${BLUE}, ${BLUE_DARK})` : BG_ELEVATED,
            color: selected !== null ? WHITE : "#475569",
            fontSize:14, fontWeight:700, cursor:selected===null?"not-allowed":"pointer",
            boxShadow: selected !== null ? "0 4px 20px rgba(59,130,246,0.3)" : "none",
            transition:"all 0.2s"
          }}>
            {current === questions.length-1 ? "See My Results →" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}