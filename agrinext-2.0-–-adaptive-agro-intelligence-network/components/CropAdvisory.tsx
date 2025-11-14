
import React, { useState, useCallback, useRef } from 'react';
import type { ChatMessage } from '../types';
import { getCropAdvice, textToSpeech } from '../services/geminiService';
import { playAudio } from '../utils/audioUtils';
import { SpeakerIcon } from './icons/SpeakerIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

const CropAdvisory: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        setError('');

        try {
            const advice = await getCropAdvice(input);
            const modelMessage: ChatMessage = { role: 'model', text: advice };
            setMessages(prev => [...prev, modelMessage]);
        } catch (err) {
            setError('Failed to get advice. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [input, loading]);

    const handleSpeak = useCallback(async (text: string, index: number) => {
        if (speakingMessageIndex !== null) return;
        setSpeakingMessageIndex(index);
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const audioData = await textToSpeech(text);
            await playAudio(audioData, audioContextRef.current);
        } catch (err) {
            console.error("Failed to play audio:", err);
            setError("Sorry, could not play the audio response.");
        } finally {
            setSpeakingMessageIndex(null);
        }
    }, [speakingMessageIndex]);

    return (
        <div className="flex flex-col h-full max-w-3xl mx-auto bg-surface rounded-xl shadow-md">
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-lg p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-slate-200 text-text-primary'}`}>
                                <p className="text-sm">{msg.text}</p>
                                {msg.role === 'model' && (
                                    <button
                                        onClick={() => handleSpeak(msg.text, index)}
                                        disabled={speakingMessageIndex !== null}
                                        className="mt-2 text-slate-500 hover:text-primary disabled:text-slate-400"
                                        title="Read aloud"
                                    >
                                        <SpeakerIcon isSpeaking={speakingMessageIndex === index} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                         <div className="flex justify-start">
                            <div className="max-w-lg p-3 rounded-lg bg-slate-200 text-text-primary flex items-center">
                                <SpinnerIcon />
                                <span className="text-sm ml-2">AI is thinking...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {error && <div className="p-4 text-sm text-red-700 bg-red-100">{error}</div>}
            <div className="border-t border-slate-200 p-4">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your crops..."
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="bg-primary text-white font-semibold px-6 py-2 rounded-full hover:bg-primary-dark disabled:bg-slate-400"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CropAdvisory;
