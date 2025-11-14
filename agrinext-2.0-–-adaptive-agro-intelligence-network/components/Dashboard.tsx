import React, { useState, useEffect } from 'react';
import type { View, WeatherAlert, WeatherForecast } from '../types';
import { LeafIcon } from './icons/LeafIcon';
import { ChatIcon } from './icons/ChatIcon';
import { PlanIcon } from './icons/PlanIcon';
import { WarningIcon } from './icons/WarningIcon';
import { WatchIcon } from './icons/WatchIcon';
import { AdvisoryIcon } from './icons/AdvisoryIcon';
import { SunIcon } from './icons/SunIcon';
import { CloudIcon } from './icons/CloudIcon';
import { RainIcon } from './icons/RainIcon';
import { PartlyCloudyIcon } from './icons/PartlyCloudyIcon';
import { WindIcon } from './icons/WindIcon';
import { PrecipitationIcon } from './icons/PrecipitationIcon';
import { getWeatherAlerts, getWeatherForecast } from '../services/geminiService';


interface DashboardProps {
  setCurrentView: (view: View) => void;
}

const FeatureCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
}> = ({ title, description, icon, onClick }) => {
    return (
        <div 
            className="bg-surface rounded-xl shadow-md p-6 flex flex-col items-start hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            onClick={onClick}
        >
            <div className="bg-primary/10 text-primary p-3 rounded-full mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
            <p className="text-text-secondary text-sm flex-grow">{description}</p>
            <span className="mt-4 text-sm font-semibold text-primary hover:text-primary-dark">
                Get Started &rarr;
            </span>
        </div>
    );
};

