import { Plus, Upload, Calendar, Trash } from 'lucide-react';
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface TodoInputProps {
  onAdd: (text: string, reminder?: Date, alarmSound?: string) => void;
  availableSounds: { id: string; name: string; url: string; }[];
}

export function TodoInput({ onAdd, availableSounds }: TodoInputProps) {
  const [text, setText] = useState('');
  const [reminder, setReminder] = useState<Date | null>(null);
  const [selectedSound, setSelectedSound] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hour, setHour] = useState<string>('12');
  const [minute, setMinute] = useState<string>('00');
  const [period, setPeriod] = useState<string>('AM');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [customSounds, setCustomSounds] = useState<{ id: string; name: string; url: string; }[]>([]);

  useEffect(() => {
    const savedSounds = localStorage.getItem('sounds');
    if (savedSounds) {
      setCustomSounds(JSON.parse(savedSounds));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      const selectedTime = reminder ? new Date(reminder) : new Date();
      selectedTime.setHours(period === 'AM' ? parseInt(hour) % 12 : (parseInt(hour) % 12) + 12);
      selectedTime.setMinutes(parseInt(minute));
      onAdd(text.trim(), selectedTime || undefined, selectedSound || undefined);
      setText('');
      setReminder(null);
      setSelectedSound('');
      setIsExpanded(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (e.target.value && !isExpanded) {
      setIsExpanded(true);
    } else if (!e.target.value) {
      setIsExpanded(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('audio/')) {
      alert('Please upload an audio file');
      return;
    }

    setIsUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => {
          console.error('File reading error:', error);
          reject(error);
        };
      });

      const newSound = {
        id: `custom-${Date.now()}`,
        name: file.name,
        url: base64
      };

      const updatedSounds = [...customSounds, newSound];
      localStorage.setItem('sounds', JSON.stringify(updatedSounds));
      setCustomSounds(updatedSounds);

      window.location.reload();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteSound = (id: string) => {
    const updatedSounds = customSounds.filter(sound => sound.id !== id);
    localStorage.setItem('sounds', JSON.stringify(updatedSounds));
    setCustomSounds(updatedSounds);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2 w-full">
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="Add a new todo..."
          className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex gap-4 items-start">
            <div className="flex-1 space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Set Reminder
              </label>
              
              <div className="relative">
                <DatePicker
                  selected={reminder}
                  onChange={(date) => setReminder(date)}
                  dateFormat="MMMM d, yyyy"
                  placeholderText="Select date"
                  className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  minDate={new Date()}
                  open={isDatePickerOpen}
                  onClickOutside={() => setIsDatePickerOpen(false)}
                  onInputClick={() => setIsDatePickerOpen(true)}
                  showTimeSelect={false}
                />
                <Calendar 
                  className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  onClick={() => setIsDatePickerOpen(true)}
                />
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <select
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>

                <select
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <option key={i} value={i < 10 ? `0${i}` : i}>
                      {i < 10 ? `0${i}` : i}
                    </option>
                  ))}
                </select>

                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alarm Sound
              </label>
              <div className="space-y-2">
                <select
                  value={selectedSound}
                  onChange={(e) => setSelectedSound(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a sound</option>
                  {availableSounds.map((sound) => (
                    <option key={sound.id} value={sound.id}>
                      {sound.name}
                    </option>
                  ))}
                  {customSounds.map((sound) => (
                    <option key={sound.id} value={sound.id}>
                      {sound.name}
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="sound-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="sound-upload"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-500 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    {isUploading ? 'Uploading...' : 'Upload custom sound'}
                  </label>
                </div>

                {customSounds.map((sound) => (
                  <div key={sound.id} className="flex items-center justify-between">
                    <span>{sound.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSound(sound.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
