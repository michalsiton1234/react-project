import React, { useState } from 'react';
import { CandidateProfile } from './CandidateProfile'; // ייבוא המודל שיצרנו קודם

const CandidateProfileForm: React.FC = () => {
  // אתחול ה-State עם ערכי ברירת המחדל מה-Schema
  const [profile, setProfile] = useState<CandidateProfile>({
    user_id: '',
    city: '',
    max_distance: 0,
    min_hourly_rate: 0,
    activity: true,
    level: 'medium',
    is_remote_only: false,
    with_people: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
   
    // טיפול בתיבות סימון (Checkbox) לעומת שדות טקסט/מספר
    const finalValue = type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : type === 'number' ? Number(value) : value;

    setProfile({
      ...profile,
      [name]: finalValue,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('נתוני הפרופיל נשמרו:', profile);
    alert('הפרופיל עודכן בהצלחה!');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-xl mt-10" style={{ direction: 'rtl' }}>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">עריכת פרופיל מועמד</h1>
     
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* מזהה משתמש */}
        <div>
          <label className="block text-sm font-medium text-gray-700">מזהה משתמש</label>
          <input
            type="text"
            name="user_id"
            value={profile.user_id}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>

        {/* עיר */}
        <div>
          <label className="block text-sm font-medium text-gray-700">עיר</label>
          <input
            type="text"
            name="city"
            value={profile.city}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            required
          />
        </div>

        {/* רמת קושי מבוקשת */}
        <div>
          <label className="block text-sm font-medium text-gray-700">רמת קושי מבוקשת</label>
          <select
            name="level"
            value={profile.level}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border
