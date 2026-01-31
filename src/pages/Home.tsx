import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { HardHat, Briefcase } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md animate-fade-in">
        {/* App Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {t.appName}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t.tagline}
          </p>
        </div>

        {/* Action Cards */}
        <div className="flex flex-col gap-6">
          {/* Worker Card */}
          <button
            onClick={() => navigate('/jobs')}
            className="action-card group"
          >
            <div className="icon-circle-lg mb-4 group-hover:bg-primary/10 transition-colors">
              <HardHat className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-1">
              {t.iNeedWork}
            </h2>
            <p className="text-muted-foreground">
              {t.findNearbyJobs}
            </p>
          </button>

          {/* Employer Card */}
          <button
            onClick={() => navigate('/post-job')}
            className="action-card group"
          >
            <div className="icon-circle-lg mb-4 group-hover:bg-primary/10 transition-colors">
              <Briefcase className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-1">
              {t.iNeedWorker}
            </h2>
            <p className="text-muted-foreground">
              {t.postJobQuickly}
            </p>
          </button>
        </div>

        {/* Language Switcher */}
        <button
          onClick={() => navigate('/')}
          className="mt-10 mx-auto block text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Change Language
        </button>
      </div>
    </div>
  );
}
