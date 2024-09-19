import React, { useState, useEffect, useRef } from 'react';
import { Button, Switch, FormControlLabel, Select, MenuItem, TextField, Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { FaTrashAlt } from 'react-icons/fa';
import alarmSoundFile from './alarm.mp3';
import './App.css';

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

  const deleteAlarm = (id) => {
    setAlarms((prevAlarms) => prevAlarms.filter((alarm) => alarm.id !== id));
  };

  const clearAlarms = () => setAlarms([]);

  return { alarms, addAlarm, toggleAlarm, deleteAlarm, clearAlarms };
};

const AlarmApp = () => {
  const [currentTime, setCurrentTime] = useState('00:00:00');
  const [timeInput, setTimeInput] = useState({ hour: '', minute: '', second: '' });
  const [recurrence, setRecurrence] = useState('none');
  const [theme, setTheme] = useState('dark');
  const [error, setError] = useState('');
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const alarmSound = useRef(new Audio(alarmSoundFile));
  const snoozeTimeout = useRef(null);
  const { alarms, addAlarm, toggleAlarm, deleteAlarm, clearAlarms } = useAlarms();

  // Demander la permission pour les notifications
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

    updateTime(); // Mise à jour immédiate

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alarms]);

  const appendZero = (value) => (value < 10 ? '0' + value : value);

  const checkAlarms = (currentTime) => {
    alarms.forEach((alarm) => {
      if (alarm.isActive && alarm.time === currentTime) {
        triggerAlarm(alarm);
      }
    });
  };

  const triggerAlarm = (alarm) => {
    setIsAlarmRinging(true);
    alarmSound.current.play().catch((error) => {
      console.error('Erreur lors de la lecture du son d\'alarme:', error);
      setIsAlarmRinging(false);
    });
    showNotification(alarm.time);
    if (alarm.recurrence === 'none') {
      toggleAlarm(alarm.id); // Désactiver l'alarme non récurrente après son déclenchement
    }
  };

  const showNotification = (alarmTime) => {
    if (Notification.permission === 'granted') {
      new Notification(`Alarme ! Il est ${alarmTime}`);
    }
  };

  const handleAddAlarm = () => {
    setError('');
    const { hour, minute, second } = timeInput;
    const newHour = parseInt(hour, 10) || 0;
    const newMinute = parseInt(minute, 10) || 0;
    const newSecond = parseInt(second, 10) || 0;

    if (
      newHour < 0 ||
      newHour > 23 ||
      newMinute < 0 ||
      newMinute > 59 ||
      newSecond < 0 ||
      newSecond > 59
    ) {
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
  };

  const stopAlarm = () => {
    alarmSound.current.pause();
    alarmSound.current.currentTime = 0;
    setIsAlarmRinging(false);
    clearTimeout(snoozeTimeout.current);
  };

  const snoozeAlarm = () => {
    stopAlarm();
    snoozeTimeout.current = setTimeout(() => {
      setIsAlarmRinging(true);
      alarmSound.current.play().catch((error) => {
        console.error('Erreur lors de la lecture du son d\'alarme en mode snooze:', error);
        setIsAlarmRinging(false);
      });
      const now = new Date();
      const snoozeTime = new Date(now.getTime() + 5 * 60000); // 5 minutes plus tard
      const snoozeTimeString = snoozeTime.toLocaleTimeString('en-US', { hour12: false });
      showNotification(snoozeTimeString);
    }, 300000); // 5 minutes snooze
  };

  return (
    <motion.div className={`wrapper ${theme}`}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <Typography variant="h2" sx={{ color: theme === 'dark' ? '#00ffcc' : '#333', marginBottom: 3 }}>
          {currentTime}
        </Typography>
        
        <Box className="inputs" sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
          <TextField 
            label="Heures" 
            type="number" 
            variant="outlined" 
            value={timeInput.hour}
            onChange={(e) => setTimeInput({ ...timeInput, hour: e.target.value })}
            inputProps={{ min: 0, max: 23 }}
          />
          <TextField 
            label="Minutes" 
            type="number" 
            variant="outlined" 
            value={timeInput.minute}
            onChange={(e) => setTimeInput({ ...timeInput, minute: e.target.value })}
            inputProps={{ min: 0, max: 59 }}
          />
          <TextField 
            label="Secondes" 
            type="number" 
            variant="outlined" 
            value={timeInput.second}
            onChange={(e) => setTimeInput({ ...timeInput, second: e.target.value })}
            inputProps={{ min: 0, max: 59 }}
          />
        </Box>

        <Select
          label="Récurrence"
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value)}
        >
          <MenuItem value="none">Aucune</MenuItem>
          <MenuItem value="daily">Quotidienne</MenuItem>
        </Select>

        {error && <Typography color="error">{error}</Typography>}

        <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
          <Button variant="contained" color="primary" onClick={handleAddAlarm}>
            Ajouter Alarme
          </Button>
          <Button variant="outlined" color="secondary" onClick={clearAlarms}>
            Effacer Toutes
          </Button>
        </Box>

        <Box sx={{ marginTop: 4 }}>
          {alarms.map((alarm) => (
            <motion.div
              key={alarm.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`alarm ${alarm.isActive ? 'active' : ''}`}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                backgroundColor: theme === 'dark' ? '#333' : '#fff', padding: '10px', borderRadius: '8px',
                color: theme === 'dark' ? '#00ffcc' : '#ffffff', marginBottom: '10px'
              }}
            >
              <span>{alarm.time}</span>
              <span>
                {alarm.recurrence === 'daily' ? 'Quotidienne' : 'Unique'}
              </span>
              <FormControlLabel
                control={
                  <Switch
                    checked={alarm.isActive}
                    onChange={() => toggleAlarm(alarm.id)}
                  />
                }
                label={alarm.isActive ? 'Activée' : 'Désactivée'}
              />
              <Button
                variant="outlined"
                color="error"
                onClick={() => deleteAlarm(alarm.id)}
                startIcon={<FaTrashAlt />}
              >
                Supprimer
              </Button>
            </motion.div>
          ))}
        </Box>

        {/* Contrôles pour arrêter ou snoozer l'alarme */}
        {isAlarmRinging && (
          <Box sx={{ display: 'flex', gap: 2, marginTop: 4 }}>
            <Button variant="contained" color="error" onClick={stopAlarm}>
              Arrêter l'Alarme
            </Button>
            <Button variant="outlined" color="warning" onClick={snoozeAlarm}>
              Snooze 5 minutes
            </Button>
          </Box>
        )}
        
        {/* Thème switch */}
        <Box sx={{ marginTop: 4 }}>
          <FormControlLabel
            control={
              <Switch
                checked={theme === 'dark'}
                onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              />
            }
            label={theme === 'dark' ? 'Mode Sombre' : 'Mode Clair'}
          />
        </Box>
      </Box>
    </motion.div>
  );
};

export default AlarmApp;
