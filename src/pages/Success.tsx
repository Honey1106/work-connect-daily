import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Check, Plus, Home } from 'lucide-react';

export default function Success() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md text-center animate-fade-in">
        {/* Success Icon */}
        <div className="success-circle mx-auto mb-8">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center animate-check-bounce">
            <Check className="w-10 h-10 text-primary-foreground" strokeWidth={3} />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-foreground mb-3">
          {t.jobPosted}
        </h1>
        <p className="text-lg text-muted-foreground mb-10">
          {t.workersWillCall}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate('/post-job')}
            className="cta-primary flex items-center justify-center gap-3"
          >
            <Plus className="w-5 h-5" />
            <span>{t.postAnother}</span>
          </button>

          <button
            onClick={() => navigate('/home')}
            className="w-full py-4 px-6 rounded-xl text-lg font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors flex items-center justify-center gap-3"
          >
            <Home className="w-5 h-5" />
            <span>{t.goHome}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
