'use client'
import React from 'react'
import { useState } from 'react';
import OpenAI from 'openai';
 // Import the correct type from openai
  import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // Store your API key in env variable
  dangerouslyAllowBrowser: true, // Allow usage in the browser (not recommended for production)
});
/**
 * Note: OpenAI API keys should not be exposed on the client side.
 * This example is for demonstration only. In production, use API routes.
 */
function Upgrade() {
  // Example: Send system and user message to OpenAI using openai npm package
  // Install openai: npm install openai

 

  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([
    { role: 'system', content: 'Depends on user Job Title and Job Description generate 2 interview questions. Make sure the response will be in the question and answer field in the object InterviewQuestions.' },
    { role: 'user', content: 'Job Title: Full Stack React Developer\nJob Description: 10 Years of experience.' }
  ]);
  const [response, setResponse] = useState('');

  async function sendMessage() {
    const chatSession = [...messages];
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini', // Use the appropriate model name
      messages: [
    { role: 'system', content: 'Depends on user Job Title and Job Description generate 2 interview questions. Make sure the response will be in the question and answer field in the object InterviewQuestions.' },
    { role: 'user', content: 'Job Title: Full Stack React Developer\nJob Description: 10 Years of experience.' }
  ],
    });
    console.log('OpenAI response', completion.choices[0].message?.content);
    setResponse(completion.choices[0].message?.content || '');
  }

  return (
    <div>
      <button onClick={sendMessage}>Send Message</button>
      <div>Response: {response}</div>
    </div>
  )
}

export default Upgrade