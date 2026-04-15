import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface MedicalRecord {
  id: string;
  title: string;
  type: string;
  notes: string;
  createdAt: string;
}

export function MedicalRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [notes, setNotes] = useState('');

  const loadRecords = async () => {
    try {
      const res = await api.getRecords();
      setRecords(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !type.trim()) return;

    try {
      const created = await api.createRecord({
        title,
        type,
        notes,
      });

      setRecords((prev) => [created, ...prev]);
      setTitle('');
      setType('');
      setNotes('');
    } catch (err) {
      console.error('Failed to create record:', err);
      alert('Failed to add record');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteRecord(id);
      setRecords((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Failed to delete record:', err);
      alert('Failed to delete record');
    }
  };

  if (loading) {
    return <div className="p-4">Loading records...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Medical Records</h2>

        <form onSubmit={handleAddRecord} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Record title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Blood Test Report"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Record type</label>
            <Input
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g. Lab Report"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Extra details about this record"
              className="w-full min-h-[100px] rounded-md border px-3 py-2"
            />
          </div>

          <Button type="submit" style={{ backgroundColor: '#7293BB' }} className="text-white">
            Add Record
          </Button>
        </form>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Saved Records</h3>

        {records.length === 0 ? (
          <p className="text-muted-foreground">No records added yet.</p>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div
                key={record.id}
                className="rounded-lg border p-4 flex items-start justify-between gap-4"
              >
                <div>
                  <h4 className="font-semibold">{record.title}</h4>
                  <p className="text-sm text-muted-foreground">{record.type}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(record.createdAt).toLocaleString()}
                  </p>
                  {record.notes && (
                    <p className="text-sm mt-2">
                      <span className="font-medium">Notes:</span> {record.notes}
                    </p>
                  )}
                </div>

                <Button variant="outline" onClick={() => handleDelete(record.id)}>
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