
import React from 'react';
import type { View } from '../types';

interface HeaderProps {
    currentView: View;
}

const viewTitles: Record<View, string> = {
    dashboard: 'Dashboard',
    'pest-detection': 'AI Pest & Disease Detection',
    'crop-advisory': 'Voice-Based Crop Advisory',
    'smart-plan': 'Smart Fertilizer & Irrigation Plan'
};

const Header: React.FC<HeaderProps> = ({ currentView }) => {
    return (
        <header className="bg-surface shadow-sm p-4 border-b border-slate-200">
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
                {viewTitles[currentView]}
            </h1>
        </header>
    );
};

export default Header;
