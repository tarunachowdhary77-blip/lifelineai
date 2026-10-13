import React from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  User,
  Sparkles,
  Edit2,
  Trash2,
} from 'lucide-react';
import { AppointmentEntry, PatientProfile } from '../../types';
import { deleteAppointment } from '../../lib/storage';

interface Props {
  appointments: AppointmentEntry[];
  patient: PatientProfile;
  onAddAppointment: () => void;
  onEditAppointment: (apt: AppointmentEntry) => void;
  onOpenSummary: () => void;
  onRefresh: () => void;
}

export const AppointmentsView: React.FC<Props> = ({
  appointments,
  patient,
  onAddAppointment,
  onEditAppointment,
  onOpenSummary,
  onRefresh,
}) => {
  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete appointment "${title}"?`)) {
      deleteAppointment(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Personal Medical Appointments
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              {appointments.length} Scheduled
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Keep track of upcoming consultations and prepare summary handover documents in advance.
          </p>
        </div>

        <button
          onClick={onAddAppointment}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Schedule Appointment
        </button>
      </div>

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <CalendarDays className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No upcoming appointments</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Schedule your next doctor visit and prepare a synthesized health timeline summary beforehand.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mb-1">
                      {apt.date} at {apt.time}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">{apt.title}</h3>
                    <p className="text-xs font-semibold text-slate-600">
                      {apt.doctorName} • {apt.specialty}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                    {apt.status}
                  </span>
                </div>

                {apt.location && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{apt.location}</span>
                  </div>
                )}

                {apt.reason && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700">
                    <strong className="block text-[11px] text-slate-900 mb-0.5 uppercase tracking-wide">
                      Visit Objective:
                    </strong>
                    {apt.reason}
                  </div>
                )}

                {apt.reminderNotes && (
                  <div className="p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs text-indigo-950">
                    <strong className="block text-[11px] text-indigo-900 mb-0.5">
                      Preparation Note:
                    </strong>
                    {apt.reminderNotes}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={onOpenSummary}
                  className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-800"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Prepare Summary for this visit
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditAppointment(apt)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(apt.id, apt.title)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
