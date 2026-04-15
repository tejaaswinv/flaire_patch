import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Brain,
  Heart,
  Moon,
  Pill,
  Settings,
  Share2,
  UserRound,
  Users,
  X,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Dialog, DialogContent } from './ui/dialog';

interface DashboardOverviewProps {
  onNavigate: (tab: string) => void;
  onEnableFlareMode: () => void;
}

interface DashboardData {
  hasCheckedIn: boolean;
  isFlareDay: boolean;
  todayStatus?: {
    energy?: string;
    pain?: string;
    flare?: boolean;
    message?: string;
  };
}

interface InsightData {
  summary?: {
    totalSymptoms?: number;
    totalMedications?: number;
    totalMeals?: number;
    latestPain?: number | null;
    latestEnergy?: number | null;
    averageSymptomSeverity?: string | null;
    flareRisk?: string;
  };
  tips?: string[];
}

interface SymptomItem {
  id: string;
  name: string;
  severity: number;
  triggers: string[];
  notes: string;
  bodyAreas?: string[];
  date: string;
}

interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string[];
  taken: boolean[];
  notes: string;
}

type CheckinTab = 'daily' | 'settings';

type TrackingOption = {
  id: string;
  icon: string;
  name: string;
  input: string;
  enabled: boolean;
};

function todayText() {
  const d = new Date();
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function bubbles(values: number[], color: string) {
  return (
    <div className="flex items-end gap-1.5 mt-6">
      {values.map((v, i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: 18,
            height: 12 + v * 4,
            backgroundColor: color,
            opacity: 0.9,
          }}
        />
      ))}
    </div>
  );
}

function cardWrap(children: React.ReactNode, className = '') {
  return (
    <div className={`rounded-[28px] bg-white border border-[#D9D9DE] shadow-sm ${className}`}>
      {children}
    </div>
  );
}

const energyOptions = [
  { label: 'Exhausted', emoji: '😴', value: 2 },
  { label: 'Tired', emoji: '😪', value: 4 },
  { label: 'Okay', emoji: '😐', value: 6 },
  { label: 'Good', emoji: '🙂', value: 8 },
  { label: 'Energized', emoji: '⚡', value: 10 },
];

const moodOptions = [
  { label: 'Very Low', emoji: '😭', value: 2 },
  { label: 'Low', emoji: '☹️', value: 4 },
  { label: 'Okay', emoji: '😐', value: 6 },
  { label: 'Good', emoji: '🙂', value: 8 },
  { label: 'Great', emoji: '😁', value: 10 },
];

const defaultTracking: TrackingOption[] = [
  { id: 'water', icon: '💧', name: 'Water Intake', input: 'Input: Slider (0-12)', enabled: false },
  { id: 'stress', icon: '🧠', name: 'Stress Level', input: 'Input: Slider (0-10)', enabled: false },
  { id: 'sleep', icon: '🌙', name: 'Sleep Quality', input: 'Input: Emoji', enabled: false },
  { id: 'period', icon: '🩸', name: 'Period', input: 'Input: Yes/No', enabled: false },
  { id: 'exercise', icon: '🏃', name: 'Exercise', input: 'Input: Yes/No', enabled: false },
  { id: 'meditation', icon: '🧘', name: 'Meditation', input: 'Input: Yes/No', enabled: false },
];