const WeatherAlertComponent: React.FC<{ alert: WeatherAlert; onDismiss: () => void; }> = ({ alert, onDismiss }) => {
    const alertStyles = {
        Warning: {
            bg: 'bg-red-100',
            border: 'border-red-500',
            text: 'text-red-700',
            iconText: 'text-red-500',
            buttonHover: 'hover:bg-red-200'
        },
        Watch: {
            bg: 'bg-yellow-100',
            border: 'border-yellow-500',
            text: 'text-yellow-700',
            iconText: 'text-yellow-500',
            buttonHover: 'hover:bg-yellow-200'
        },
        Advisory: {
            bg: 'bg-blue-100',
            border: 'border-blue-500',
            text: 'text-blue-700',
            iconText: 'text-blue-500',
            buttonHover: 'hover:bg-blue-200'
        },
        None: {
            bg: 'bg-green-100',
            border: 'border-green-500',
            text: 'text-green-700',
            iconText: 'text-green-500',
            buttonHover: 'hover:bg-green-200'
        }
    };
    
    const styles = alertStyles[alert.alert_type];

    const getAlertIcon = () => {
        const iconProps = { className: `h-6 w-6 ${styles.iconText}`, "aria-hidden": true };
        switch (alert.alert_type) {
            case 'Warning':
                return <WarningIcon {...iconProps} />;
            case 'Watch':
                return <WatchIcon {...iconProps} />;
            case 'Advisory':
                return <AdvisoryIcon {...iconProps} />;
            case 'None':
                return <LeafIcon {...iconProps} />;
            default:
                return <WarningIcon {...iconProps} />;
        }
    };

    return (
        <div className={`border-l-4 p-4 rounded-r-lg ${styles.bg} ${styles.border}`}>
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    {getAlertIcon()}
                </div>
                <div className="ml-3 flex-1">
                    <p className={`text-sm font-bold ${styles.text}`}>
                        {alert.alert_type === 'None' ? `All Clear in ${alert.location}` : `${alert.alert_type} for ${alert.location}`}
                    </p>
                    <h3 className={`text-md font-medium ${styles.text}`}>
                        {alert.headline}
                    </h3>
                    {alert.alert_type !== 'None' && (
                        <div className={`mt-2 text-sm ${styles.text}`}>
                            <p>{alert.description}</p>
                        </div>
                    )}
                </div>
                <div className="ml-4 flex-shrink-0">
                    <button
                        onClick={onDismiss}
                        className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.text} ${styles.buttonHover} focus:ring-offset-slate-50`}
                    >
                        <span className="sr-only">Dismiss</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

const ForecastCard: React.FC<{ forecast: WeatherForecast }> = ({ forecast }) => {
    const getWeatherIcon = (conditions: string) => {
        const lowerCaseConditions = conditions.toLowerCase();
        if (lowerCaseConditions.includes('sun') || lowerCaseConditions.includes('clear')) {
            return <SunIcon className="w-10 h-10 text-yellow-500" />;
        }
        if (lowerCaseConditions.includes('cloud')) {
            if (lowerCaseConditions.includes('partly')) {
                 return <PartlyCloudyIcon className="w-10 h-10 text-slate-500" />;
            }
            return <CloudIcon className="w-10 h-10 text-slate-500" />;
        }
        if (lowerCaseConditions.includes('rain') || lowerCaseConditions.includes('shower')) {
            return <RainIcon className="w-10 h-10 text-blue-500" />;
        }
        return <PartlyCloudyIcon className="w-10 h-10 text-slate-500" />;
    };

    return (
        <div className="flex-shrink-0 w-32 bg-slate-50 rounded-lg p-3 text-center shadow">
            <p className="font-bold text-sm text-text-primary">{forecast.day.substring(0, 3)}</p>
            <div className="my-2 flex justify-center">{getWeatherIcon(forecast.conditions)}</div>
            <p className="font-semibold text-lg text-text-primary">{forecast.high_temp}°</p>
            <p className="text-sm text-text-secondary">{forecast.low_temp}°</p>
            <div className="mt-2 text-xs text-text-secondary space-y-1">
                <div className="flex items-center justify-center space-x-1">
                    <PrecipitationIcon className="w-3 h-3" />
                    <span>{forecast.precipitation_probability}%</span>
                </div>
                <div className="flex items-center justify-center space-x-1">
                    <WindIcon className="w-3 h-3" />
                    <span>{forecast.wind_speed} km/h</span>
                </div>
            </div>
        </div>
    );
}

const Dashboard: React.FC<DashboardProps> = ({ setCurrentView }) => {
  const [weatherAlert, setWeatherAlert] = useState<WeatherAlert | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(true);
  const [weatherError, setWeatherError] = useState<string>('');
  const [isAlertDismissed, setIsAlertDismissed] = useState<boolean>(false);
  const [forecast, setForecast] = useState<WeatherForecast[] | null>(null);
  const [forecastLoading, setForecastLoading] = useState<boolean>(true);
  const [forecastError, setForecastError] = useState<string>('');
  
  const handleDismissAlert = () => {
    setIsAlertDismissed(true);
  };
  
  useEffect(() => {
    if (!navigator.geolocation) {
      const errorMsg = 'Geolocation is not supported by your browser.';
      setWeatherError(errorMsg);
      setForecastError(errorMsg);
      setWeatherLoading(false);
      setForecastLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Fetch Weather Alert
          setWeatherLoading(true);
          const alertData = await getWeatherAlerts(latitude, longitude);
          setWeatherAlert(alertData);
          setIsAlertDismissed(false); // Show new alerts
          setWeatherLoading(false);

          // Fetch 5-day Forecast
          setForecastLoading(true);
          const forecastData = await getWeatherForecast(latitude, longitude);
          setForecast(forecastData);
          setForecastLoading(false);

        } catch (error) {
          console.error('Failed to fetch weather data:', error);
          const errorMsg = 'Could not retrieve weather data. Please try again later.';
          setWeatherError(errorMsg);
          setForecastError(errorMsg);
          setWeatherLoading(false);
          setForecastLoading(false);
        }
      },
      () => {
        const errorMsg = 'Location access denied. Please enable location services for weather updates.';
        setWeatherError(errorMsg);
        setForecastError(errorMsg);
        setWeatherLoading(false);
        setForecastLoading(false);
      }
    );
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-surface rounded-xl shadow-md p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Real-time Weather Alerts</h3>
            {weatherLoading && <p className="text-sm text-text-secondary">Fetching local weather alerts...</p>}
            {weatherError && <p className="text-sm text-red-600">{weatherError}</p>}
            {weatherAlert && !isAlertDismissed && <WeatherAlertComponent alert={weatherAlert} onDismiss={handleDismissAlert} />}
            {!weatherLoading && !weatherError && (isAlertDismissed || !weatherAlert) && (
               <p className="text-sm text-text-secondary">No active alerts to show.</p>
            )}
          </div>
          <div className="border-t border-slate-200 pt-4">
              <h3 className="text-lg font-bold text-text-primary mb-2">5-Day Forecast</h3>
              {forecastLoading && <p className="text-sm text-text-secondary">Fetching forecast...</p>}
              {forecastError && <p className="text-sm text-red-600">{forecastError}</p>}
              {forecast && (
                  <div className="flex space-x-3 overflow-x-auto pb-2">
                      {forecast.map(dayForecast => <ForecastCard key={dayForecast.day} forecast={dayForecast} />)}
                  </div>
              )}
          </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Welcome to AgriNext 2.0</h2>
        <p className="text-text-secondary mt-1">Your AI-powered smart farm brain. Select a tool to begin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          title="AI Pest & Disease Detection"
          description="Upload an image of a plant leaf to instantly identify potential issues and get treatment advice."
          icon={<LeafIcon className="w-6 h-6" />}
          onClick={() => setCurrentView('pest-detection')}
        />
        <FeatureCard
          title="Voice-Based Crop Advisory"
          description="Ask our AI expert anything about your crops. Get instant, voice-enabled advice in your regional language."
          icon={<ChatIcon className="w-6 h-6" />}
          onClick={() => setCurrentView('crop-advisory')}
        />
        <FeatureCard
          title="Smart Fertilizer & Irrigation Plan"
          description="Generate a custom, data-driven plan for your specific crop, soil, and weather conditions to optimize yield."
          icon={<PlanIcon className="w-6 h-6" />}
          onClick={() => setCurrentView('smart-plan')}
        />
      </div>
    </div>
  );
};

export default Dashboard;