import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface BodyPartSymptom {
  id: string;
  part: string;
  symptoms: string[];
  severity: number;
  date: Date;
}

type ViewType = 'front' | 'side' | 'back';

export function BodyMapNew() {
  const [selectedView, setSelectedView] = useState<ViewType>('front');
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState<BodyPartSymptom[]>([
    {
      id: '1',
      part: 'left-knee',
      symptoms: ['Pain', 'Swelling'],
      severity: 7,
      date: new Date(),
    },
    {
      id: '2',
      part: 'right-hand',
      symptoms: ['Stiffness', 'Pain'],
      severity: 5,
      date: new Date(),
    },
    {
      id: '3',
      part: 'left-fingers',
      symptoms: ['Stiffness'],
      severity: 6,
      date: new Date(),
    },
  ]);

  // Front view hotspots (aligned with new 3D skeleton)
  const frontHotspots = [
    { id: 'head', name: 'Head', top: '4%', left: '35%' },
    { id: 'neck', name: 'Neck', top: '10%', left: '42%' },
    { id: 'left-shoulder', name: 'Left Shoulder', top: '16%', left: '22%' },
    { id: 'right-shoulder', name: 'Right Shoulder', top: '16%', left: '62%' },
    { id: 'left-elbow', name: 'Left Elbow', top: '32%', left: '12%' },
    { id: 'right-elbow', name: 'Right Elbow', top: '32%', left: '72%' },
    { id: 'left-wrist', name: 'Left Wrist', top: '46%', left: '8%' },
    { id: 'right-wrist', name: 'Right Wrist', top: '46%', left: '76%' },
    { id: 'left-hand', name: 'Left Hand', top: '52%', left: '5%' },
    { id: 'right-hand', name: 'Right Hand', top: '52%', left: '79%' },
    { id: 'chest', name: 'Chest', top: '22%', left: '42%' },
    { id: 'abdomen', name: 'Abdomen', top: '35%', left: '42%' },
    { id: 'left-hip', name: 'Left Hip', top: '48%', left: '35%' },
    { id: 'right-hip', name: 'Right Hip', top: '48%', left: '49%' },
    { id: 'left-knee', name: 'Left Knee', top: '65%', left: '35%' },
    { id: 'right-knee', name: 'Right Knee', top: '65%', left: '49%' },
    { id: 'left-ankle', name: 'Left Ankle', top: '82%', left: '35%' },
    { id: 'right-ankle', name: 'Right Ankle', top: '82%', left: '49%' },
    { id: 'left-foot', name: 'Left Foot', top: '88%', left: '35%' },
    { id: 'right-foot', name: 'Right Foot', top: '88%', left: '49%' },
  ];

  // Side view hotspots (aligned with new 3D skeleton)
  const sideHotspots = [
    { id: 'head', name: 'Head', top: '4%', left: '30%' },
    { id: 'neck', name: 'Neck', top: '10%', left: '35%' },
    { id: 'shoulder', name: 'Shoulder', top: '16%', left: '40%' },
    { id: 'upper-back', name: 'Upper Back', top: '22%', left: '45%' },
    { id: 'elbow', name: 'Elbow', top: '32%', left: '48%' },
    { id: 'lower-back', name: 'Lower Back', top: '38%', left: '42%' },
    { id: 'wrist', name: 'Wrist', top: '46%', left: '50%' },
    { id: 'hip', name: 'Hip', top: '48%', left: '38%' },
    { id: 'hand', name: 'Hand', top: '52%', left: '52%' },
    { id: 'thigh', name: 'Thigh', top: '58%', left: '35%' },
    { id: 'knee', name: 'Knee', top: '65%', left: '32%' },
    { id: 'shin', name: 'Shin', top: '75%', left: '30%' },
    { id: 'ankle', name: 'Ankle', top: '82%', left: '28%' },
    { id: 'foot', name: 'Foot', top: '88%', left: '25%' },
  ];

  // Back view hotspots (aligned with new 3D skeleton)
  const backHotspots = [
    { id: 'head', name: 'Head', top: '4%', left: '35%' },
    { id: 'neck', name: 'Neck', top: '10%', left: '42%' },
    { id: 'left-shoulder', name: 'Left Shoulder', top: '16%', left: '62%' },
    { id: 'right-shoulder', name: 'Right Shoulder', top: '16%', left: '22%' },
    { id: 'upper-back', name: 'Upper Back', top: '22%', left: '42%' },
    { id: 'left-elbow', name: 'Left Elbow', top: '32%', left: '72%' },
    { id: 'right-elbow', name: 'Right Elbow', top: '32%', left: '12%' },
    { id: 'lower-back', name: 'Lower Back', top: '38%', left: '42%' },
    { id: 'left-wrist', name: 'Left Wrist', top: '46%', left: '76%' },
    { id: 'right-wrist', name: 'Right Wrist', top: '46%', left: '8%' },
    { id: 'sacrum', name: 'Sacrum', top: '48%', left: '42%' },
    { id: 'left-hand', name: 'Left Hand', top: '52%', left: '79%' },
    { id: 'right-hand', name: 'Right Hand', top: '52%', left: '5%' },
    { id: 'left-glute', name: 'Left Glute', top: '52%', left: '49%' },
    { id: 'right-glute', name: 'Right Glute', top: '52%', left: '35%' },
    { id: 'left-hamstring', name: 'Left Hamstring', top: '60%', left: '49%' },
    { id: 'right-hamstring', name: 'Right Hamstring', top: '60%', left: '35%' },
    { id: 'left-knee', name: 'Left Knee', top: '65%', left: '49%' },
    { id: 'right-knee', name: 'Right Knee', top: '65%', left: '35%' },
    { id: 'left-calf', name: 'Left Calf', top: '75%', left: '49%' },
    { id: 'right-calf', name: 'Right Calf', top: '75%', left: '35%' },
    { id: 'left-ankle', name: 'Left Ankle', top: '82%', left: '49%' },
    { id: 'right-ankle', name: 'Right Ankle', top: '82%', left: '35%' },
    { id: 'left-foot', name: 'Left Foot', top: '88%', left: '49%' },
    { id: 'right-foot', name: 'Right Foot', top: '88%', left: '35%' },
  ];

  const getHotspots = () => {
    switch (selectedView) {
      case 'front':
        return frontHotspots;
      case 'side':
        return sideHotspots;
      case 'back':
        return backHotspots;
      default:
        return frontHotspots;
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return '#E89BA1'; // Pink - Severe
    if (severity >= 5) return '#F59E0B'; // Amber - Moderate
    return '#A5D3CF'; // Mint - Mild
  };

  const getPartSymptoms = (partId: string) => {
    return symptoms.filter((s) => s.part === partId);
  };

  const removeSymptom = (id: string) => {
    setSymptoms(symptoms.filter((s) => s.id !== id));
  };

  const hasSymptoms = (partId: string) => {
    return getPartSymptoms(partId).length > 0;
  };

  const getMaxSeverity = (partId: string) => {
    const partSymptoms = getPartSymptoms(partId);
    if (partSymptoms.length === 0) return 0;
    return Math.max(...partSymptoms.map((s) => s.severity));
  };

  // Base64 skeleton images from HTML
  const skeletonImages = {
    front: 'data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAQAAp0DASIAAhEBAxEB/8QAHAABAAIDAQEBAAAAAAAAAAAAAAEHBAUGAwII/8QATxAAAQMDAQQEBQYFCA',
    side: 'data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAQAAp0DASIAAhEBAxEB/8QAHAABAAEFAQEAAAAAAAAAAAAAAAYBAwQFBwII/8QAThABAAIBAwEEBQYGBgYGAgMBAQECAwQFERIhBjYxURIT',
    back: 'data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAQAAp0DASIAAhEBAxEB/8QAHAABAAIDAQEBAAAAAAAAAAAAAAEGBAUHAgII/8QAURAAAQMDAQQFBAgGBwcEAgIDAAECAwQFERIGEyExByJBUWEUMlJTcYGR',
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Body Mapping</CardTitle>
        <p className="text-sm text-muted-foreground">
          Track where you experience symptoms - click on any body part
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Skeleton View */}
          <div className="flex-1 flex flex-col items-center gap-4">
            {/* View Selector */}
            <div className="flex gap-2">
              {(['front', 'side', 'back'] as ViewType[]).map((view) => (
                <button
                  key={view}
                  onClick={() => setSelectedView(view)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedView === view
                      ? 'bg-[#7293BB] text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)} View
                </button>
              ))}
            </div>

            {/* Skeleton Image with Hotspots */}
            <div className="relative w-full max-w-md">
              <img
                src={skeletonImages[selectedView]}
                alt={`${selectedView} skeleton view`}
                className="w-full h-auto"
                style={{ 
                  width: selectedView === 'side' ? '65px' : '70px',
                  height: '380px',
                  objectPosition: selectedView === 'front' ? '10% center' : 
                                 selectedView === 'side' ? '50% center' : 
                                 '90% center',
                  objectFit: 'cover'
                }}
              />
              
              {/* Hotspots Overlay */}
              {getHotspots().map((hotspot) => {
                const partHasSymptoms = hasSymptoms(hotspot.id);
                const severity = getMaxSeverity(hotspot.id);
                const color = partHasSymptoms ? getSeverityColor(severity) : '#7293BB';
                
                return (
                  <div
                    key={hotspot.id}
                    className="absolute cursor-pointer group"
                    style={{ 
                      top: hotspot.top, 
                      left: hotspot.left,
                      transform: 'translate(-50%, -50%)'
                    }}
                    onClick={() => setSelectedPart(hotspot.id)}
                  >
                    {/* Hotspot Dot */}
                    <div
                      className={`w-4 h-4 rounded-full transition-all ${
                        partHasSymptoms ? 'animate-pulse' : ''
                      }`}
                      style={{
                        backgroundColor: color,
                        border: `2px solid ${partHasSymptoms ? color : 'white'}`,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    />
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {hotspot.name}
                      {partHasSymptoms && ` (${severity}/10)`}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: '#A5D3CF' }}
                />
                <span>Mild</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: '#F59E0B' }}
                />
                <span>Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: '#E89BA1' }}
                />
                <span>Severe</span>
              </div>
            </div>
          </div>

          {/* Symptom Details */}
          <div className="flex-1 space-y-4">
            <div>
              <h4 className="mb-3">Active Symptoms</h4>
              {symptoms.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No symptoms logged. Click on a body part to add symptoms.
                </p>
              ) : (
                <div className="space-y-3">
                  {symptoms.map((symptom) => {
                    const hotspot = getHotspots().find((h) => h.id === symptom.part);
                    return (
                      <div
                        key={symptom.id}
                        className="p-3 bg-card rounded-lg border flex items-start justify-between"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{hotspot?.name || symptom.part}</span>
                            <Badge
                              variant="outline"
                              style={{
                                backgroundColor: getSeverityColor(symptom.severity),
                                color: 'white',
                                borderColor: getSeverityColor(symptom.severity),
                              }}
                            >
                              Severity {symptom.severity}/10
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {symptom.symptoms.map((s, idx) => (
                              <Badge key={idx} variant="secondary">
                                {s}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {symptom.date.toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSymptom(symptom.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
