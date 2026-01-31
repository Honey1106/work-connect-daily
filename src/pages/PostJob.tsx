import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { jobTypes } from '@/data/mockJobs';
import { JobIcon } from '@/components/JobIcon';
import { VoiceInput } from '@/components/VoiceInput';
import { ChevronLeft, MapPin, IndianRupee, Clock, ChevronDown } from 'lucide-react';

export default function PostJob() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const [jobType, setJobType] = useState('');
  const [wage, setWage] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [location, setLocation] = useState('');
  const [showJobTypes, setShowJobTypes] = useState(false);

  const getJobTypeLabel = (jobTypeOption: (typeof jobTypes)[number]) =>
    jobTypeOption.translations?.[language] ?? jobTypeOption.label;

  const selectedJobType = jobTypes.find((jt) => jt.id === jobType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobType && wage && location) {
      navigate('/success');
    }
  };

  const handleVoiceLocation = (text: string) => {
    setLocation(text);
  };

  const handleVoiceWage = (text: string) => {
    // Extract numbers from voice input
    const numbers = text.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      setWage(numbers[0]);
    }
  };

  const isFormValid = jobType && wage && location;

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
          <h1 className="text-xl font-semibold">{t.postJob}</h1>
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-4 py-6 max-w-md mx-auto animate-fade-in">
        <div className="space-y-5">
          {/* Job Type Selector */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              {t.jobType}
            </label>
            <button
              type="button"
              onClick={() => setShowJobTypes(!showJobTypes)}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border shadow-soft text-left"
            >
              {selectedJobType ? (
                <>
                  <div className="icon-circle flex-shrink-0">
                    <JobIcon icon={selectedJobType.icon} className="w-5 h-5 text-primary" />
                  </div>
                  <span className="flex-1 font-medium">{getJobTypeLabel(selectedJobType)}</span>
                </>
              ) : (
                <span className="flex-1 text-muted-foreground">{t.selectJobType}</span>
              )}
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showJobTypes ? 'rotate-180' : ''}`} />
            </button>

            {/* Job Type Grid */}
            {showJobTypes && (
              <div className="mt-3 grid grid-cols-2 gap-3 animate-fade-in">
                {jobTypes.map((jt) => (
                  <button
                    key={jt.id}
                    type="button"
                    onClick={() => {
                      setJobType(jt.id);
                      setShowJobTypes(false);
                    }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      jobType === jt.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <JobIcon icon={jt.icon} className="w-8 h-8 text-primary" />
                    <span className="text-sm font-medium text-center">{getJobTypeLabel(jt)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Wage Input with Voice */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              {t.wagePerDay}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <IndianRupee className="w-5 h-5 text-muted-foreground" />
                </div>
                <input
                  type="number"
                  value={wage}
                  onChange={(e) => setWage(e.target.value)}
                  placeholder={t.enterWage}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-card border border-border shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-lg"
                />
              </div>
              <VoiceInput 
                onResult={handleVoiceWage} 
                placeholder={t.tapToSpeak}
              />
            </div>
          </div>

          {/* Time Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {t.startTime}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-card border border-border shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {t.endTime}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-card border border-border shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Location Input with Voice */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              {t.location}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t.enterLocation}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-card border border-border shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <VoiceInput 
                onResult={handleVoiceLocation} 
                placeholder={t.speakLocation}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8">
          <button
            type="submit"
            disabled={!isFormValid}
            className={`cta-primary ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {t.postJob}
          </button>
        </div>
      </form>
    </div>
  );
}
