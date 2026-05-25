import { Component, OnInit } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';

const WMO_DESC: Record<string, Record<number, string>> = {
  es: {
    0: 'Despejado', 1: 'Mayormente despejado', 2: 'Parcialmente nublado', 3: 'Nublado',
    45: 'Niebla', 48: 'Niebla con escarcha',
    51: 'Llovizna ligera', 53: 'Llovizna moderada', 55: 'Llovizna densa',
    61: 'Lluvia ligera', 63: 'Lluvia moderada', 65: 'Lluvia intensa',
    71: 'Nieve ligera', 73: 'Nieve moderada',
    80: 'Chubascos ligeros', 81: 'Chubascos moderados', 82: 'Chubascos fuertes',
    95: 'Tormenta', 96: 'Tormenta con granizo', 99: 'Tormenta fuerte',
  },
  en: {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Icy fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    61: 'Light rain', 63: 'Moderate rain', 65: 'Heavy rain',
    71: 'Light snow', 73: 'Moderate snow',
    80: 'Light showers', 81: 'Moderate showers', 82: 'Heavy showers',
    95: 'Thunderstorm', 96: 'Hail storm', 99: 'Heavy hail storm',
  },
};

export type WxIconType = 'sun' | 'cloud' | 'rain';

@Component({
  standalone: false,
  selector: 'app-invi-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss'],
})
export class WeatherComponent implements OnInit {
  loading = true;
  error = false;
  data: any = null;
  forecastDays: any[] = [];

  constructor(public i18n: I18nService) {}

  async ngOnInit() {
    try {
      const res = await fetch(
        'https://api.open-meteo.com/v1/forecast' +
        '?latitude=-17.3895&longitude=-66.1568' +
        '&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,weathercode,is_day' +
        '&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum' +
        '&timezone=America%2FLa_Paz&forecast_days=4'
      );
      const json = await res.json();
      this.data = json;
      this.forecastDays = json.daily.time.slice(1, 4).map((dateStr: string, idx: number) => ({
        day: this.dayName(dateStr),
        iconType: this.getIconType(json.daily.weathercode[idx + 1]),
        hi: Math.round(json.daily.temperature_2m_max[idx + 1]),
        lo: Math.round(json.daily.temperature_2m_min[idx + 1]),
      }));
      this.loading = false;
    } catch {
      this.error = true;
      this.loading = false;
    }
  }

  get description(): string {
    if (!this.data) return '';
    const code = this.data.current.weathercode;
    const lang = this.i18n.current;
    return WMO_DESC[lang][code] || (lang === 'es' ? 'Variable' : 'Variable');
  }

  getIconType(code: number): WxIconType {
    if (code <= 1) return 'sun';
    if (code <= 3) return 'cloud';
    return 'rain';
  }

  dayName(dateStr: string): string {
    const d = new Date(dateStr + 'T12:00:00');
    return this.i18n.tArr('wx_days')[d.getDay()] || '';
  }
}
