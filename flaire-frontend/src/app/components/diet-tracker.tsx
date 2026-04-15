import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface DietEntry {
  id: string;
  mealType: string;
  food: string;
  notes: string;
  createdAt: string;
}

export function DietTracker() {
  const [entries, setEntries] = useState<DietEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [mealType, setMealType] = useState('');
  const [food, setFood] = useState('');
  const [notes, setNotes] = useState('');

  const loadEntries = async () => {
    try {
      const res = await api.getDietEntries();
      setEntries(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load diet entries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mealType.trim() || !food.trim()) return;

    try {
      const created = await api.createDietEntry({
        mealType,
        food,
        notes,
      });

      setEntries((prev) => [created, ...prev]);
      setMealType('');
      setFood('');
      setNotes('');
    } catch (err) {
      console.error('Failed to create diet entry:', err);
      alert('Failed to add diet entry');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteDietEntry(id);
      setEntries((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Failed to delete diet entry:', err);
      alert('Failed to delete diet entry');
    }
  };

  if (loading) {
    return <div className="p-4">Loading diet entries...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Diet Tracker</h2>

        <form onSubmit={handleAddEntry} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Meal type</label>
            <Input
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              placeholder="e.g. Breakfast"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Food</label>
            <Input
              value={food}
              onChange={(e) => setFood(e.target.value)}
              placeholder="e.g. Oatmeal with banana"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any reactions or observations?"
              className="w-full min-h-[100px] rounded-md border px-3 py-2"
            />
          </div>

          <Button type="submit" style={{ backgroundColor: '#7293BB' }} className="text-white">
            Add Meal
          </Button>
        </form>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Logged Meals</h3>

        {entries.length === 0 ? (
          <p className="text-muted-foreground">No meals logged yet.</p>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border p-4 flex items-start justify-between gap-4"
              >
                <div>
                  <h4 className="font-semibold">{entry.mealType}</h4>
                  <p className="text-sm">{entry.food}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(entry.createdAt).toLocaleString()}
                  </p>
                  {entry.notes && (
                    <p className="text-sm mt-2">
                      <span className="font-medium">Notes:</span> {entry.notes}
                    </p>
                  )}
                </div>

                <Button variant="outline" onClick={() => handleDelete(entry.id)}>
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}