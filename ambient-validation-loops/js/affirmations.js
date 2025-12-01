// Quantum-inspired affirmations organized by category
export const AFFIRMATIONS = {
  manifestation: [
    "I am a powerful manifestor, and my thoughts shape my reality.",
    "The universe is conspiring to bring my desires into form.",
    "I am a magnet for miracles and synchronicities.",
    "My manifestations come to me with ease and perfect timing.",
    "I am in perfect alignment with my highest timeline.",
    "The quantum field responds to my focused intention.",
    "I release resistance and allow abundance to flow to me.",
    "My desires are already on their way to me.",
    "I trust in divine timing and divine order.",
    "I am a conscious creator of my reality."
  ],
  abundance: [
    "Wealth flows to me from multiple sources.",
    "I am a money magnet and prosperity is my natural state.",
    "I am open and receptive to all the wealth life offers me.",
    "Money comes to me in expected and unexpected ways.",
    "I am worthy of wealth, success, and financial freedom.",
    "The universe is infinitely abundant, and so am I.",
    "I attract opportunities that create wealth and prosperity.",
    "My income grows exponentially.",
    "I am a powerful manifestor of financial abundance.",
    "Money is energy, and I am a conduit for positive financial flow."
  ],
  confidence: [
    "I trust in my ability to create my desired reality.",
    "I am worthy of all the good in my life.",
    "I release all self-doubt and embrace my power.",
    "I am confident in my ability to navigate any situation.",
    "I am becoming the best version of myself each day.",
    "I trust myself and my intuition completely.",
    "I am worthy of success, love, and happiness.",
    "I release all fear and step into my power.",
    "I am confident in my unique gifts and abilities.",
    "I am becoming more confident with each passing moment."
  ],
  clarity: [
    "My mind is clear, focused, and at peace.",
    "I trust my intuition to guide me to my highest good.",
    "I release all mental fog and embrace clarity.",
    "The answers I seek are within me.",
    "I am aligned with my highest purpose and truth.",
    "I trust the unfolding of my journey.",
    "I am open to receiving divine guidance.",
    "My mind is a powerful tool for creating my reality.",
    "I release all confusion and embrace understanding.",
    "I see my path with perfect clarity."
  ],
  love: [
    "I am a magnet for loving, fulfilling relationships.",
    "I give and receive love freely and unconditionally.",
    "I am worthy of deep, meaningful connections.",
    "My heart is open to giving and receiving love.",
    "I attract relationships that honor and uplift me.",
    "I am complete and whole within myself.",
    "I release all past hurts and open my heart to love.",
    "I am a beacon of love and light.",
    "I am surrounded by love in all areas of my life.",
    "I am worthy of a love that feels like home."
  ],
  purpose: [
    "I am aligned with my soul's purpose.",
    "My life has deep meaning and significance.",
    "I trust the journey of my soul's evolution.",
    "I am exactly where I need to be right now.",
    "My purpose unfolds perfectly in divine timing.",
    "I am a powerful creator of my reality.",
    "I trust the process of my becoming.",
    "I am living my soul's highest calling.",
    "My purpose is revealed to me step by step.",
    "I am a unique expression of the universe."
  ],
  health: [
    "My body is a temple of vibrant health and vitality.",
    "I am grateful for my body's wisdom and resilience.",
    "Every cell in my body vibrates with energy and health.",
    "I am healing and becoming stronger every day.",
    "My body knows how to heal itself.",
    "I nourish my body with love and healthy choices.",
    "I am in perfect health, mind, body, and spirit.",
    "I release all dis-ease and embrace ease and flow.",
    "My energy is increasing every day.",
    "I am grateful for my body's strength and vitality."
  ],
  success: [
    "I am a success in all areas of my life.",
    "Success flows to me easily and effortlessly.",
    "I am aligned with my highest potential.",
    "I am worthy of success in all its forms.",
    "I attract opportunities for growth and success.",
    "I am becoming the most successful version of myself.",
    "Success is my natural state of being.",
    "I am a powerful creator of my own success.",
    "I celebrate my successes, big and small.",
    "I am open to receiving unlimited success."
  ],
  creativity: [
    "I am a channel for divine creativity.",
    "Creative energy flows through me with ease.",
    "I am constantly inspired by the world around me.",
    "My creativity knows no bounds.",
    "I trust in my creative process.",
    "I am open to new ideas and inspiration.",
    "My creativity is a gift to the world.",
    "I release all blocks to my creative expression.",
    "I am constantly expanding my creative potential.",
    "My creative energy is abundant and ever-flowing."
  ],
  peace: [
    "I am at peace with myself and the world around me.",
    "I release all tension and embrace peace.",
    "I am a beacon of peace and calm.",
    "I choose peace in every moment.",
    "I am grounded, centered, and at peace.",
    "I release all that no longer serves my highest good.",
    "I am in harmony with the rhythm of life.",
    "I trust in the unfolding of my journey.",
    "I am at peace with where I am right now.",
    "My mind is calm, my heart is open, my soul is at peace."
  ]
};

export const CATEGORIES = [
  { id: 'manifestation', name: 'Manifestation', emoji: '✨', description: 'Align with your highest timeline' },
  { id: 'abundance', name: 'Abundance', emoji: '💰', description: 'Attract wealth and prosperity' },
  { id: 'confidence', name: 'Confidence', emoji: '🦁', description: 'Step into your power' },
  { id: 'clarity', name: 'Clarity', emoji: '🔮', description: 'Clear mind, clear path' },
  { id: 'love', name: 'Love', emoji: '💖', description: 'Attract and nurture relationships' },
  { id: 'purpose', name: 'Purpose', emoji: '🎯', description: 'Align with your soul\'s mission' },
  { id: 'health', name: 'Health', emoji: '🌿', description: 'Vitality and wellbeing' },
  { id: 'success', name: 'Success', emoji: '🏆', description: 'Achieve your goals' },
  { id: 'creativity', name: 'Creativity', emoji: '🎨', description: 'Unlock your creative flow' },
  { id: 'peace', name: 'Peace', emoji: '☮️', description: 'Inner calm and balance' }
];

// Get a random affirmation from the specified categories
export function getRandomAffirmation(categories) {
  // If no categories are selected, return a default message
  if (!categories || categories.length === 0) {
    return "Select categories to receive personalized affirmations.";
  }
  
  // Select a random category from the user's selected categories
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  
  // Get the affirmations for the selected category
  const categoryAffirmations = AFFIRMATIONS[randomCategory];
  
  // If the category exists and has affirmations, return a random one
  if (categoryAffirmations && categoryAffirmations.length > 0) {
    return categoryAffirmations[Math.floor(Math.random() * categoryAffirmations.length)];
  }
  
  // Fallback message if something goes wrong
  return "Your reality is shaped by your thoughts. Choose them wisely.";
}

// Get all categories with their metadata
export function getAllCategories() {
  return CATEGORIES;
}

// Get a category by ID
export function getCategoryById(id) {
  return CATEGORIES.find(category => category.id === id);
}

// Get all affirmations for a specific category
export function getAffirmationsByCategory(categoryId) {
  return AFFIRMATIONS[categoryId] || [];
}
