import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'te' | 'hi' | 'ta';

interface Translations {
  selectLanguage: string;
  appName: string;
  tagline: string;
  iNeedWork: string;
  findNearbyJobs: string;
  iNeedWorker: string;
  postJobQuickly: string;
  nearbyJobs: string;
  perDay: string;
  hours: string;
  callEmployer: string;
  postJob: string;
  jobType: string;
  wagePerDay: string;
  workingHours: string;
  location: string;
  startTime: string;
  endTime: string;
  selectJobType: string;
  enterWage: string;
  enterLocation: string;
  jobPosted: string;
  workersWillCall: string;
  postAnother: string;
  goHome: string;
  back: string;
  jobDetails: string;
}

const translations: Record<Language, Translations> = {
  en: {
    selectLanguage: 'Select Language',
    appName: 'RojgarMitra',
    tagline: 'Find work. Find workers.',
    iNeedWork: 'I Need Work',
    findNearbyJobs: 'Find nearby jobs',
    iNeedWorker: 'I Need Worker',
    postJobQuickly: 'Post a job quickly',
    nearbyJobs: 'Nearby Jobs',
    perDay: '/day',
    hours: 'hrs',
    callEmployer: 'Call Employer',
    postJob: 'Post Job',
    jobType: 'Job Type',
    wagePerDay: 'Wage per day',
    workingHours: 'Working Hours',
    location: 'Location',
    startTime: 'Start Time',
    endTime: 'End Time',
    selectJobType: 'Select job type',
    enterWage: 'Enter daily wage',
    enterLocation: 'Enter location',
    jobPosted: 'Job Posted Successfully!',
    workersWillCall: 'Workers will call you directly',
    postAnother: 'Post Another Job',
    goHome: 'Go Home',
    back: 'Back',
    jobDetails: 'Job Details',
  },
  te: {
    selectLanguage: 'భాష ఎంచుకోండి',
    appName: 'రోజ్‌గార్ మిత్ర',
    tagline: 'పని కనుగొనండి. కార్మికులను కనుగొనండి.',
    iNeedWork: 'నాకు పని కావాలి',
    findNearbyJobs: 'సమీపంలోని ఉద్యోగాలు',
    iNeedWorker: 'నాకు కార్మికుడు కావాలి',
    postJobQuickly: 'త్వరగా ఉద్యోగం పోస్ట్ చేయండి',
    nearbyJobs: 'సమీపంలోని ఉద్యోగాలు',
    perDay: '/రోజు',
    hours: 'గంటలు',
    callEmployer: 'యజమానికి కాల్ చేయండి',
    postJob: 'ఉద్యోగం పోస్ట్ చేయండి',
    jobType: 'ఉద్యోగ రకం',
    wagePerDay: 'రోజుకు వేతనం',
    workingHours: 'పని గంటలు',
    location: 'ప్రదేశం',
    startTime: 'ప్రారంభ సమయం',
    endTime: 'ముగింపు సమయం',
    selectJobType: 'ఉద్యోగ రకం ఎంచుకోండి',
    enterWage: 'రోజువారీ వేతనం నమోదు చేయండి',
    enterLocation: 'ప్రదేశం నమోదు చేయండి',
    jobPosted: 'ఉద్యోగం విజయవంతంగా పోస్ట్ చేయబడింది!',
    workersWillCall: 'కార్మికులు మీకు నేరుగా కాల్ చేస్తారు',
    postAnother: 'మరొక ఉద్యోగం పోస్ట్ చేయండి',
    goHome: 'హోమ్‌కి వెళ్ళండి',
    back: 'వెనుకకు',
    jobDetails: 'ఉద్యోగ వివరాలు',
  },
  hi: {
    selectLanguage: 'भाषा चुनें',
    appName: 'रोजगार मित्र',
    tagline: 'काम खोजें। कामगार खोजें।',
    iNeedWork: 'मुझे काम चाहिए',
    findNearbyJobs: 'आस-पास की नौकरियां खोजें',
    iNeedWorker: 'मुझे कामगार चाहिए',
    postJobQuickly: 'जल्दी से नौकरी पोस्ट करें',
    nearbyJobs: 'आस-पास की नौकरियां',
    perDay: '/दिन',
    hours: 'घंटे',
    callEmployer: 'नियोक्ता को कॉल करें',
    postJob: 'नौकरी पोस्ट करें',
    jobType: 'काम का प्रकार',
    wagePerDay: 'दैनिक मजदूरी',
    workingHours: 'काम के घंटे',
    location: 'स्थान',
    startTime: 'शुरू का समय',
    endTime: 'समाप्ति का समय',
    selectJobType: 'काम का प्रकार चुनें',
    enterWage: 'दैनिक मजदूरी दर्ज करें',
    enterLocation: 'स्थान दर्ज करें',
    jobPosted: 'नौकरी सफलतापूर्वक पोस्ट हो गई!',
    workersWillCall: 'कामगार सीधे आपको कॉल करेंगे',
    postAnother: 'एक और नौकरी पोस्ट करें',
    goHome: 'होम जाएं',
    back: 'वापस',
    jobDetails: 'नौकरी विवरण',
  },
  ta: {
    selectLanguage: 'மொழி தேர்வு',
    appName: 'ரோஜ்கார் மித்ரா',
    tagline: 'வேலை தேடுங்கள். தொழிலாளர்களைக் கண்டறியுங்கள்.',
    iNeedWork: 'எனக்கு வேலை வேண்டும்',
    findNearbyJobs: 'அருகிலுள்ள வேலைகள்',
    iNeedWorker: 'எனக்கு தொழிலாளி வேண்டும்',
    postJobQuickly: 'விரைவாக வேலை போடுங்கள்',
    nearbyJobs: 'அருகிலுள்ள வேலைகள்',
    perDay: '/நாள்',
    hours: 'மணி',
    callEmployer: 'முதலாளியை அழைக்கவும்',
    postJob: 'வேலை போடு',
    jobType: 'வேலை வகை',
    wagePerDay: 'நாள் கூலி',
    workingHours: 'வேலை நேரம்',
    location: 'இடம்',
    startTime: 'தொடக்க நேரம்',
    endTime: 'முடிவு நேரம்',
    selectJobType: 'வேலை வகையைத் தேர்ந்தெடுக்கவும்',
    enterWage: 'நாள் கூலியை உள்ளிடவும்',
    enterLocation: 'இடத்தை உள்ளிடவும்',
    jobPosted: 'வேலை வெற்றிகரமாக போடப்பட்டது!',
    workersWillCall: 'தொழிலாளர்கள் உங்களை நேரடியாக அழைப்பார்கள்',
    postAnother: 'மற்றொரு வேலை போடு',
    goHome: 'முகப்புக்கு செல்',
    back: 'பின்செல்',
    jobDetails: 'வேலை விவரங்கள்',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
