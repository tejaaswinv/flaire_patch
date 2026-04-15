import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string[];
  taken: boolean[];
  notes: string;
}

export function MedicationManager() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  const loadMedications = async () => {
    try {
      const res = await api.getMedications();
      setMedications(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load medications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedications();
  }, []);

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    try {
      const timeList = time
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const created = await api.createMedication({
        name,
        dosage,
        frequency,
        time: timeList,
        taken: timeList.map(() => false),
        notes,
      });

      setMedications((prev) => [created, ...prev]);
      setName('');
      setDosage('');
      setFrequency('');
      setTime('');
      setNotes('');
    } catch (err) {
      console.error('Failed to create medication:', err);
      alert('Failed to add medication');
    }
  };

  const handleToggleTaken = async (medication: Medication, index: number) => {
    try {
      const updatedTaken = [...medication.taken];
      updatedTaken[index] = !updatedTaken[index];

      const updated = await api.updateMedicationTaken(medication.id, updatedTaken);

      setMedications((prev) =>
        prev.map((item) => (item.id === medication.id ? { ...item, taken: updated.taken } : item))
      );
    } catch (err) {
      console.error('Failed to update medication:', err);
      alert('Failed to update medication');
    }
  };

  if (loading) {
    return <div className="p-4">Loading medications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Medications</h2>

        <form onSubmit={handleAddMedication} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Medication name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ibuprofen"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Dosage</label>
            <Input
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g. 200mg"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Frequency</label>
            <Input
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              placeholder="e.g. Twice daily"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Times (comma separated)</label>
            <Input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="e.g. 8:00 AM, 8:00 PM"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Extra details..."
              className="w-full min-h-[100px] rounded-md border px-3 py-2"
            />
          </div>

          <Button type="submit" style={{ backgroundColor: '#7293BB' }} className="text-white">
            Add Medication
          </Button>
        </form>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Your Medications</h3>

        {medications.length === 0 ? (
          <p className="text-muted-foreground">No medications added yet.</p>
        ) : (
          <div className="space-y-4">
            {medications.map((medication) => (
              <div key={medication.id} className="rounded-lg border p-4 space-y-3">
                <div>
                  <h4 className="font-semibold">{medication.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {medication.dosage} • {medication.frequency}
                  </p>
                  {medication.notes && (
                    <p className="text-sm mt-2">
                      <span className="font-medium">Notes:</span> {medication.notes}
                    </p>
                  )}
                </div>

                {medication.time?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Schedule</p>
                    {medication.time.map((slot, index) => (
                      <div key={index} className="flex items-center justify-between rounded-md border p-3">
                        <span className="text-sm">{slot}</span>
                        <Button
                          variant={medication.taken?.[index] ? 'default' : 'outline'}
                          onClick={() => handleToggleTaken(medication, index)}
                        >
                          {medication.taken?.[index] ? 'Taken' : 'Mark taken'}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}