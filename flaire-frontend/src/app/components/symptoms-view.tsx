import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Plus, UserRound, X } from 'lucide-react';
import { api } from '../../lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Symptom {
  id: string;
  name: string;
  severity: number;
  triggers: string[];
  notes: string;
  bodyAreas: string[];
  date: string;
}

type Mode = 'tracker' | 'bodymap';
type BodyView = 'front' | 'side' | 'back';

const BODY_POINTS: Array<{
  id: string;
  label: string;
  x: string;
  y: string;
}> = [
  { id: 'head', label: 'Head', x: '50%', y: '8%' },
  { id: 'left-shoulder', label: 'Left Shoulder', x: '38%', y: '15%' },
  { id: 'right-shoulder', label: 'Right Shoulder', x: '62%', y: '15%' },
  { id: 'chest', label: 'Chest', x: '50%', y: '22%' },
  { id: 'left-arm', label: 'Left Arm', x: '28%', y: '22%' },
  { id: 'right-arm', label: 'Right Arm', x: '72%', y: '22%' },
  { id: 'abdomen', label: 'Abdomen', x: '50%', y: '35%' },
  { id: 'pelvis', label: 'Pelvis', x: '50%', y: '48%' },
  { id: 'left-hand', label: 'Left Hand', x: '20%', y: '36%' },
  { id: 'right-hand', label: 'Right Hand', x: '80%', y: '36%' },
  { id: 'left-thigh', label: 'Left Thigh', x: '42%', y: '62%' },
  { id: 'right-thigh', label: 'Right Thigh', x: '58%', y: '62%' },
  { id: 'left-knee', label: 'Left Knee', x: '42%', y: '78%' },
  { id: 'right-knee', label: 'Right Knee', x: '58%', y: '78%' },
  { id: 'left-foot', label: 'Left Foot', x: '42%', y: '92%' },
  { id: 'right-foot', label: 'Right Foot', x: '58%', y: '92%' },
  { id: 'left-fingers', label: 'left-fingers', x: '16%', y: '44%' },
  { id: 'right-fingers', label: 'right-fingers', x: '84%', y: '44%' },
];

const COMMON_TRIGGERS = ['Cold Weather', 'Stress', 'Pain', 'Swelling', 'Stiffness'];

function severityColor(severity: number) {
  if (severity <= 3) return '#A8D5D0';
  if (severity <= 7) return '#F4A000';
  return '#E8A5AE';
}

