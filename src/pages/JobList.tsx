import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockJobs } from '@/data/mockJobs';
import { JobIcon } from '@/components/JobIcon';
import { ChevronLeft, Clock, MapPin } from 'lucide-react';

export default function JobList() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const formatHours = (start: string, end: string) => {
    const startHour = parseInt(start.split(':')[0]);
    const endHour = parseInt(end.split(':')[0]);
    return endHour - startHour;
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
          <h1 className="text-xl font-semibold">{t.nearbyJobs}</h1>
        </div>
      </header>

      {/* Job List */}
      <div className="px-4 py-6 max-w-md mx-auto">
        <div className="flex flex-col gap-4">
          {mockJobs.map((job, index) => (
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
      </div>
    </div>
  );
}
