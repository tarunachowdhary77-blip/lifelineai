import React, { useState, useMemo } from 'react';
import {
  Clock,
  Filter,
  Calendar,
  Search,
  Activity,
  HeartPulse,
  Pill,
  FileText,
  Stethoscope,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { TimelineEvent, TimelineEventType, PatientProfile } from '../../types';

interface Props {
  events: TimelineEvent[];
  patient: PatientProfile;
  onOpenEvent: (event: TimelineEvent) => void;
  onOpenSummary: () => void;
}

export const HealthTimelineView: React.FC<Props> = ({
  events,
  patient,
  onOpenEvent,
  onOpenSummary,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => {
        if (filterType !== 'all' && e.type !== filterType) {
          return false;
        }
        if (startDate && e.date < startDate) {
          return false;
        }
        if (endDate && e.date > endDate) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = e.title.toLowerCase().includes(q);
          const matchDesc = e.description.toLowerCase().includes(q);
          const matchSource = e.sourceLabel.toLowerCase().includes(q);
          return matchTitle || matchDesc || matchSource;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.date !== b.date) {
          return sortOrder === 'desc'
            ? b.date.localeCompare(a.date)
            : a.date.localeCompare(b.date);
        }
        const timeA = a.time || '00:00';
        const timeB = b.time || '00:00';
        return sortOrder === 'desc'
          ? timeB.localeCompare(timeA)
          : timeA.localeCompare(timeB);
      });
  }, [events, filterType, searchQuery, startDate, endDate, sortOrder]);

  const getEventIcon = (type: TimelineEventType) => {
    switch (type) {
      case 'consultation':
        return <Stethoscope className="w-4 h-4 text-teal-600" />;
      case 'symptom':
        return <Activity className="w-4 h-4 text-rose-600" />;
      case 'medication':
      case 'adherence':
        return <Pill className="w-4 h-4 text-blue-600" />;
      case 'document':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'daily_checkin':
      case 'measurement':
        return <HeartPulse className="w-4 h-4 text-emerald-600" />;
      case 'appointment':
        return <CalendarDays className="w-4 h-4 text-indigo-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-600" />;
    }
  };

  const getBadgeStyle = (category: string) => {
    switch (category) {
      case 'clinician':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'document':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'patient':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Description */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Chronological Health Timeline
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
              {filteredEvents.length} Events
            </span>
          </div>
          <p className="text-sm text-slate-600 max-w-2xl">
            A unified, connected timeline of {patient.name}'s check-ins, symptoms, medications, clinical consultations, documents, and treatment responses.
          </p>
        </div>

        <button
          onClick={onOpenSummary}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          Prepare Doctor Summary
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search symptoms, meds, doctors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Event Type Filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Event Types</option>
              <option value="consultation">Doctor Consultations</option>
              <option value="symptom">Symptoms & Discomfort</option>
              <option value="medication">Medication Prescriptions</option>
              <option value="adherence">Medication Adherence (Missed/Taken)</option>
              <option value="document">Medical Documents & Tests</option>
              <option value="daily_checkin">Daily Health Check-ins</option>
              <option value="appointment">Upcoming Appointments</option>
            </select>
          </div>

          {/* Date Range Start */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 shrink-0">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Date Range End & Sort Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 shrink-0">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1 shrink-0 transition-colors"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
            </button>
          </div>
        </div>

        {(startDate || endDate || filterType !== 'all' || searchQuery) && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Filtering active</span>
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setFilterType('all');
                setSearchQuery('');
              }}
              className="text-teal-600 hover:text-teal-800 font-semibold underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Timeline Stream */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Clock className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No timeline events found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or date filter, or add a new health check-in, symptom, or consultation.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:inset-0 before:left-3 sm:before:left-4 before:w-0.5 before:bg-slate-200">
          {filteredEvents.map((evt) => (
            <div key={evt.id} className="relative group">
              {/* Dot Icon on the Spine */}
              <div
                className={`absolute -left-6 sm:-left-8 top-3.5 w-6 h-6 rounded-full bg-white border-2 flex items-center justify-center shadow-xs transition-transform group-hover:scale-110 ${
                  evt.isFlagged
                    ? 'border-red-500 bg-red-50'
                    : 'border-teal-500 bg-teal-50'
                }`}
              >
                {getEventIcon(evt.type)}
              </div>

              {/* Event Card */}
              <div
                onClick={() => onOpenEvent(evt)}
                className={`p-4 sm:p-5 bg-white rounded-2xl border shadow-2xs hover:shadow-md transition-all cursor-pointer ${
                  evt.isFlagged
                    ? 'border-red-200 bg-red-50/20 hover:border-red-300'
                    : 'border-slate-200 hover:border-teal-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {evt.date}
                    </span>
                    {evt.time && (
                      <span className="text-[11px] font-mono text-slate-400">
                        {evt.time}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(
                        evt.sourceCategory
                      )}`}
                    >
                      {evt.sourceLabel}
                    </span>
                    {evt.isFlagged && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 animate-pulse">
                        Severe / Recurrence
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-teal-600 font-semibold group-hover:underline flex items-center gap-1 self-start sm:self-auto">
                    View record <ExternalLink className="w-3 h-3" />
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1.5 flex items-center gap-2">
                  {evt.title}
                  {evt.severity !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        evt.severity >= 7
                          ? 'bg-red-100 text-red-800'
                          : evt.severity >= 4
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      Pain: {evt.severity}/10
                    </span>
                  )}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {evt.description}
                </p>

                {evt.patientResponse && (
                  <div className="mt-2.5 p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-950">
                    <strong className="text-amber-900">Reported Treatment Response: </strong>
                    {evt.patientResponse}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
