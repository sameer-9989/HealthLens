
import { config } from 'dotenv';
config();

// Keep existing imports if they are still relevant or for other features
import '@/ai/flows/virtual-nursing-assistant.ts';
// import '@/ai/flows/cognitive-health-tracker.ts'; // This will be the updated one
// import '@/ai/flows/ai-symptom-checker.ts'; // Keep if used elsewhere
// import '@/ai/flows/ai-mood-language-monitor.ts'; // Keep if used elsewhere
// import '@/ai/flows/conversational-health-literacy-coach.ts'; // Keep if used elsewhere
// import '@/ai/flows/behavioral-health-nudging.ts'; // Keep if used elsewhere
// import '@/ai/flows/symptom-journal-synthesizer.ts'; // Keep if used elsewhere
// import '@/ai/flows/care-coordination-hub.ts'; // Keep if used elsewhere
// import '@/ai/flows/multilingual-cultural-health-companion.ts'; // Keep if used elsewhere
// import '@/ai/flows/mental-health-check-in-companion.ts'; // Keep if used elsewhere
// import '@/ai/flows/conversational-health-coach.ts'; // This will be the updated one
// import '@/ai/flows/symptom-playback-timeline.ts'; // Keep if used elsewhere
// import '@/ai/flows/health-question-auto-formulator.ts'; // Keep if used elsewhere
// import '@/ai/flows/multilingual-health-literacy-guide.ts'; // Keep if used elsewhere
// import '@/ai/flows/secure-emergency-info-builder.ts'; // Keep if used elsewhere

// Ensure the updated and newly focused flows are imported
import '@/ai/flows/conversational-health-coach.ts';
import '@/ai/flows/cognitive-health-tracker.ts';

// Import newly added flows
import '@/ai/flows/digital-therapeutics-recommender.ts';
import '@/ai/flows/self-care-plan-generator.ts';


// Import other flows that are still part of the application
import '@/ai/flows/ai-symptom-checker.ts';
import '@/ai/flows/ai-mood-language-monitor.ts';
import '@/ai/flows/conversational-health-literacy-coach.ts';
import '@/ai/flows/behavioral-health-nudging.ts';
import '@/ai/flows/symptom-journal-synthesizer.ts';
import '@/ai/flows/care-coordination-hub.ts';
import '@/ai/flows/multilingual-cultural-health-companion.ts';
import '@/ai/flows/mental-health-check-in-companion.ts';
import '@/ai/flows/symptom-playback-timeline.ts'; // This one is being enhanced on the UI side
import '@/ai/flows/health-question-auto-formulator.ts';
import '@/ai/flows/multilingual-health-literacy-guide.ts';
import '@/ai/flows/secure-emergency-info-builder.ts';
