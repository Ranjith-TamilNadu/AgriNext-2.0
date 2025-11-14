
import React, { useState, useCallback } from 'react';
import { generateSmartPlan } from '../services/geminiService';
import type { SmartPlanData } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';

const SmartPlan: React.FC = () => {
    const [crop, setCrop] = useState('');
    const [soil, setSoil] = useState('');
    const [area, setArea] = useState('');
    const [weather, setWeather] = useState('');
    const [plan, setPlan] = useState<SmartPlanData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!crop || !soil || !area || !weather) {
            setError('Please fill out all fields.');
            return;
        }
        setLoading(true);
        setError('');
        setPlan(null);

        try {
            const areaNumber = parseFloat(area);
            const result = await generateSmartPlan(crop, soil, areaNumber, weather);
            setPlan(result);
        } catch (err) {
            setError('Failed to generate a plan. Please check your inputs and try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [crop, soil, area, weather]);

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-surface rounded-xl shadow-md p-6">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="lg:col-span-1">
                        <label htmlFor="crop" className="block text-sm font-medium text-text-secondary">Crop Name</label>
                        <input type="text" id="crop" value={crop} onChange={e => setCrop(e.target.value)} placeholder="e.g., Tomato" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                    </div>
                    <div className="lg:col-span-1">
                        <label htmlFor="soil" className="block text-sm font-medium text-text-secondary">Soil Type</label>
                        <input type="text" id="soil" value={soil} onChange={e => setSoil(e.target.value)} placeholder="e.g., Loamy" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                    </div>
                    <div className="lg:col-span-1">
                        <label htmlFor="area" className="block text-sm font-medium text-text-secondary">Area (Acres)</label>
                        <input type="number" id="area" value={area} onChange={e => setArea(e.target.value)} placeholder="e.g., 5" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                    </div>
                    <div className="lg:col-span-1">
                        <label htmlFor="weather" className="block text-sm font-medium text-text-secondary">Local Weather</label>
                        <input type="text" id="weather" value={weather} onChange={e => setWeather(e.target.value)} placeholder="e.g., Hot, dry" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark disabled:bg-slate-400 flex items-center justify-center lg:col-span-1">
                        {loading && <SpinnerIcon />}
                        {loading ? 'Generating...' : 'Generate Plan'}
                    </button>
                </form>
                 {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            {loading && <div className="text-center p-6">Generating your smart plan, please wait...</div>}

            {plan && (
                <div className="bg-surface rounded-xl shadow-md p-6 space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-primary">Smart Plan for {plan.crop_name}</h2>
                        <p className="mt-2 text-text-secondary">{plan.summary}</p>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-text-primary mb-3">Fertilizer Plan</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Stage</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Fertilizer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Method</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {plan.fertilizer_plan.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{item.stage}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{item.fertilizer_type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{item.application_method}</td>
                                            <td className="px-6 py-4 text-sm text-text-secondary">{item.notes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                     <div>
                        <h3 className="text-xl font-bold text-text-primary mb-3">Irrigation Plan</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Stage</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Frequency</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Duration (min)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Volume (L/plant)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {plan.irrigation_plan.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{item.stage}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{item.frequency}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{item.duration_minutes}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{item.water_volume_liters_per_plant}</td>
                                            <td className="px-6 py-4 text-sm text-text-secondary">{item.notes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default SmartPlan;
