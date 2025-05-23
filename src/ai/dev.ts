
import { config } from 'dotenv';
config();

// Core AI Features
import '@/ai/flows/ai-symptom-checker.ts';
import '@/ai/flows/virtual-nursing-assistant.ts';
import '@/ai/flows/self-care-plan-generator.ts';
import '@/ai/flows/daily-wellness-tip-generator.ts'; // For Health Tracker
import '@/ai/flows/ai-diet-planner.ts'; // New Diet Planner Flow

// New AI Features from this request
import '@/ai/flows/ai-health-myth-buster.ts';


// Other Existing/Future AI Features
// Placeholder/Future AI Features (flows might still exist if pages are placeholders)
import '@/ai/flows/ai-mood-language-monitor.ts'; // If Mental Health Check-in uses parts of it
import '@/ai/flows/behavioral-health-nudging.ts'; // If any nudging concepts are integrated elsewhere
import '@/ai/flows/conversational-health-coach.ts';


// Ensure all active flows are imported.
// Removed flows (commented out or deleted if files are gone):
// import '@/ai/flows/conversational-health-literacy-coach.ts'; // Merged into VA
// import '@/ai/flows/digital-therapeutics-recommender.ts'; // Merged into VA
// import '@/ai/flows/care-coordination-hub.ts'; // Removed
// import '@/ai/flows/multilingual-cultural-health-companion.ts'; // Merged into Symptom Checker
// import '@/ai/flows/multilingual-health-literacy-guide.ts'; // Merged
// import '@/ai/flows/generate-image-flow.ts'; // Removed
// import '@/ai/flows/symptom-playback-timeline.ts'; // Removed
// import '@/ai/flows/symptom-journal-synthesizer.ts'; // Removed
// import '@/ai/flows/health-question-auto-formulator.ts'; // Removed
// import '@/ai/flows/mental-health-check-in-companion.ts'; // Merged into VA
// import '@/ai/flows/ai-body-scan-visualizer.ts'; // Removed
// import '@/ai/flows/ai-habit-conflict-detector.ts'; // Removed
// import '@/ai/flows/cognitive-health-tracker.ts'; // Removed
// import '@/ai/flows/digital-detox-guidance.ts'; // Removed
    

    