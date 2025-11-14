import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { SmartPlanData, WeatherAlert, WeatherForecast } from '../types';
import MarkdownIt from 'markdown-it';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const md = new MarkdownIt();

const pestDetectionModel = 'gemini-2.5-flash';
const advisoryModel = 'gemini-2.5-flash';
const planningModel = 'gemini-2.5-flash';
const ttsModel = 'gemini-2.5-flash-preview-tts';

export const detectPestOrDisease = async (base64Image: string, mimeType: string): Promise<string> => {
    const imagePart = {
        inlineData: {
            data: base64Image,
            mimeType: mimeType,
        },
    };
    const textPart = {
        text: `
          Analyze this image of a plant. Identify any potential pests or diseases. 
          Provide the following information in Markdown format:
          - **Identification**: Name of the disease or pest.
          - **Confidence**: Your confidence level (High, Medium, Low).
          - **Description**: A brief description of the issue.
          - **Symptoms**: Key symptoms visible or associated with the issue.
          - **Organic Treatment**: Recommended organic control methods.
          - **Chemical Treatment**: Recommended chemical control methods.
          - **Prevention**: Tips to prevent future occurrences.
          If the plant appears healthy, state that clearly.
        `,
    };
    
    const response = await ai.models.generateContent({
      model: pestDetectionModel,
      contents: { parts: [imagePart, textPart] },
    });
    
    const text = response.text;
    return md.render(text);
};


export const getCropAdvice = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
      model: advisoryModel,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert agricultural advisor. Provide clear, concise, and actionable advice for farmers. Keep responses brief and to the point.",
      }
    });
    return response.text;
};

const smartPlanSchema = {
    type: Type.OBJECT,
    properties: {
        crop_name: { type: Type.STRING },
        summary: { type: Type.STRING },
        fertilizer_plan: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    stage: { type: Type.STRING },
                    fertilizer_type: { type: Type.STRING },
                    application_method: { type: Type.STRING },
                    notes: { type: Type.STRING },
                },
                required: ["stage", "fertilizer_type", "application_method", "notes"]
            }
        },
        irrigation_plan: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    stage: { type: Type.STRING },
                    frequency: { type: Type.STRING },
                    duration_minutes: { type: Type.NUMBER },
                    water_volume_liters_per_plant: { type: Type.NUMBER },
                    notes: { type: Type.STRING },
                },
                required: ["stage", "frequency", "duration_minutes", "water_volume_liters_per_plant", "notes"]
            }
        }
    },
    required: ["crop_name", "fertilizer_plan", "irrigation_plan", "summary"]
};

export const generateSmartPlan = async (crop: string, soil: string, area: number, weather: string): Promise<SmartPlanData> => {
    const prompt = `
      Create a detailed fertilizer and irrigation plan for the following scenario:
      - Crop: ${crop}
      - Soil Type: ${soil}
      - Area to Cultivate: ${area} acres
      - Local Weather Conditions: ${weather}

      Provide a summary of the plan and then generate the detailed plan in JSON format according to the provided schema.
      The plan should cover key growth stages like seeding, vegetative, flowering, and fruiting.
    `;
    
    const response = await ai.models.generateContent({
        model: planningModel,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: smartPlanSchema,
        }
    });
    
    const jsonString = response.text;
    return JSON.parse(jsonString) as SmartPlanData;
};

const weatherAlertSchema = {
    type: Type.OBJECT,
    properties: {
        location: { type: Type.STRING, description: "The city and region for the weather alert." },
        alert_type: { type: Type.STRING, enum: ['Warning', 'Watch', 'Advisory', 'None'] },
        headline: { type: Type.STRING, description: "A brief, attention-grabbing headline for the alert." },
        description: { type: Type.STRING, description: "A concise description of the weather event and its potential impact on crops." },
    },
    required: ["location", "alert_type", "headline", "description"]
};

export const getWeatherAlerts = async (latitude: number, longitude: number): Promise<WeatherAlert> => {
    const prompt = `
      Based on the location with latitude ${latitude} and longitude ${longitude}, generate a single, critical weather alert relevant to agriculture for the next 24 hours.
      If there are no critical alerts, use the 'None' alert_type and provide a reassuring message.
      The response must be in JSON format matching the provided schema.
    `;
    
    const response = await ai.models.generateContent({
        model: planningModel,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: weatherAlertSchema,
        }
    });
    
    const jsonString = response.text;
    return JSON.parse(jsonString) as WeatherAlert;
};

const weatherForecastSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            day: { type: Type.STRING, description: "Day of the week (e.g., 'Monday')." },
            high_temp: { type: Type.NUMBER, description: "Maximum temperature in Celsius." },
            low_temp: { type: Type.NUMBER, description: "Minimum temperature in Celsius." },
            conditions: { type: Type.STRING, description: "A one or two-word description of the weather conditions (e.g., 'Sunny', 'Partly Cloudy', 'Rain')." },
            precipitation_probability: { type: Type.NUMBER, description: "Probability of precipitation as a percentage (0-100)." },
            wind_speed: { type: Type.NUMBER, description: "Wind speed in kilometers per hour (km/h)." },
        },
        required: ["day", "high_temp", "low_temp", "conditions", "precipitation_probability", "wind_speed"]
    }
};

export const getWeatherForecast = async (latitude: number, longitude: number): Promise<WeatherForecast[]> => {
    const prompt = `
      Provide a 5-day weather forecast for the location at latitude ${latitude} and longitude ${longitude}.
      The forecast should be relevant for agricultural planning.
      The response must be in JSON format matching the provided schema, containing exactly 5 forecast entries.
    `;

    const response = await ai.models.generateContent({
        model: planningModel,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: weatherForecastSchema,
        }
    });

    const jsonString = response.text;
    const forecast = JSON.parse(jsonString) as WeatherForecast[];
    // Ensure the API returns exactly 5 days
    if (Array.isArray(forecast) && forecast.length === 5) {
        return forecast;
    }
    // Fallback or error handling
    if (Array.isArray(forecast)) {
        console.warn(`API returned ${forecast.length} days, expected 5. Truncating/padding...`);
        // Basic fix: slice or pad to 5 elements. A more robust solution might be needed.
        return forecast.slice(0, 5);
    }
    throw new Error("Invalid forecast data received from API");
};


export const textToSpeech = async (text: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: ttsModel,
        contents: [{ parts: [{ text: text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        }
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("No audio data received from API.");
    }
    return base64Audio;
};