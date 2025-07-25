import { ENVIRONMENT } from './environment';

// Free AI service configuration using Hugging Face Inference API
export const AI_CONFIG = {
  model: 'microsoft/DialoGPT-medium', // Free model that's good for chat
  maxLength: 150,
  temperature: 0.7,
  systemPrompt: `You are a helpful AI assistant integrated into a messaging app. 
  Keep responses concise, friendly, and contextual. 
  Use emojis occasionally to make conversations more engaging.
  Respond as if you're having a natural conversation with a friend.`,
};

// Generate AI response using free Hugging Face API
export async function generateAIResponse(
  conversationHistory: string[],
  userMessage: string,
  context?: string
): Promise<string> {
  try {
    // For free tier, we'll use a simple approach with Hugging Face
    // You can get a free API token from https://huggingface.co/settings/tokens
    const API_URL = `https://api-inference.huggingface.co/models/${AI_CONFIG.model}`;
    
    // Prepare the conversation context
    const conversationContext = conversationHistory
      .slice(-5) // Keep last 5 messages for context
      .map(msg => msg.replace(/^(User:|AI:)/, '').trim())
      .join(' ');
    
    const fullPrompt = `${AI_CONFIG.systemPrompt}\n\nConversation: ${conversationContext}\nUser: ${userMessage}\nAI:`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: For completely free usage, you can remove the Authorization header
        // But getting a free token from Hugging Face gives you higher rate limits
        ...(ENVIRONMENT.HUGGING_FACE_API_KEY && {
          'Authorization': `Bearer ${ENVIRONMENT.HUGGING_FACE_API_KEY}`
        })
      },
      body: JSON.stringify({
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: AI_CONFIG.maxLength,
          temperature: AI_CONFIG.temperature,
          do_sample: true,
          return_full_text: false
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the generated text from the response
    let generatedText = '';
    if (Array.isArray(data) && data.length > 0) {
      generatedText = data[0].generated_text || data[0].response || '';
    } else if (typeof data === 'string') {
      generatedText = data;
    } else if (data && typeof data === 'object') {
      generatedText = data.generated_text || data.response || '';
    }

    // Clean up the response
    generatedText = generatedText
      .replace(/^AI:\s*/i, '') // Remove "AI:" prefix if present
      .replace(/^Conversation:.*?User:.*?AI:\s*/is, '') // Remove the full prompt if it appears
      .trim();

    return generatedText || 'Sorry, I couldn\'t generate a response right now.';
  } catch (error) {
    console.error('Free AI API error:', error);
    
    // Fallback responses when API is unavailable
    const fallbackResponses = [
      "I'm here to help! 😊 What can I assist you with?",
      "That's interesting! Tell me more about that.",
      "I'm having a great conversation with you! What's on your mind?",
      "Thanks for sharing! Is there anything specific you'd like to discuss?",
      "I'm here and ready to chat! What would you like to talk about?"
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
}

// Alternative: Simple rule-based responses for completely offline functionality
export function generateSimpleResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  if (message.includes('hello') || message.includes('hi')) {
    return 'Hello! 👋 How are you doing today?';
  }
  
  if (message.includes('how are you')) {
    return 'I\'m doing great, thanks for asking! 😊 How about you?';
  }
  
  if (message.includes('bye') || message.includes('goodbye')) {
    return 'Goodbye! 👋 It was nice chatting with you!';
  }
  
  if (message.includes('thank')) {
    return 'You\'re welcome! 😊 Is there anything else I can help you with?';
  }
  
  if (message.includes('weather')) {
    return 'I can\'t check the weather, but I hope it\'s nice where you are! ☀️';
  }
  
  if (message.includes('name')) {
    return 'I\'m your AI chat assistant! 🤖 Nice to meet you!';
  }
  
  // Default responses
  const responses = [
    'That\'s interesting! Tell me more about that.',
    'I see what you mean! What are your thoughts on that?',
    'Thanks for sharing that with me! 😊',
    'That sounds fascinating! Can you elaborate?',
    'I\'m here to listen and chat! What else is on your mind?',
    'That\'s a great point! What made you think of that?',
    'I appreciate you sharing that! How do you feel about it?',
    'That\'s really cool! Tell me more! 😄'
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
} 