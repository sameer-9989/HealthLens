
/**
 * @fileOverview Central storage system for image metadata used within the HealthLens application.
 * This library helps organize, reuse, and trace visual content.
 * For actual image generation, the 'aiGenerationPrompt' can be used with an image generation service.
 */

export interface AppImageMetadata {
  id: string; // Unique identifier, e.g., "yoga-sunrise-stretch"
  title: string; // Descriptive title, e.g., "Sunrise Yoga Stretch for Energy"
  purposeCategory: string; // Main category/feature, e.g., "Stress Relief Yoga", "Self-Care Plans", "Digital Detox"
  tags: string[]; // Keywords for searching, e.g., ["yoga", "morning", "energy", "anxiety relief", "stretching"]
  aiGenerationPrompt: string; // The prompt that would be/was used to generate the image.
  imageUrl: string; // URL of the image (currently placeholders)
  dataAiHint?: string; // Corresponds to data-ai-hint used in HTML for Unsplash-style hints
  createdAt: string; // ISO date string, e.g., "2024-05-15T10:00:00Z"
  notes?: string; // Any additional notes about the image usage or context
}

export const imageLibrary: AppImageMetadata[] = [
  // --- Stress Relief Yoga Examples ---
  {
    id: "yoga-desk-neck-shoulders",
    title: "Desk Yoga for Neck & Shoulders",
    purposeCategory: "Stress Relief Yoga",
    tags: ["yoga", "desk", "office", "neck pain", "shoulder tension", "quick stretch"],
    aiGenerationPrompt: "A clear, minimalist illustration of simple neck and shoulder stretches suitable for an office environment. Focus on clarity of poses.",
    imageUrl: "https://placehold.co/400x250.png",
    dataAiHint: "office stretching",
    createdAt: "2024-05-16T10:00:00Z",
    notes: "Used on Stress Relief Yoga page for 'Desk Yoga' category."
  },
  {
    id: "yoga-back-pain-gentle",
    title: "Gentle Yoga for Lower Back Pain",
    purposeCategory: "Stress Relief Yoga",
    tags: ["yoga", "back pain", "gentle", "stretching", "beginner"],
    aiGenerationPrompt: "Photo of a person in a calm setting performing a gentle yoga pose for lower back pain relief, e.g., cat-cow or child's pose. Emphasize safety and comfort.",
    imageUrl: "https://placehold.co/400x250.png",
    dataAiHint: "yoga back-pain",
    createdAt: "2024-05-16T10:05:00Z",
    notes: "Used on Stress Relief Yoga page for 'Back Relief' category."
  },
  {
    id: "yoga-morning-energy",
    title: "Morning Yoga for Energy",
    purposeCategory: "Stress Relief Yoga",
    tags: ["yoga", "morning", "energy", "vitality", "stretching"],
    aiGenerationPrompt: "Vibrant and uplifting image of a person doing an energizing morning yoga pose, like Sun Salutation, with soft morning light.",
    imageUrl: "https://placehold.co/400x250.png",
    dataAiHint: "morning yoga",
    createdAt: "2024-05-16T10:10:00Z",
    notes: "Used on Stress Relief Yoga page for 'Morning Routine' category."
  },

  // --- Self-Care Plan Examples ---
  {
    id: "selfcare-mindfulness-beginner",
    title: "Beginner Mindfulness Meditation Scene",
    purposeCategory: "Self-Care Plans",
    tags: ["mindfulness", "meditation", "calm", "stress relief", "beginner"],
    aiGenerationPrompt: "A serene and calming image depicting a person in a comfortable meditation pose in a peaceful natural setting (e.g., by a lake, in a forest). Soft, diffused light.",
    imageUrl: "https://placehold.co/400x250.png",
    dataAiHint: "meditation nature",
    createdAt: "2024-05-16T10:15:00Z",
    notes: "For 'Beginner Mindfulness Meditation' static self-care plan."
  },
  {
    id: "selfcare-digital-detox-evening",
    title: "Evening Digital Detox Illustration",
    purposeCategory: "Self-Care Plans",
    tags: ["digital detox", "evening routine", "sleep", "calm", "no phone"],
    aiGenerationPrompt: "A cozy bedroom scene at dusk, with a book on the nightstand and no visible electronic devices. Focus on tranquility and offline activities.",
    imageUrl: "https://placehold.co/400x250.png",
    dataAiHint: "calm bedroom no-phone",
    createdAt: "2024-05-16T10:20:00Z",
    notes: "For 'Evening Digital Detox' static self-care plan."
  },

  // --- Digital Detox Tool Examples ---
  {
    id: "digital-detox-wellbeing-balance",
    title: "Digital Wellbeing and Balance",
    purposeCategory: "Digital Detox",
    tags: ["digital wellbeing", "balance", "nature", "mindfulness", "screen time"],
    aiGenerationPrompt: "A conceptual image representing balance between technology and nature/real life. Perhaps a split image or a person mindfully using a device outdoors.",
    imageUrl: "https://placehold.co/600x300.png",
    dataAiHint: "digital wellbeing nature",
    createdAt: "2024-05-16T10:25:00Z",
    notes: "Main image for the Digital Detox page."
  },
  
  // --- Symptom Checker (Conceptual examples, as it's mostly text-based) ---
   {
    id: "symptom-general-health-illustration",
    title: "General Health & Wellness Illustration",
    purposeCategory: "Symptom Checker",
    tags: ["health", "wellness", "medical", "abstract"],
    aiGenerationPrompt: "A clean, abstract medical or health-themed illustration. Soft colors, perhaps with subtle health icons like a heartbeat line or a stylized human figure.",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "health wellness",
    createdAt: "2024-05-16T10:30:00Z",
    notes: "General illustrative image for symptom checker or health articles."
  },
  {
    id: "symptom-magnifying-glass-detail",
    title: "Symptom Analysis Icon",
    purposeCategory: "Symptom Checker",
    tags: ["symptom", "analysis", "magnifying glass", "detail"],
    aiGenerationPrompt: "A simple, clear icon of a magnifying glass over a generic body part or abstract symptom representation, symbolizing analysis.",
    imageUrl: "https://placehold.co/100x100.png",
    dataAiHint: "symptom analysis",
    createdAt: "2024-05-16T10:35:00Z",
    notes: "Iconographic representation for symptom analysis sections."
  },
];

/**
 * Finds images by a specific tag.
 * @param tag The tag to search for.
 * @returns An array of AppImageMetadata objects that include the tag.
 */
export function findImagesByTag(tag: string): AppImageMetadata[] {
  return imageLibrary.filter(img => img.tags.includes(tag.toLowerCase()));
}

/**
 * Finds images by their purpose or category.
 * @param category The category to search for.
 * @returns An array of AppImageMetadata objects that match the category.
 */
export function findImagesByCategory(category: string): AppImageMetadata[] {
  return imageLibrary.filter(img => img.purposeCategory.toLowerCase() === category.toLowerCase());
}

/**
 * Gets an image by its unique ID.
 * @param id The unique ID of the image.
 * @returns The AppImageMetadata object if found, otherwise undefined.
 */
export function getImageById(id: string): AppImageMetadata | undefined {
  return imageLibrary.find(img => img.id === id);
}
