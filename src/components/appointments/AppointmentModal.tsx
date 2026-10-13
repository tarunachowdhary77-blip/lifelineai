import React, { useState, useEffect } from 'react';
import { X, CalendarDays, Trash2 } from 'lucide-react';
import { AppointmentEntry } from '../../types';
import { saveAppointment, deleteAppointment } from '../../lib/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  appointmentToEdit?: AppointmentEntry | null;
  patientId: string;
  onSaved: () => void;
}

export const AppointmentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  appointmentToEdit,
  patientId,
  onSaved,
}) => {
  const [title, setTitle] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [reminderNotes, setReminderNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (appointmentToEdit) {
        setTitle(appointmentToEdit.title);
        setDoctorName(appointmentToEdit.doctorName);
        setSpecialty(appointmentToEdit.specialty);
        setLocation(appointmentToEdit.location);
        setDate(appointmentToEdit.date);
        setTime(appointmentToEdit.time);
        setReason(appointmentToEdit.reason);
        setStatus(appointmentToEdit.status);
        setReminderNotes(appointmentToEdit.reminderNotes || '');
      } else {
        setTitle('');
        setDoctorName('');
        setSpecialty('');
        setLocation('');
        setDate(new Date().toISOString().split('T')[0]);
        setTime('10:00');
        setReason('');
        setStatus('upcoming');
        setReminderNotes('');
      }
    }
  }, [isOpen, appointmentToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const entry: AppointmentEntry = {
      id: appointmentToEdit?.id || `apt-${Date.now()}`,
      patientId,
      title: title.trim(),
      doctorName: doctorName.trim(),
      specialty: specialty.trim(),
      location: location.trim(),
      date,
      time,
      reason: reason.trim(),
      status,
      reminderNotes: reminderNotes.trim() || undefined,
      createdAt: appointmentToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveAppointment(entry);
    onSaved();
    onClose();
  };

  const handleDelete = () => {
    if (appointmentToEdit && confirm('Delete this scheduled appointment?')) {
      deleteAppointment(appointmentToEdit.id);
      onSaved();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {appointmentToEdit ? 'Edit Appointment' : 'Schedule Appointment'}
              </h2>
              <p className="text-xs text-slate-500">Plan and prepare for upcoming medical reviews.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Visit Purpose / Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ENT Follow-up & Tympanic Healing Review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Doctor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Dr. Angela Davies"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specialty
              </label>
              <input
                type="text"
                placeholder="Otolaryngology (ENT)"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinic Location / Address
            </label>
            <input
              type="text"
              placeholder="Lakeside ENT Specialty Center, Suite 402"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason / Goals for this Visit
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Check if ear drum hole is closing, review ear drainage swab culture, test hearing."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Preparation Reminders
            </label>
            <input
              type="text"
              placeholder="e.g. Bring Lifeline AI pre-consultation summary sheet and ear drop medication bottle"
              value={reminderNotes}
              onChange={(e) => setReminderNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {appointmentToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
              >
                {appointmentToEdit ? 'Save Changes' : 'Save Appointment'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
