import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockJobs } from '@/data/mockJobs';
import { JobIcon } from '@/components/JobIcon';
import { ChevronLeft, Clock, MapPin, Phone, IndianRupee } from 'lucide-react';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const job = mockJobs.find((j) => j.id === id);

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Job not found</p>
      </div>
    );
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleCall = () => {
    window.location.href = `tel:${job.employerPhone}`;
  };

  const jobTypeLabel = job.typeTranslations?.[language] ?? job.type;

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-4 px-4 py-4 max-w-md mx-auto">
          <button
            onClick={() => navigate('/jobs')}
            className="p-2 -ml-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">{t.jobDetails}</h1>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 max-w-md mx-auto animate-fade-in">
        {/* Job Header Card */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-card mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="icon-circle-lg">
              <JobIcon icon={job.typeIcon} className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{jobTypeLabel}</h2>
              <p className="text-muted-foreground">{t.jobDetails}</p>
            </div>
          </div>

          {/* Wage Highlight */}
          <div className="bg-secondary rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <IndianRupee className="w-8 h-8 text-primary" />
              <span className="text-4xl font-bold text-primary">{job.wage}</span>
            </div>
            <p className="text-muted-foreground mt-1">{t.wagePerDay}</p>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
          <h3 className="font-semibold text-foreground mb-4">Details</h3>

          <div className="space-y-4">
            {/* Working Hours */}
            <div className="flex items-start gap-4">
              <div className="icon-circle flex-shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.workingHours}</p>
                <p className="font-medium text-foreground">
                  {formatTime(job.startTime)} - {formatTime(job.endTime)}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-4">
              <div className="icon-circle flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.location}</p>
                <p className="font-medium text-foreground">{job.location}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4">
        <div className="max-w-md mx-auto">
          <button onClick={handleCall} className="cta-primary flex items-center justify-center gap-3">
            <Phone className="w-6 h-6" />
            <span>{t.callEmployer}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
