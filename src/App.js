import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import alarmSoundFile from './alarm.mp3';

// Hook personnalisé pour gérer les alarmes
const useAlarms = () => {
  const [alarms, setAlarms] = useState(() => JSON.parse(localStorage.getItem('alarms')) || []);

  useEffect(() => {
    localStorage.setItem('alarms', JSON.stringify(alarms));
  }, [alarms]);

  const addAlarm = (newAlarm) => {
    if (!alarms.some((alarm) => alarm.time === newAlarm.time && alarm.recurrence === newAlarm.recurrence)) {
      setAlarms((prevAlarms) => [...prevAlarms, newAlarm].sort((a, b) => a.time.localeCompare(b.time)));
    }
  };

  const toggleAlarm = (id) => {
    setAlarms((prevAlarms) =>
      prevAlarms.map((alarm) =>
        alarm.id === id ? { ...alarm, isActive: !alarm.isActive } : alarm
      )
    );
  };

  const deleteAlarm = useCallback((id) => {
    setAlarms((prevAlarms) => prevAlarms.filter((alarm) => alarm.id !== id));
  }, []);

  const clearAlarms = useCallback(() => setAlarms([]), []);

  return { alarms, addAlarm, toggleAlarm, deleteAlarm, clearAlarms };
};

const recurrenceOptions = [
  { label: 'Aucune', value: 'none' },
  { label: 'Quotidienne', value: 'daily' },
  { label: 'Hebdomadaire', value: 'weekly' },
  { label: 'Mensuelle', value: 'monthly' },
];