function formatDate(date: string) {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const sec = String(d.getSeconds()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy}, ${hh}:${min}:${sec}`;
}

export function SymptomsView() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState<Mode>('tracker');
  const [bodyView, setBodyView] = useState<BodyView>('front');
  const [showAddForm, setShowAddForm] = useState(false);

  const [name, setName] = useState('');
  const [severity, setSeverity] = useState(7);
  const [notes, setNotes] = useState('');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [selectedBodyAreas, setSelectedBodyAreas] = useState<string[]>([]);

  const loadSymptoms = async () => {
    try {
      const res = await api.getSymptoms();
      setSymptoms(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load symptoms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSymptoms();
  }, []);

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(trigger) ? prev.filter((t) => t !== trigger) : [...prev, trigger]
    );
  };

  const toggleBodyArea = (area: string) => {
    setSelectedBodyAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const resetForm = () => {
    setName('');
    setSeverity(7);
    setNotes('');
    setSelectedTriggers([]);
    setSelectedBodyAreas([]);
    setShowAddForm(false);
  };

  const handleAddSymptom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const created = await api.createSymptom({
        name,
        severity,
        triggers: selectedTriggers,
        notes,
        bodyAreas: selectedBodyAreas,
      });

      setSymptoms((prev) => [created, ...prev]);
      resetForm();
    } catch (err) {
      console.error('Failed to create symptom:', err);
      alert('Failed to add symptom');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteSymptom(id);
      setSymptoms((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Failed to delete symptom:', err);
      alert('Failed to delete symptom');
    }
  };

  const mappedDots = useMemo(() => {
    const activeAreas = new Map<string, number>();

    symptoms.forEach((symptom) => {
      symptom.bodyAreas?.forEach((area) => {
        const existing = activeAreas.get(area) ?? 0;
        activeAreas.set(area, Math.max(existing, symptom.severity));
      });
    });

    return BODY_POINTS.map((point) => ({
      ...point,
      activeSeverity: activeAreas.get(point.id) ?? activeAreas.get(point.label) ?? 0,
    }));
  }, [symptoms]);

  if (loading) {
    return <div className="p-4">Loading symptoms...</div>;
  }

  return (
    <div
      className="rounded-[28px] p-5 md:p-6"
      style={{ backgroundColor: '#CDB2D5' }}
    >
      <div className="space-y-4">
        <div className="rounded-full p-1 flex gap-1" style={{ backgroundColor: '#DECFE2' }}>
          <button
            type="button"
            onClick={() => setMode('tracker')}
            className={`flex-1 rounded-full h-12 px-4 flex items-center justify-center gap-3 text-[18px] font-semibold transition ${
              mode === 'tracker' ? 'bg-white shadow-sm' : 'bg-transparent'
            }`}
            style={{ color: '#36495F' }}
          >
            <Activity className="h-5 w-5" />
            Symptom Tracker
          </button>

          <button
            type="button"
            onClick={() => setMode('bodymap')}
            className={`flex-1 rounded-full h-12 px-4 flex items-center justify-center gap-3 text-[18px] font-semibold transition ${
              mode === 'bodymap' ? 'bg-white shadow-sm' : 'bg-transparent'
            }`}
            style={{ color: '#36495F' }}
          >
            <UserRound className="h-5 w-5" />
            Body Map
          </button>
        </div>

        {mode === 'tracker' ? (
          <div className="bg-white rounded-[24px] border border-[#E5E3E8] p-8 min-h-[620px]">
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <h2 className="text-[22px] font-semibold text-[#36495F]">Symptom Tracker</h2>
                <p className="text-[14px] text-[#6E7384] mt-1">
                  Log and track your daily symptoms
                </p>
              </div>

              <Button
                type="button"
                onClick={() => setShowAddForm((v) => !v)}
                className="h-12 rounded-[14px] px-6 text-[16px] font-semibold text-white shadow-none"
                style={{ backgroundColor: '#7697C1' }}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Symptom
              </Button>
            </div>

            {showAddForm && (
              <form
                onSubmit={handleAddSymptom}
                className="mb-8 rounded-[20px] border border-[#E5E3E8] bg-[#FBFBFC] p-6 space-y-5"
              >
                <div>
                  <label className="block text-sm mb-2 text-[#36495F] font-medium">
                    Symptom Name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Joint Pain"
                    className="h-11 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-[#36495F] font-medium">
                    Severity: {severity}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={severity}
                    onChange={(e) => setSeverity(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-[#36495F] font-medium">
                    Body Areas
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {BODY_POINTS.map((point) => {
                      const active = selectedBodyAreas.includes(point.id);
                      return (
                        <button
                          key={point.id}
                          type="button"
                          onClick={() => toggleBodyArea(point.id)}
                          className={`rounded-full border px-3 py-1.5 text-sm ${
                            active ? 'text-white border-transparent' : 'text-[#36495F] bg-white'
                          }`}
                          style={active ? { backgroundColor: '#7697C1' } : {}}
                        >
                          {point.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-[#36495F] font-medium">
                    Triggers
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_TRIGGERS.map((trigger) => {
                      const active = selectedTriggers.includes(trigger);
                      return (
                        <button
                          key={trigger}
                          type="button"
                          onClick={() => toggleTrigger(trigger)}
                          className={`rounded-full border px-3 py-1.5 text-sm ${
                            active ? 'text-white border-transparent' : 'text-[#36495F] bg-white'
                          }`}
                          style={active ? { backgroundColor: '#A8D5D0' } : {}}
                        >
                          {trigger}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 text-[#36495F] font-medium">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe how it feels..."
                    className="w-full min-h-[96px] rounded-xl border px-3 py-2"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="text-white"
                    style={{ backgroundColor: '#7697C1' }}
                  >
                    Save Symptom
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            <div>
              <h3 className="text-[18px] font-semibold text-[#36495F] mb-4">Recent Symptoms</h3>

              {symptoms.length === 0 ? (
                <div className="rounded-[20px] border border-[#E5E3E8] p-6 text-[#6E7384]">
                  No symptoms logged yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {symptoms.map((symptom) => (
                    <div
                      key={symptom.id}
                      className="rounded-[20px] border border-[#E5E3E8] p-5 relative"
                    >
                      <button
                        type="button"
                        onClick={() => handleDelete(symptom.id)}
                        className="absolute right-5 top-5 text-[#36495F]"
                      >
                        <X className="h-5 w-5" />
                      </button>

                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-[18px] font-semibold text-[#36495F]">
                          {symptom.name}
                        </h4>
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: severityColor(symptom.severity) }}
                        />
                        <span className="text-[15px] text-[#6E7384] font-medium">
                          {symptom.severity}/10
                        </span>
                      </div>

                      <p className="text-[14px] text-[#6E7384] mb-4">{formatDate(symptom.date)}</p>

                      {symptom.triggers?.length > 0 && (
                        <>
                          <p className="text-[16px] text-[#36495F] font-medium mb-2">Triggers:</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {symptom.triggers.map((trigger) => (
                              <span
                                key={trigger}
                                className="rounded-full border border-[#D8D9DF] px-3 py-1 text-[14px] text-[#36495F]"
                              >
                                {trigger}
                              </span>
                            ))}
                          </div>
                        </>
                      )}

                      {symptom.notes && (
                        <p className="text-[15px] text-[#6E7384]">{symptom.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[24px] border border-[#E5E3E8] p-8 min-h-[620px]">
            <div className="mb-8">
              <h2 className="text-[22px] font-semibold text-[#36495F]">Body Mapping</h2>
              <p className="text-[14px] text-[#6E7384] mt-1">
                Track where you experience symptoms - click on any body part
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-10">
              <div>
                <div className="flex gap-3 mb-6">
                  {(['front', 'side', 'back'] as BodyView[]).map((view) => (
                    <button
                      key={view}
                      type="button"
                      onClick={() => setBodyView(view)}
                      className={`h-12 px-6 rounded-[16px] text-[18px] font-semibold border transition ${
                        bodyView === view
                          ? 'text-white border-transparent'
                          : 'text-[#4E5C70] bg-white border-[#D9DCE4]'
                      }`}
                      style={bodyView === view ? { backgroundColor: '#7697C1' } : {}}
                    >
                      {view === 'front'
                        ? 'Front View'
                        : view === 'side'
                        ? 'Side View'
                        : 'Back View'}
                    </button>
                  ))}
                </div>

                <div className="relative h-[520px] rounded-[18px]">
                  <div className="absolute left-0 top-0 text-[18px] text-[#36495F] leading-[1.35]">
                    {bodyView === 'front'
                      ? 'front\nskeleton\nview'
                      : bodyView === 'side'
                      ? 'side\nskeleton\nview'
                      : 'back\nskeleton\nview'}
                  </div>

                  <div className="absolute left-[18%] right-[8%] top-[2%] bottom-[10%]">
                    {mappedDots.map((point) => {
                      const selected = selectedBodyAreas.includes(point.id);
                      const activeSeverity = point.activeSeverity;
                      const hasSaved = activeSeverity > 0;

                      return (
                        <button
                          key={point.id}
                          type="button"
                          title={point.label}
                          onClick={() => toggleBodyArea(point.id)}
                          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-md transition"
                          style={{
                            left: point.x,
                            top: point.y,
                            width: '24px',
                            height: '24px',
                            backgroundColor: selected
                              ? '#7697C1'
                              : hasSaved
                              ? severityColor(activeSeverity)
                              : '#7697C1',
                            opacity: hasSaved || selected ? 1 : 0.95,
                          }}
                        />
                      );
                    })}
                  </div>

                  <div className="absolute left-1/2 -translate-x-1/2 bottom-0 flex items-center gap-8 text-[18px] text-[#36495F]">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full inline-block" style={{ backgroundColor: '#A8D5D0' }} />
                      Mild
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full inline-block" style={{ backgroundColor: '#F4A000' }} />
                      Moderate
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full inline-block" style={{ backgroundColor: '#E8A5AE' }} />
                      Severe
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[18px] font-semibold text-[#36495F] mb-4">Active Symptoms</h3>

                {symptoms.length === 0 ? (
                  <div className="rounded-[20px] border border-[#E5E3E8] p-5 text-[#6E7384]">
                    No active symptoms yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {symptoms.map((symptom) => (
                      <div
                        key={symptom.id}
                        className="rounded-[20px] border border-[#E5E3E8] p-4 relative"
                      >
                        <button
                          type="button"
                          onClick={() => handleDelete(symptom.id)}
                          className="absolute right-5 top-5 text-[#36495F]"
                        >
                          <X className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-3 flex-wrap mb-3">
                          <h4 className="text-[18px] font-semibold text-[#36495F]">
                            {symptom.bodyAreas?.[0] || symptom.name}
                          </h4>

                          <span
                            className="rounded-full px-4 py-1.5 text-[14px] font-semibold text-white"
                            style={{ backgroundColor: '#F4A000' }}
                          >
                            Severity {symptom.severity}/10
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {(symptom.triggers?.length ? symptom.triggers : [symptom.name]).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full px-3 py-1.5 text-[14px] font-semibold text-[#36545B]"
                              style={{ backgroundColor: '#A8D5D0' }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <p className="text-[14px] text-[#6E7384]">
                          {new Date(symptom.date).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {selectedBodyAreas.length > 0 && (
              <div className="mt-8 rounded-[18px] border border-[#E5E3E8] p-5 bg-[#FBFBFC]">
                <p className="text-[15px] text-[#36495F] font-medium mb-3">Selected body parts</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedBodyAreas.map((area) => (
                    <span
                      key={area}
                      className="rounded-full px-3 py-1.5 text-[14px] text-white"
                      style={{ backgroundColor: '#7697C1' }}
                    >
                      {BODY_POINTS.find((p) => p.id === area)?.label || area}
                    </span>
                  ))}
                </div>

                <Button
                  type="button"
                  onClick={() => {
                    setMode('tracker');
                    setShowAddForm(true);
                  }}
                  className="text-white"
                  style={{ backgroundColor: '#7697C1' }}
                >
                  Create Symptom From Selection
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}