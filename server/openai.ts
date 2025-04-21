import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { log } from "./vite";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Transcribes audio files using OpenAI's Whisper API
 */
export async function transcribeAudio(filePath: string): Promise<{ text: string, duration: number }> {
  try {
    const audioReadStream = fs.createReadStream(filePath);
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: "whisper-1",
    });
    
    return {
      text: transcription.text,
      duration: transcription.duration || 0,
    };
  } catch (error) {
    log(`Error transcribing audio: ${(error as Error).message}`, 'openai');
    throw new Error(`Failed to transcribe audio: ${(error as Error).message}`);
  }
}

/**
 * Analyzes a dream text and provides interpretation using OpenAI's GPT-4o
 */
export async function interpretDream(dreamText: string): Promise<{
  interpretation: string,
  insights: {
    symbols: string[],
    emotions: string[],
    themes: string[]
  }
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are a dream analyst with expertise in Jungian psychology, symbolism, and subconscious interpretation. " +
            "Analyze the provided dream description thoughtfully and provide both a narrative interpretation " +
            "and structured insights. Be introspective, insightful, and avoid clichés. " +
            "Your response should be in JSON format with two main fields: " +
            "1. 'interpretation': A 3-4 paragraph analysis that explores potential meanings " +
            "2. 'insights': An object with three arrays: 'symbols', 'emotions', and 'themes'"
        },
        {
          role: "user",
          content: dreamText
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      interpretation: result.interpretation,
      insights: {
        symbols: result.insights.symbols || [],
        emotions: result.insights.emotions || [],
        themes: result.insights.themes || []
      }
    };
  } catch (error) {
    log(`Error interpreting dream: ${(error as Error).message}`, 'openai');
    throw new Error(`Failed to interpret dream: ${(error as Error).message}`);
  }
}

/**
 * Generates an image based on a dream description using DALL-E 3
 */
export async function generateDreamImage(dreamText: string, style: string = "realistic"): Promise<string> {
  try {
    // Create style-specific prompt
    let stylePrompt;
    switch (style) {
      case "sketch":
        stylePrompt = "Create a detailed pencil sketch drawing depicting this dream scene. Use clean lines, subtle shading, and a hand-drawn quality with clear focus on the main elements:";
        break;
      case "watercolor":
        stylePrompt = "Create a soft, ethereal watercolor painting depicting this dream scene with gentle color blending, flowing transitions, and slightly blurred edges:";
        break;
      case "surreal":
        stylePrompt = "Create a surrealist, Dalí-inspired dreamscape depicting this scene with impossible physics, distorted perspectives, and symbolic juxtapositions:";
        break;
      case "psychedelic":
        stylePrompt = "Create a vibrant, psychedelic visualization of this dream with fractals, intense saturated colors, swirling patterns, and visual distortions reminiscent of altered states of consciousness:";
        break;
      case "cosmic":
        stylePrompt = "Create a cosmic, space-inspired visualization of this dream with celestial elements, stars, nebulae, and cosmic energy fields, creating a sense of infinite possibility and transcendence:";
        break;
      default:
        stylePrompt = "Create a detailed, realistic visualization of this dream scene with natural lighting, accurate proportions, and photorealistic details:";
    }
    
    const fullPrompt = `${stylePrompt} ${dreamText}\n\nEnsure the image captures the emotional essence and symbolism of the dream. Focus on creating a compelling visual narrative that evokes the mood described. Do not include any text in the image.`;
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: fullPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return response.data[0].url;
  } catch (error) {
    log(`Error generating dream image: ${(error as Error).message}`, 'openai');
    throw new Error(`Failed to generate dream image: ${(error as Error).message}`);
  }
}
