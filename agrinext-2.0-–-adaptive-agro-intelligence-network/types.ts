export type View = 'dashboard' | 'pest-detection' | 'crop-advisory' | 'smart-plan';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface FertilizerPlan {
  stage: string;
  fertilizer_type: string;
  application_method: string;
  notes: string;
}

export interface IrrigationPlan {
  stage: string;
  frequency: string;
  duration_minutes: number;
  water_volume_liters_per_plant: number;
  notes: string;
}

export interface SmartPlanData {
  crop_name: string;
  fertilizer_plan: FertilizerPlan[];
  irrigation_plan: IrrigationPlan[];
  summary: string;
}

export interface WeatherAlert {
  location: string;
  alert_type: 'Warning' | 'Watch' | 'Advisory' | 'None';
  headline: string;
  description: string;
}

export interface WeatherForecast {
    day: string;
    high_temp: number;
    low_temp: number;
    conditions: 'Sunny' | 'Partly Cloudy' | 'Cloudy' | 'Rain' | 'Thunderstorm' | string;
    precipitation_probability: number;
    wind_speed: number;
}