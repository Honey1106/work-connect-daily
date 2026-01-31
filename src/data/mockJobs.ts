import type { Language } from '@/contexts/LanguageContext';

type LanguageMap = Partial<Record<Language, string>>;

export interface Job {
  id: string;
  type: string;
  typeIcon: string;
  wage: number;
  startTime: string;
  endTime: string;
  location: string;
  employerPhone: string;
  postedAt: Date;
  typeTranslations?: LanguageMap;
}

export interface JobType {
  id: string;
  label: string;
  icon: string;
  translations?: LanguageMap;
}

export const jobTypes: JobType[] = [
  { id: 'construction', label: 'Construction', icon: 'hard-hat', translations: { te: 'నిర్మాణం' } },
  { id: 'farming', label: 'Farming', icon: 'wheat', translations: { te: 'వ్యవసాయం' } },
  { id: 'delivery', label: 'Delivery', icon: 'truck', translations: { te: 'డెలివరీ' } },
  { id: 'helper', label: 'Helper', icon: 'hand-helping', translations: { te: 'సహాయకుడు' } },
  { id: 'cleaning', label: 'Cleaning', icon: 'sparkles', translations: { te: 'శుభ్రపరచడం' } },
  { id: 'cooking', label: 'Cooking', icon: 'chef-hat', translations: { te: 'వంట' } },
  { id: 'painting', label: 'Painting', icon: 'paint-roller', translations: { te: 'పెయింటింగ్' } },
  { id: 'loading', label: 'Loading/Unloading', icon: 'package', translations: { te: 'లోడింగ్/అన్‌లోడింగ్' } },
];

export const mockJobs: Job[] = [
  {
    id: '1',
    type: 'Construction',
    typeIcon: 'hard-hat',
    typeTranslations: { te: 'నిర్మాణం' },
    wage: 600,
    startTime: '07:00',
    endTime: '17:00',
    location: 'Gachibowli, Hyderabad',
    employerPhone: '+919876543210',
    postedAt: new Date(),
  },
  {
    id: '2',
    type: 'Farming',
    typeIcon: 'wheat',
    typeTranslations: { te: 'వ్యవసాయం' },
    wage: 450,
    startTime: '06:00',
    endTime: '14:00',
    location: 'Shamshabad Village',
    employerPhone: '+919876543211',
    postedAt: new Date(),
  },
  {
    id: '3',
    type: 'Delivery',
    typeIcon: 'truck',
    typeTranslations: { te: 'డెలివరీ' },
    wage: 500,
    startTime: '09:00',
    endTime: '18:00',
    location: 'Kukatpally, Hyderabad',
    employerPhone: '+919876543212',
    postedAt: new Date(),
  },
  {
    id: '4',
    type: 'Helper',
    typeIcon: 'hand-helping',
    typeTranslations: { te: 'సహాయకుడు' },
    wage: 400,
    startTime: '08:00',
    endTime: '16:00',
    location: 'Kondapur, Hyderabad',
    employerPhone: '+919876543213',
    postedAt: new Date(),
  },
  {
    id: '5',
    type: 'Cleaning',
    typeIcon: 'sparkles',
    typeTranslations: { te: 'శుభ్రపరచడం' },
    wage: 350,
    startTime: '07:00',
    endTime: '12:00',
    location: 'Jubilee Hills, Hyderabad',
    employerPhone: '+919876543214',
    postedAt: new Date(),
  },
  {
    id: '6',
    type: 'Loading/Unloading',
    typeIcon: 'package',
    typeTranslations: { te: 'లోడింగ్/అన్‌లోడింగ్' },
    wage: 550,
    startTime: '05:00',
    endTime: '11:00',
    location: 'Bowenpally Market',
    employerPhone: '+919876543215',
    postedAt: new Date(),
  },
];
