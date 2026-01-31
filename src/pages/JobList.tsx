import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockJobs } from '@/data/mockJobs';
import { JobIcon } from '@/components/JobIcon';
import { VoiceButton } from '@/components/VoiceInput';
import { ChevronLeft, Clock, MapPin, Mic, Search, X } from 'lucide-react';

export default function JobList() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);

  const formatHours = (start: string, end: string) => {
    const startHour = parseInt(start.split(':')[0]);
    const endHour = parseInt(end.split(':')[0]);
    return endHour - startHour;
  };

  // Filter jobs based on search query
  const filteredJobs = mockJobs.filter((job) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      job.type.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query)
    );
  });

  const handleVoiceResult = (text: string) => {
    setSearchQuery(text);
    setShowVoiceSearch(false);
  };

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-4 px-4 py-4 max-w-md mx-auto">
          <button
            onClick={() => navigate('/home')}
            className="p-2 -ml-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold flex-1">{t.nearbyJobs}</h1>
          <button
            onClick={() => setShowVoiceSearch(true)}
            className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar */}
        {searchQuery && (
          <div className="px-4 pb-4 max-w-md mx-auto">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary">
              <Search className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-foreground">{searchQuery}</span>
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Voice Search Modal */}
      {showVoiceSearch && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-md animate-scale-in">
            <button
              onClick={() => setShowVoiceSearch(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">{t.voiceSearch}</h2>
              <p className="text-muted-foreground">{t.tapToSpeak}</p>
            </div>

            <VoiceButton
              onResult={handleVoiceResult}
              label={t.speakToSearch}
              sublabel={t.searchJobs}
            />
          </div>
        </div>
      )}

      {/* Job List */}
      <div className="px-4 py-6 max-w-md mx-auto">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No jobs found for "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-primary font-medium"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredJobs.map((job, index) => (
              <button
                key={job.id}
                onClick={() => navigate(`/job/${job.id}`)}
                className="job-card text-left animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Icon */}
                <div className="icon-circle flex-shrink-0">
                  <JobIcon icon={job.typeIcon} className="w-7 h-7 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">
                    {job.type}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatHours(job.startTime, job.endTime)} {t.hours}
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{job.location.split(',')[0]}</span>
                    </span>
                  </div>
                </div>

                {/* Wage */}
                <div className="text-right flex-shrink-0">
                  <span className="text-lg font-bold text-primary">₹{job.wage}</span>
                  <span className="text-sm text-muted-foreground">{t.perDay}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
