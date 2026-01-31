import { useNavigate } from 'react-router-dom';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

const languages: { code: Language; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
];

export default function LanguageSelect() {
  const navigate = useNavigate();
  const { setLanguage } = useLanguage();

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="icon-circle-lg mx-auto mb-6">
            <Globe className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Select Language
          </h1>
          <p className="text-muted-foreground">
            భాష ఎంచుకోండి • भाषा चुनें • மொழி தேர்வு
          </p>
        </div>

        {/* Language Buttons */}
        <div className="flex flex-col gap-4">
          {languages.map((lang, index) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className="lang-btn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="flex items-center gap-3">
                <span className="text-lg font-semibold">{lang.native}</span>
                {lang.code !== 'en' && (
                  <span className="text-muted-foreground">({lang.label})</span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