const AlarmApp = () => {
  const [currentTime, setCurrentTime] = useState('00:00:00');
  const [timeInput, setTimeInput] = useState({ hour: '', minute: '', second: '' });
  const [recurrence, setRecurrence] = useState('none');
  const [error, setError] = useState('');
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const alarmSound = useRef(new Audio(alarmSoundFile));
  const snoozeTimeout = useRef(null);
  const { alarms, addAlarm, toggleAlarm, deleteAlarm, clearAlarms } = useAlarms();

  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      const timeString = date.toLocaleTimeString('en-US', { hour12: false });
      setCurrentTime(timeString);
      checkAlarms(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alarms]);

  useEffect(() => {
    const audio = alarmSound.current;
    const handleAudioError = () => {
      console.error("Erreur lors de la lecture du son d'alarme.");
      setIsAlarmRinging(false);
    };

    audio.addEventListener('error', handleAudioError);
    return () => audio.removeEventListener('error', handleAudioError);
  }, []);

  const appendZero = (value) => (value < 10 ? '0' + value : value);

  const shouldTriggerAlarm = (alarm, currentTime) => {
    const now = new Date();
    if (alarm.recurrence === 'none') return alarm.time === currentTime;
    if (alarm.recurrence === 'daily') return alarm.time === currentTime;
    if (alarm.recurrence === 'weekly') return alarm.time === currentTime && now.getDay() === alarm.dayOfWeek;
    if (alarm.recurrence === 'monthly') return alarm.time === currentTime && now.getDate() === alarm.dayOfMonth;
    return false;
  };

  const checkAlarms = (currentTime) => {
    alarms.forEach((alarm) => {
      if (alarm.isActive && shouldTriggerAlarm(alarm, currentTime)) {
        triggerAlarm(alarm);
      }
    });
  };

  const triggerAlarm = (alarm) => {
    setIsAlarmRinging(true);
    alarmSound.current.play().catch((error) => {
      console.error("Erreur lors de la lecture du son d'alarme:", error);
      setIsAlarmRinging(false);
    });
    showNotification(alarm.time);
    if (alarm.recurrence === 'none') {
      toggleAlarm(alarm.id);
    }
  };

  const showNotification = (alarmTime) => {
    if (Notification.permission === 'granted') {
      new Notification(`Alarme ! Il est ${alarmTime}`, {
        body: 'Votre alarme est en cours.',
        icon: '/alarm-icon.png' // Remplacez par le chemin de l'icône si nécessaire
      });
    }
  };  

  const handleAddAlarm = useCallback(() => {
    setError('');
    const { hour, minute, second } = timeInput;
    const newHour = parseInt(hour, 10) || 0;
    const newMinute = parseInt(minute, 10) || 0;
    const newSecond = parseInt(second, 10) || 0;

    if (newHour < 0 || newHour > 23 || newMinute < 0 || newMinute > 59 || newSecond < 0 || newSecond > 59) {
      setError('Heure invalide. Veuillez entrer des valeurs valides!');
      return;
    }

    const newAlarm = {
      id: `${newHour}_${newMinute}_${newSecond}_${Date.now()}`,
      time: `${appendZero(newHour)}:${appendZero(newMinute)}:${appendZero(newSecond)}`,
      isActive: true,
      recurrence,
    };

    addAlarm(newAlarm);
    setTimeInput({ hour: '', minute: '', second: '' });
    setRecurrence('none');
  }, [timeInput, recurrence, addAlarm]);

  const stopAlarm = useCallback(() => {
    alarmSound.current.pause();
    alarmSound.current.currentTime = 0;
    setIsAlarmRinging(false);
    clearTimeout(snoozeTimeout.current);
  }, []);

  const snoozeAlarm = useCallback(() => {
    stopAlarm();
    snoozeTimeout.current = setTimeout(() => {
      setIsAlarmRinging(true);
      alarmSound.current.play().catch((error) => {
        console.error("Erreur lors de la lecture du son d'alarme en mode snooze:", error);
        setIsAlarmRinging(false);
      });
      const now = new Date();
      const snoozeTime = new Date(now.getTime() + 5 * 60000); // 5 minutes plus tard
      const snoozeTimeString = snoozeTime.toLocaleTimeString('en-US', { hour12: false });
      showNotification(snoozeTimeString);
    }, 300000); // 5 minutes snooze
  }, [stopAlarm]);

  return (
    <div className="wrapper">
      <div className="current-time">{currentTime}</div>
      <div className="container">
        <div className="inputs">
          <div className="input-group">
            <label htmlFor="hour">Heures</label>
            <input
              id="hour"
              type="number"
              placeholder="HH"
              min="0"
              max="23"
              value={timeInput.hour}
              onChange={(e) => setTimeInput({ ...timeInput, hour: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label htmlFor="minute">Minutes</label>
            <input
              id="minute"
              type="number"
              placeholder="MM"
              min="0"
              max="59"
              value={timeInput.minute}
              onChange={(e) => setTimeInput({ ...timeInput, minute: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label htmlFor="second">Secondes</label>
            <input
              id="second"
              type="number"
              placeholder="SS"
              min="0"
              max="59"
              value={timeInput.second}
              onChange={(e) => setTimeInput({ ...timeInput, second: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label htmlFor="recurrence">Récurrence</label>
            <select
              id="recurrence"
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
            >
              {recurrenceOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="buttons">
          <button onClick={handleAddAlarm}>Ajouter Alarme</button>
          <button onClick={clearAlarms} className="clear">
            Effacer Toutes
          </button>
        </div>
        <div className="alarms-list">
          {alarms.length === 0 && <p>Aucune alarme définie</p>}
          {alarms.map((alarm) => (
            <div key={alarm.id} className={`alarm-item ${alarm.isActive ? 'active' : 'inactive'}`}>
              <span className="alarm-time">{alarm.time}</span>
              <span className="alarm-recurrence">{recurrenceOptions.find(opt => opt.value === alarm.recurrence)?.label}</span>
              <button onClick={() => toggleAlarm(alarm.id)}>
                {alarm.isActive ? 'Désactiver' : 'Activer'}
              </button>
              <button onClick={() => deleteAlarm(alarm.id)}>Supprimer</button>
            </div>
          ))}
        </div>
      </div>
      {isAlarmRinging && (
        <div className="alarm-controls">
          <button onClick={stopAlarm}>Arrêter</button>
          <button onClick={snoozeAlarm}>Snooze</button>
        </div>
      )}
    </div>
  );
};

export default AlarmApp;