export function DashboardOverview({
  onNavigate,
  onEnableFlareMode,
}: DashboardOverviewProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [insightsData, setInsightsData] = useState<InsightData | null>(null);
  const [symptoms, setSymptoms] = useState<SymptomItem[]>([]);
  const [medications, setMedications] = useState<MedicationItem[]>([]);

  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [checkinTab, setCheckinTab] = useState<CheckinTab>('daily');
  const [checkinStep, setCheckinStep] = useState(0);

  const [trackingOptions, setTrackingOptions] = useState<TrackingOption[]>(defaultTracking);

  const [energy, setEnergy] = useState(6);
  const [pain, setPain] = useState(5);
  const [mood, setMood] = useState(6);
  const [notes, setNotes] = useState('');

  const loadAll = async () => {
    try {
      const [dashboardRes, insightsRes, symptomsRes, medsRes] = await Promise.all([
        api.getDashboardToday(),
        api.getInsights(),
        api.getSymptoms(),
        api.getMedications(),
      ]);

      setDashboardData(dashboardRes);
      setInsightsData(insightsRes);
      setSymptoms(Array.isArray(symptomsRes) ? symptomsRes : []);
      setMedications(Array.isArray(medsRes) ? medsRes : []);
    } catch (err) {
      console.error('Failed to load dashboard overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const painLocations = useMemo(() => {
    const areas = symptoms.flatMap((s) => s.bodyAreas || []);
    return Array.from(new Set(areas)).slice(0, 3);
  }, [symptoms]);

  const takenCount = useMemo(() => {
    return medications.filter((m) => m.taken?.some(Boolean)).length;
  }, [medications]);

  const flareActive =
    dashboardData?.todayStatus?.flare ||
    (dashboardData?.todayStatus?.pain
      ? Number(dashboardData.todayStatus.pain) >= 7
      : false);

  const energyVal = Number(dashboardData?.todayStatus?.energy ?? 6);
  const painVal = Number(dashboardData?.todayStatus?.pain ?? 5);

  const openCheckin = () => {
    setCheckinTab('daily');
    setCheckinStep(0);
    setShowCheckinModal(true);
  };

  const closeCheckin = () => {
    setShowCheckinModal(false);
  };

  const nextStep = async () => {
    if (checkinStep < 3) {
      setCheckinStep((s) => s + 1);
      return;
    }

    try {
      setSaving(true);
      await api.saveCheckIn({
        energy,
        pain,
        mood,
        notes,
        additionalData: {
          tracking: trackingOptions.filter((t) => t.enabled).map((t) => t.id),
        },
      });
      await loadAll();
      closeCheckin();
    } catch (err) {
      console.error('Failed to save check-in:', err);
      alert('Failed to save check-in');
    } finally {
      setSaving(false);
    }
  };

  const previousStep = () => {
    if (checkinStep > 0) {
      setCheckinStep((s) => s - 1);
    }
  };

  const stepDots = (
    <div className="flex items-center justify-center gap-3 mt-5">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-full transition-all"
          style={{
            width: i === checkinStep ? 56 : 14,
            height: 14,
            backgroundColor: i === checkinStep ? '#7697C1' : '#D9D9DE',
          }}
        />
      ))}
    </div>
  );

  const dailyStepContent = () => {
    if (checkinStep === 0) {
      return (
        <div className="pt-6 pb-2 w-full">
          <h2 className="text-[34px] font-semibold text-[#2F455D] text-center mt-2 leading-none">
            How’s your energy?
          </h2>
          <p className="text-[15px] text-[#6E7384] text-center mt-4">
            Select how you're feeling
          </p>

          <div className="flex justify-center gap-3 mt-7 flex-wrap px-4">
            {energyOptions.map((option) => {
              const active = energy === option.value;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setEnergy(option.value)}
                  className="rounded-[20px] w-[92px] h-[112px] flex flex-col items-center justify-center text-center transition shadow-sm"
                  style={{
                    backgroundColor: active ? '#7697C1' : '#FFFFFF',
                    color: active ? '#FFFFFF' : '#2F455D',
                  }}
                >
                  <div className="text-[30px] mb-2">{option.emoji}</div>
                  <div className="text-[11px] font-semibold leading-tight px-2">
                    {option.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (checkinStep === 1) {
      return (
        <div className="pt-6 pb-2 w-full">
          <h2 className="text-[34px] font-semibold text-[#2F455D] text-center mt-2 leading-none">
            Pain level?
          </h2>
          <p className="text-[14px] text-[#6E7384] text-center mt-4">
            0 is no pain, 10 is worst pain
          </p>

          <div className="max-w-[540px] mx-auto mt-8 px-2">
            <div className="text-center text-[64px] font-semibold text-[#F4A000] mb-3 leading-none">
              {pain}
            </div>

            <input
              type="range"
              min="0"
              max="10"
              value={pain}
              onChange={(e) => setPain(Number(e.target.value))}
              className="w-full"
            />

            <div className="flex justify-between text-[14px] text-[#6E7384] mt-4">
              <span>0 - No pain</span>
              <span>10 - Worst pain</span>
            </div>
          </div>
        </div>
      );
    }

    if (checkinStep === 2) {
      return (
        <div className="pt-6 pb-2 w-full">
          <h2 className="text-[34px] font-semibold text-[#2F455D] text-center mt-2 leading-none">
            How’s your mood?
          </h2>
          <p className="text-[15px] text-[#6E7384] text-center mt-4">
            Select how you feel emotionally
          </p>

          <div className="flex justify-center gap-3 mt-7 flex-wrap px-4">
            {moodOptions.map((option) => {
              const active = mood === option.value;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setMood(option.value)}
                  className="rounded-[20px] w-[92px] h-[112px] flex flex-col items-center justify-center text-center transition shadow-sm"
                  style={{
                    backgroundColor: active ? '#7697C1' : '#FFFFFF',
                    color: active ? '#FFFFFF' : '#2F455D',
                  }}
                >
                  <div className="text-[30px] mb-2">{option.emoji}</div>
                  <div className="text-[11px] font-semibold leading-tight px-2">
                    {option.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="pt-6 pb-2 w-full">
        <h2 className="text-[36px] font-semibold text-[#2F455D] text-center mt-4 leading-none">
          Any notes?
        </h2>
        <p className="text-[15px] text-[#6E7384] text-center mt-5">
          Optional - add anything you'd like to remember
        </p>

        <div className="max-w-[510px] mx-auto mt-6">
          <div className="flex gap-2 mb-4 flex-wrap">
            <span className="rounded-full border px-3 py-1 text-[13px] font-medium bg-[#D9D9F7] text-[#4A5570]">
              3/4 meds taken
            </span>
            <span className="rounded-full border px-3 py-1 text-[13px] font-medium bg-[#F3F0C9] text-[#4A5570]">
              2 meals logged
            </span>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How are you feeling today? Any observations..."
            className="w-full min-h-[74px] rounded-[14px] border border-[#D9D9DE] px-4 py-3 bg-white text-[14px]"
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="p-4">Loading dashboard...</div>;
  }

  return (
    <>
      <div className="space-y-8">
        {cardWrap(
          <div className="px-8 py-8 text-center border border-[#F0A5A0] rounded-[28px]">
            <h2 className="text-[18px] font-semibold text-[#36495F]">Today</h2>
            <p className="text-[15px] text-[#6B7280] mt-1">{todayText()}</p>
            <p className="text-[24px] text-[#36495F] mt-8 font-medium">
              {dashboardData?.todayStatus?.message || 'Hey there!'}
            </p>
          </div>
        )}

        {cardWrap(
          <div className="px-8 py-8 border border-[#78A1CC] rounded-[28px]">
            <div className="text-center">
              <h3 className="text-[18px] font-semibold text-[#36495F]">Quick check-in</h3>
              <p className="text-[15px] text-[#6B7280] mt-6">Takes seconds</p>
            </div>

            <button
              type="button"
              onClick={openCheckin}
              className="w-full h-[54px] rounded-[16px] text-white text-[18px] font-semibold mt-6"
              style={{ backgroundColor: '#7697C1' }}
            >
              Quick check-in
            </button>
          </div>
        )}

        {cardWrap(
          <div
            className="px-8 py-8 rounded-[28px]"
            style={{ backgroundColor: '#FFF7F7', border: '1px solid #F0A5A0' }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                style={{ backgroundColor: '#E8A5AE' }}
              >
                <Activity className="h-6 w-6 text-white" />
              </div>

              <div className="flex-1">
                <h3 className="text-[18px] font-semibold text-[#36495F]">
                  {flareActive ? "You're currently in a flare" : 'Flare status looks calm'}
                </h3>
                <p className="text-[15px] text-[#6B7280] mt-2">
                  {flareActive ? 'Flare started recently' : 'No strong flare signs right now'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => onNavigate('symptoms')}
                    className="h-[48px] rounded-[14px] text-[16px] font-semibold text-[#36495F]"
                    style={{ backgroundColor: '#C6A7CF' }}
                  >
                    Log flare symptoms
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('insights')}
                    className="h-[48px] rounded-[14px] text-[16px] font-semibold text-[#36495F]"
                    style={{ backgroundColor: '#C6A7CF' }}
                  >
                    View patterns
                  </button>

                  <button
                    type="button"
                    onClick={onEnableFlareMode}
                    className="h-[48px] rounded-[14px] text-[16px] font-semibold text-white"
                    style={{ backgroundColor: '#E39A9F' }}
                  >
                    Enable flare day mode
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-[18px] font-semibold text-[#36495F] mb-5">Last 7 days</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {cardWrap(
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-[10px] flex items-center justify-center"
                      style={{ backgroundColor: '#A8D5D0' }}
                    >
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-[18px] font-medium text-[#36495F]">Energy</span>
                  </div>
                  <span className="text-green-500 text-lg">↗</span>
                </div>
                {bubbles([2, 3, 2, 4, 3, energyVal, 4], '#B8D8D5')}
              </div>
            )}

            {cardWrap(
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-[10px] flex items-center justify-center"
                      style={{ backgroundColor: '#E8A5AE' }}
                    >
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-[18px] font-medium text-[#36495F]">Pain</span>
                  </div>
                  <span className="text-orange-400 text-lg">↘</span>
                </div>
                {bubbles([painVal, 5, 4, 5, 4, 3, 4], '#EDBDC2')}
              </div>
            )}

            {cardWrap(
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-[10px] flex items-center justify-center"
                      style={{ backgroundColor: '#B990CC' }}
                    >
                      <Moon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-[18px] font-medium text-[#36495F]">Sleep</span>
                  </div>
                </div>
                {bubbles([3, 4, 2, 5, 4, 4, 3], '#CDB7DA')}
              </div>
            )}

            {cardWrap(
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-[10px] flex items-center justify-center"
                      style={{ backgroundColor: '#86A3C8' }}
                    >
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-[18px] font-medium text-[#36495F]">Stress</span>
                  </div>
                  <span className="text-orange-400 text-lg">↘</span>
                </div>
                {bubbles([5, 4, 4, 3, 3, 2, 3], '#A8BBD4')}
              </div>
            )}
          </div>
        </div>

        {cardWrap(
          <div className="p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <UserRound className="h-6 w-6 text-[#7697C1]" />
                  <h3 className="text-[18px] font-semibold text-[#36495F]">
                    Pain locations this week
                  </h3>
                </div>

                <div className="flex flex-wrap gap-3 mb-5">
                  {(painLocations.length ? painLocations : ['Left knee', 'Right hand', 'Lower back']).map(
                    (item) => (
                      <span
                        key={item}
                        className="rounded-full border px-4 py-2 text-[14px] font-medium"
                        style={{ borderColor: '#F0A5A0', color: '#E39A9F' }}
                      >
                        {item}
                      </span>
                    )
                  )}
                </div>

                <p className="text-[15px] text-[#6B7280]">Tap to see detailed body map</p>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('symptoms')}
                className="h-[54px] min-w-[124px] px-6 rounded-[16px] text-[18px] font-semibold text-[#36495F]"
                style={{ backgroundColor: '#C6A7CF' }}
              >
                View map
              </button>
            </div>
          </div>
        )}

        {cardWrap(
          <div className="p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <Pill className="h-6 w-6 text-[#C6A7CF]" />
                  <h3 className="text-[18px] font-semibold text-[#36495F]">Medications</h3>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full border-2 border-green-500 flex items-center justify-center mt-0.5">
                    <span className="text-green-500 font-bold">✓</span>
                  </div>

                  <div>
                    <p className="text-[18px] font-medium text-[#36495F]">Taken today ✓</p>
                    <p className="text-[15px] text-[#6B7280] mt-2">
                      {takenCount} of {medications.length || 4} medications logged
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('medications')}
                className="h-[54px] min-w-[124px] px-6 rounded-[16px] text-[18px] font-semibold text-[#36495F]"
                style={{ backgroundColor: '#C6A7CF' }}
              >
                Log meds
              </button>
            </div>
          </div>
        )}

        <div
          className="rounded-[28px] border border-[#DDD8E4] p-8"
          style={{ backgroundColor: '#F4EEF8' }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Heart className="h-6 w-6 text-[#B990CC]" />
            <h3 className="text-[18px] font-semibold text-[#36495F]">Patterns & Insights</h3>
          </div>

          <div className="space-y-5">
            {(insightsData?.tips?.length
              ? insightsData.tips.slice(0, 3).map((tip, i) => ({
                  title: tip,
                  subtitle: i === 0 ? 'Strong pattern' : i === 1 ? 'Moderate pattern' : 'Strong pattern',
                }))
              : [
                  { title: 'Flares often follow poor sleep', subtitle: 'Strong pattern' },
                  { title: 'Pain is higher on high-stress days', subtitle: 'Moderate pattern' },
                  { title: 'Energy improves when meds are taken consistently', subtitle: 'Strong pattern' },
                ]
            ).map((item) => (
              <div key={item.title} className="rounded-[22px] border border-[#D9D9DE] bg-white p-6">
                <p className="text-[18px] font-semibold text-[#36495F]">{item.title}</p>
                <p className="text-[15px] text-[#6B7280] mt-2">{item.subtitle}</p>
              </div>
            ))}

            <button
              type="button"
              onClick={() => onNavigate('insights')}
              className="w-full h-[62px] rounded-[18px] text-[20px] font-medium text-[#36495F]"
              style={{ backgroundColor: '#C6A7CF' }}
            >
              View details
            </button>
          </div>
        </div>

        {cardWrap(
          <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <Heart className="h-6 w-6 text-[#7697C1]" />
              <h3 className="text-[18px] font-semibold text-[#36495F]">Support</h3>
            </div>

            <div className="flex flex-col md:flex-row gap-5">
              <button
                type="button"
                className="h-[62px] px-8 rounded-[18px] text-[20px] font-medium text-[#36495F] flex items-center justify-center gap-4"
                style={{ backgroundColor: '#C6A7CF' }}
              >
                <Share2 className="h-5 w-5" />
                Share with doctor
              </button>

              <button
                type="button"
                className="h-[62px] px-8 rounded-[18px] text-[20px] font-medium text-[#36495F] flex items-center justify-center gap-4"
                style={{ backgroundColor: '#C6A7CF' }}
              >
                <Users className="h-5 w-5" />
                Caregiver access
              </button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showCheckinModal} onOpenChange={setShowCheckinModal}>
        <DialogContent className="!max-w-[680px] !w-[94vw] !h-[500px] !rounded-[36px] !p-0 !bg-[#D1B0D7] !border-none overflow-hidden">
          <div className="w-full h-full px-[30px] py-[26px] relative flex flex-col">
            <button
              type="button"
              onClick={closeCheckin}
              className="absolute right-7 top-7 text-[#36495F]"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex justify-center">
              <div className="bg-white/40 rounded-full p-1.5 flex gap-1.5 max-w-[560px] w-full">
                <button
                  type="button"
                  onClick={() => setCheckinTab('daily')}
                  className={`flex-1 h-[42px] rounded-full text-[15px] font-semibold flex items-center justify-center gap-2 ${
                    checkinTab === 'daily' ? 'bg-white text-[#36495F]' : 'text-[#36495F]'
                  }`}
                >
                  Daily Check-in
                </button>

                <button
                  type="button"
                  onClick={() => setCheckinTab('settings')}
                  className={`flex-1 h-[42px] rounded-full text-[15px] font-semibold flex items-center justify-center gap-2 ${
                    checkinTab === 'settings' ? 'bg-white text-[#36495F]' : 'text-[#36495F]'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              </div>
            </div>

            {checkinTab === 'daily' ? (
              <div className="flex-1 flex flex-col justify-between min-h-0">
                <div className="flex-1 flex flex-col items-center justify-center px-2">
                  {dailyStepContent()}
                </div>

                {stepDots}

                <div className="w-full max-w-[510px] mx-auto mt-4 flex gap-3 pb-0">
                  {checkinStep > 0 ? (
                    <button
                      type="button"
                      onClick={previousStep}
                      className="flex-1 h-[40px] rounded-[12px] text-[#36495F] text-[14px] font-semibold flex items-center justify-center gap-2 border border-[#C7AECF]"
                    >
                      <span className="text-[18px] leading-none">‹</span>
                      Back
                    </button>
                  ) : (
                    <div className="flex-1" />
                  )}

                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={saving}
                    className="flex-1 h-[40px] rounded-[12px] text-white text-[14px] font-semibold flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#7697C1' }}
                  >
                    {saving ? 'Saving...' : checkinStep === 3 ? 'Complete' : 'Continue'}
                    {checkinStep !== 3 && <ChevronRight className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-1 mt-4 space-y-4 pb-6 pr-2 min-h-0 [scrollbar-width:thin]">
                <h2 className="text-[26px] font-semibold text-[#2F455D] text-center mt-2 leading-none">
                  Customize Your Tracking
                </h2>
                <p className="text-[14px] text-[#6E7384] text-center mt-3">
                  Choose what you want to track in your daily check-in
                </p>

                <div className="max-w-[530px] mx-auto mt-6 space-y-4">
                  {trackingOptions.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[18px] px-5 py-4 flex items-center justify-between"
                      style={{ backgroundColor: '#D8BEDD' }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-[28px]">{item.icon}</div>
                        <div>
                          <div className="text-[15px] font-semibold text-[#2F455D]">
                            {item.name}
                          </div>
                          <div className="text-[12px] text-[#6E7384] mt-1">{item.input}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setTrackingOptions((prev) =>
                            prev.map((opt) =>
                              opt.id === item.id ? { ...opt, enabled: !opt.enabled } : opt
                            )
                          )
                        }
                        className="w-[58px] h-[32px] rounded-full relative transition"
                        style={{ backgroundColor: item.enabled ? '#7697C1' : '#D9D9DE' }}
                      >
                        <span
                          className="absolute top-[3px] w-[26px] h-[26px] rounded-full bg-white transition"
                          style={{ left: item.enabled ? 29 : 3 }}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}