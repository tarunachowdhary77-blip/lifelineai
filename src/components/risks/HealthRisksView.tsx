import React, { useState } from 'react';
import {
  ShieldAlert,
  Flame,
  Heart,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  TrendingDown,
  Info,
  ChevronRight,
  Save,
} from 'lucide-react';
import { PatientProfile, TobaccoRiskProfile } from '../../types';
import { savePatient } from '../../lib/storage';

interface Props {
  patient: PatientProfile;
  onRefresh: () => void;
  onOpenSummary: () => void;
}

export const HealthRisksView: React.FC<Props> = ({
  patient,
  onRefresh,
  onOpenSummary,
}) => {
  const existingTobacco = patient.tobaccoRisk || {
    status: 'never',
    smokingType: '',
    smokelessType: '',
    durationYears: 0,
    frequencyPerDay: '',
    quitYearsAgo: 0,
    quitMotivation: '',
    alcoholUse: 'none',
    physicalActivityLevel: 'moderate',
  };

  const [status, setStatus] = useState<TobaccoRiskProfile['status']>(existingTobacco.status);
  const [smokingType, setSmokingType] = useState(existingTobacco.smokingType || '');
  const [smokelessType, setSmokelessType] = useState(existingTobacco.smokelessType || '');
  const [durationYears, setDurationYears] = useState(existingTobacco.durationYears?.toString() || '');
  const [frequencyPerDay, setFrequencyPerDay] = useState(existingTobacco.frequencyPerDay || '');
  const [quitYearsAgo, setQuitYearsAgo] = useState(existingTobacco.quitYearsAgo?.toString() || '');
  const [quitMotivation, setQuitMotivation] = useState(existingTobacco.quitMotivation || '');
  const [alcoholUse, setAlcoholUse] = useState(existingTobacco.alcoholUse || 'none');
  const [activityLevel, setActivityLevel] = useState(existingTobacco.physicalActivityLevel || 'moderate');
  const [isSaved, setIsSaved] = useState(false);

  const [activeTab, setActiveTab] = useState<'tobacco' | 'smokeless' | 'lifestyle' | 'timeline'>('tobacco');

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedRisk: TobaccoRiskProfile = {
      status,
      smokingType: smokingType.trim() || undefined,
      smokelessType: smokelessType.trim() || undefined,
      durationYears: durationYears ? Number(durationYears) : undefined,
      frequencyPerDay: frequencyPerDay.trim() || undefined,
      quitYearsAgo: quitYearsAgo ? Number(quitYearsAgo) : undefined,
      quitMotivation: quitMotivation.trim() || undefined,
      alcoholUse,
      physicalActivityLevel: activityLevel,
    };

    savePatient({
      ...patient,
      tobaccoRisk: updatedRisk,
      updatedAt: new Date().toISOString(),
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
    onRefresh();
  };

  // Timeline milestones of cessation recovery
  const cessationMilestones = [
    {
      time: '20 Minutes',
      benefit: 'Heart rate and blood pressure drop back toward baseline resting levels.',
      category: 'Cardiovascular',
      achieved: status === 'former_smoker' || status === 'former_smokeless' || status === 'never',
    },
    {
      time: '12 Hours',
      benefit: 'Carbon monoxide level in the bloodstream drops to normal, improving oxygenation.',
      category: 'Respiratory',
      achieved: status === 'former_smoker' || status === 'former_smokeless' || status === 'never',
    },
    {
      time: '2 Weeks - 3 Months',
      benefit: 'Circulation improves; lung function capacity begins measurable increase.',
      category: 'Cardiovascular',
      achieved: (status.includes('former') && Number(quitYearsAgo) >= 0.25) || status === 'never',
    },
    {
      time: '1 - 9 Months',
      benefit: 'Persistent coughing, sinus congestion, and shortness of breath decrease; bronchial cilia recover.',
      category: 'Respiratory',
      achieved: (status.includes('former') && Number(quitYearsAgo) >= 0.75) || status === 'never',
    },
    {
      time: '1 Year',
      benefit: 'Excess risk of coronary heart disease drops by 50% compared to a continuing user.',
      category: 'Cardiovascular',
      achieved: (status.includes('former') && Number(quitYearsAgo) >= 1) || status === 'never',
    },
    {
      time: '5 Years',
      benefit: 'Oral cavity, throat, and esophagus cancer risks are cut by half; stroke risk approaches non-smoker.',
      category: 'Oncology',
      achieved: (status.includes('former') && Number(quitYearsAgo) >= 5) || status === 'never',
    },
    {
      time: '10 Years',
      benefit: 'Risk of lung cancer death is approximately half that of a continuing smoker.',
      category: 'Oncology',
      achieved: (status.includes('former') && Number(quitYearsAgo) >= 10) || status === 'never',
    },
    {
      time: '15 Years',
      benefit: 'Coronary heart disease risk is roughly identical to someone who never used tobacco.',
      category: 'Cardiovascular',
      achieved: (status.includes('former') && Number(quitYearsAgo) >= 15) || status === 'never',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-rose-600 text-white rounded-xl shadow-xs">
              <Flame className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Health Risks & Prevention
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Understand the relationship between preventable exposures (smoking, smokeless tobacco, lifestyle) and disease risks.
          </p>
        </div>

        <button
          onClick={onOpenSummary}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold text-xs rounded-xl shadow-xs hover:from-teal-700 hover:to-cyan-700 transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          Include in Doctor Summary
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {(
          [
            { id: 'tobacco', label: 'Tobacco Assessment & Smoking' },
            { id: 'timeline', label: 'Quitting Benefits Timeline' },
            { id: 'smokeless', label: 'Smokeless Tobacco & Oral Health' },
            { id: 'lifestyle', label: 'Alcohol & Physical Activity' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === t.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Tobacco Assessment Form */}
      {activeTab === 'tobacco' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form
            onSubmit={handleSaveAssessment}
            className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-600" />
                Tobacco Use Questionnaire (Confidential)
              </h2>
              <span className="text-[11px] text-slate-400">Optional Health Metric</span>
            </div>

            {/* Status Question */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Do you currently or have you previously used tobacco?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(
                  [
                    { id: 'never', label: 'Never Used' },
                    { id: 'current_smoker', label: 'Current Smoker (Bidi/Cig)' },
                    { id: 'current_smokeless', label: 'Current Smokeless (Gutkha/Khaini)' },
                    { id: 'current_both', label: 'Current (Both Forms)' },
                    { id: 'former_smoker', label: 'Former Smoker (Quit)' },
                    { id: 'former_smokeless', label: 'Former Smokeless (Quit)' },
                  ] as const
                ).map((opt) => (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setStatus(opt.id)}
                    className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                      status === opt.id
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {status !== 'never' && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Type of Smoking Tobacco
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bidi, Cigarettes, Hookah, Chillam"
                      value={smokingType}
                      onChange={(e) => setSmokingType(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Type of Smokeless Tobacco
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Gutkha, Khaini, Zarda, Paan Masala with tobacco"
                      value={smokelessType}
                      onChange={(e) => setSmokelessType(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Total Years of Tobacco Use
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="80"
                      placeholder="e.g. 5"
                      value={durationYears}
                      onChange={(e) => setDurationYears(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Approximate Daily Frequency / Quantity
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 4-5 bidis/day, 2 packets gutkha/day"
                      value={frequencyPerDay}
                      onChange={(e) => setFrequencyPerDay(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {status.includes('former') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-950 mb-1">
                        How many years ago did you quit?
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="e.g. 4"
                        value={quitYearsAgo}
                        onChange={(e) => setQuitYearsAgo(e.target.value)}
                        className="w-full px-3 py-1.5 border border-emerald-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-emerald-950 mb-1">
                        Motivation / Reason for Quitting
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Family, breathing improvements"
                        value={quitMotivation}
                        onChange={(e) => setQuitMotivation(e.target.value)}
                        className="w-full px-3 py-1.5 border border-emerald-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {isSaved ? (
                <span className="text-xs font-bold text-teal-700">✓ Tobacco profile updated!</span>
              ) : (
                <span className="text-[11px] text-slate-400">Recorded for clinical preparation only</span>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                Save Assessment
              </button>
            </div>
          </form>

          {/* Comparative Relative Risk Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              Evidence-Based Relative Health Risks
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Comparison of elevated health risks from regular tobacco exposure versus non-users:
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Oral & Head/Neck Cancer</span>
                  <span className="text-rose-600 font-bold">4.5x - 7x Risk</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-rose-600 h-2.5 rounded-full" style={{ width: '85%' }} />
                </div>
                <span className="text-[10px] text-slate-400">Significantly amplified with smokeless tobacco (Gutkha / Khaini).</span>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Cardiovascular Disease (Heart Attack)</span>
                  <span className="text-amber-600 font-bold">2.5x - 3x Risk</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Chronic Lung Disease (COPD)</span>
                  <span className="text-blue-600 font-bold">3x - 5x Risk</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Stroke & Cerebrovascular Attack</span>
                  <span className="text-purple-600 font-bold">2x Risk</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '50%' }} />
                </div>
              </div>
            </div>

            <div className="p-3 bg-teal-50 rounded-xl text-teal-950 text-[11px] leading-relaxed border border-teal-100">
              <strong>Encouraging Clinical Evidence:</strong> Stopping tobacco at any age halts progressive airway damage and initiates measurable cardiovascular recovery within 24 hours.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Quitting Benefits Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              Body Recovery Timeline After Quitting Tobacco
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Physiological milestones demonstrating how your body heals after stopping tobacco use:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cessationMilestones.map((milestone, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all ${
                  milestone.achieved
                    ? 'bg-teal-50/70 border-teal-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    {milestone.time}
                    {milestone.achieved && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-600 text-white">
                        ✓ Milestone Reached
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {milestone.category}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {milestone.benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Smokeless Tobacco & Oral Health */}
      {activeTab === 'smokeless' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Smokeless Tobacco Risks & Oral Screening Signs
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Smokeless forms such as Gutkha, Khaini, and Zarda are widely prevalent in Rajasthan and Northern India and require targeted awareness:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
              <h3 className="font-bold text-amber-950 text-sm">Oral Submucous Fibrosis (OSF)</h3>
              <p className="text-xs text-amber-900 leading-relaxed">
                Caused by areca nut (supari) and smokeless tobacco. Leads to progressive stiffness of the cheek mucosa and restricted mouth opening (inability to insert 3 fingers into mouth).
              </p>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded block w-fit">
                Pre-cancerous condition
              </span>
            </div>

            <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200 space-y-2">
              <h3 className="font-bold text-rose-950 text-sm">Leukoplakia & Erythroplakia</h3>
              <p className="text-xs text-rose-900 leading-relaxed">
                Persistent white patches (Leukoplakia) or velvety red patches (Erythroplakia) in the oral cavity, tongue, or gums that cannot be wiped away with gauze.
              </p>
              <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded block w-fit">
                Requires Doctor Inspection
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Nicotine Dependency Support</h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Nicotine replacement therapies (chewing gums, transdermal patches) and behavioral counseling significantly improve cessation success rates over abrupt cold turkey.
              </p>
              <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded block w-fit">
                Consult Physician / NRT
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Lifestyle (Alcohol & Inactivity) */}
      {activeTab === 'lifestyle' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Alcohol, Sedentary Habits & Cardiovascular Health
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Multi-factorial lifestyle factors that influence your long-term health trajectory:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Physical Inactivity & Prolonged Sitting</h3>
              <p className="text-slate-600 leading-relaxed">
                Over 6–8 hours of daily sedentary time without physical breaks is correlated with elevated fasting glucose, hypertension, and reduced HDL cholesterol.
              </p>
              <div className="text-[11px] font-semibold text-teal-800 bg-teal-50 p-2 rounded-lg">
                Recommended: 150 minutes of moderate activity (e.g. brisk walking) weekly.
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Alcohol Intake</h3>
              <p className="text-slate-600 leading-relaxed">
                Regular heavy alcohol consumption elevates blood pressure, liver enzyme markers, and interferes with antibiotic efficacy and gastric mucosa healing.
              </p>
              <div className="text-[11px] font-semibold text-slate-800 bg-slate-100 p-2 rounded-lg">
                Always disclose accurate alcohol consumption to your prescribing physician.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Preparation Box */}
      <div className="bg-gradient-to-r from-slate-900 to-teal-950 text-white p-6 rounded-3xl shadow-sm space-y-3">
        <h3 className="font-bold text-base flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-400" />
          Questions to Ask Your Doctor Regarding Health Risks:
        </h3>
        <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1.5 leading-relaxed">
          <li>"Based on my history of tobacco exposure, should I have an oral cavity inspection or chest spirometry?"</li>
          <li>"What medically guided cessation support (such as Nicotine Replacement Therapy) is safest for me?"</li>
          <li>"Are any of my current symptoms related to past or present smoke/gutkha exposure?"</li>
          <li>"What specific exercise benchmarks are safe for my current cardiovascular state?"</li>
        </ul>
      </div>
    </div>
  );
};
