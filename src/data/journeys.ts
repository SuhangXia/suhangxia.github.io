import venice from '../assets/media/travel/venice-italy.jpg';
import paris from '../assets/media/travel/paris-france.jpg';
import edinburgh from '../assets/media/travel/edinburgh-scotland.jpg';
import zermatt from '../assets/media/travel/zermatt-switzerland.jpg';
import bosphorus from '../assets/media/travel/istanbul-bosphorus.jpg';
import alps from '../assets/media/travel/swiss-alps.jpg';
import milan from '../assets/media/travel/milan-italy.jpg';
import viewpoint from '../assets/media/travel/istanbul-viewpoint-center.jpg';
import versailles from '../assets/media/travel/versailles-france.jpg';

// Order follows the desktop contact sheet. Keep the portrait compositions tall.
export const journeys = [
  {
    id: 'venice',
    city: 'Venice',
    country: 'Italy',
    media: venice,
    portrait: false,
    position: '50% 55%',
    alt: 'Suhang Xia in front of St Mark’s Basilica in Venice',
  },
  {
    id: 'paris',
    city: 'Paris',
    country: 'France',
    media: paris,
    portrait: true,
    position: '50% 65%',
    alt: 'Suhang Xia beneath the illuminated Eiffel Tower in Paris at night',
  },
  {
    id: 'edinburgh',
    city: 'Edinburgh',
    country: 'Scotland',
    media: edinburgh,
    portrait: false,
    position: '76% 55%',
    alt: 'Suhang Xia on a rocky coastline during a trip to Edinburgh',
  },
  {
    id: 'zermatt',
    city: 'Zermatt',
    country: 'Switzerland',
    media: zermatt,
    portrait: false,
    position: '50% 58%',
    alt: 'Suhang Xia beside the Zermatt sign with the Matterhorn in the distance',
  },
  {
    id: 'bosphorus',
    city: 'The Bosphorus',
    country: 'Türkiye',
    media: bosphorus,
    portrait: false,
    position: '50% 50%',
    alt: 'Suhang Xia beside the Bosphorus at sunset in Istanbul',
  },
  {
    id: 'alps',
    city: 'Swiss Alps',
    country: 'Switzerland',
    media: alps,
    portrait: true,
    position: '50% 50%',
    alt: 'Suhang Xia at an alpine viewpoint in Switzerland',
  },
  {
    id: 'milan',
    city: 'Milan',
    country: 'Italy',
    media: milan,
    portrait: true,
    position: '50% 50%',
    alt: 'Suhang Xia in front of Milan Cathedral',
  },
  {
    id: 'viewpoint',
    city: 'Istanbul',
    country: 'Türkiye',
    media: viewpoint,
    portrait: false,
    position: '60% 50%',
    alt: 'Suhang Xia and a companion overlooking Istanbul and the Bosphorus',
  },
  {
    id: 'versailles',
    city: 'Versailles',
    country: 'France',
    media: versailles,
    portrait: false,
    position: '50% 52%',
    alt: 'Suhang Xia overlooking the gardens at the Palace of Versailles',
  },
] as const;
