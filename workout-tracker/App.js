import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

const COLORS = {
  bg: '#0a0a0a',
  card: '#1c1c3a',
  accent: '#e94560',
  text: '#ffffff',
  muted: '#8888aa',
  input: '#23234a',
  success: '#4caf50',
};

function buildPlan(days) { return days; }


const WORKOUT_PLANS = {
  'Building Muscle - Men': buildPlan([
    { day: 'Sunday – Rest', exercises: ['Full Body Stretching 15min', 'Full Body Foam Rolling Routine', 'Incline Walk 30min'] },
    { day: 'Monday – Upper Body', exercises: ['Incline Bench Press 4×6-8', 'Weighted Pull Ups 4×6-8', 'Bent Over Barbell Row 3×8-10', 'Pec Deck 3×10-12', 'Seated Lateral Raise 3×12-15', 'Cable Tricep Pushdowns 3×10-12', 'Incline Dumbbell Curl 3×10-12'] },
    { day: 'Tuesday – Lower Body', exercises: ['Lying Leg Curl 2×8', 'Barbell Back Squat 4×5-8', 'Romanian Deadlift 3×8-10', 'Leg Press 3×10-12', 'Seated Calf Raise 4×10-15'] },
    { day: 'Wednesday – Rest', exercises: ['Full Body Stretching 15min', 'Full Body Foam Rolling Routine', 'Incline Walk 30min'] },
    { day: 'Thursday – Push Day', exercises: ['Flat Bench Press 4×5-8', 'Machine Shoulder Press 3×10', 'Pec Deck 3×15', 'Seated Lateral Raise 4×12-15', 'Overhead Extension 3×8'] },
    { day: 'Friday – Pull Day', exercises: ['Close Grip Lat Pulldown 3×10', 'Chest-Supported Row 3×8', 'Close-Grip Cable Row 2×15', 'Reverse Cable Flyes 3×15', 'Shrugs 4×15', 'EZ-Bar Curl 3×10', 'Machine Preacher Curl 3×15'] },
    { day: 'Saturday – Leg Day', exercises: ['Seated Leg Curl 2×8', 'Linear Hack Squat 3×6', 'Romanian Deadlift 3×8', 'Leg Extension 2×10', 'Hip Adduction 2×10', 'Standing Calf Raise 3×10'] },
  ]),
  'Building Muscle - Women': buildPlan([
    { day: 'Sunday – Rest', exercises: ['Full Body Stretching 15min', 'Full Body Foam Rolling Routine', 'Incline Walk 30min'] },
    { day: 'Monday – Glutes + Hamstrings', exercises: ['Barbell Hip Thrust 4×6-8', 'Romanian Deadlift 4×8-10', 'Lying Leg Curl 3×10-12', 'Bulgarian Split Squat 3×8-10', 'Cable Kickback 3×12-15'] },
    { day: 'Tuesday – Upper Body (Back + Shoulders)', exercises: ['Lat Pulldown 4×8-12', 'Seated Cable Row 3×10-12', 'Dumbbell Shoulder Press 3×8-10', 'Cable Lateral Raise 3×12-15', 'Rear Delt Machine Fly 3×12-15'] },
    { day: 'Wednesday – Rest', exercises: ['Full Body Stretching 15min', 'Full Body Foam Rolling Routine', 'Incline Walk 30min'] },
    { day: 'Thursday – Glute Pump / Isolation', exercises: ['Glute Bridge 4×10-12', 'Step Ups 3×10', 'Cable Glute Kickbacks 3×12-15', 'Hip Abduction Machine 3×15-20', '45° Back Extensions 3×12-15'] },
    { day: 'Friday – Glutes + Quads', exercises: ['Back Squat 4×6-8', 'Leg Press 3×10-12', 'Walking Lunges 3×10', 'Leg Extension 3×12-15', 'Barbell Hip Thrust 3×8-10'] },
    { day: 'Saturday – Leg Day', exercises: ['Seated Leg Curl 2×8', 'Linear Hack Squat 3×6', 'Romanian Deadlift 3×8', 'Leg Extension 2×10', 'Hip Adduction 2×10', 'Standing Calf Raise 3×10'] },
  ]),
};


const QUESTIONS = [
  { key: 'goal', label: "What's your goal?", type: 'choice', options: ['Building Muscle - Men', 'Building Muscle - Women', 'Get a Nutrition Plan'] },
];

const GOAL_META = {
  'Building Muscle - Men':   { emoji: '💪', subtitle: 'Track workouts' },
  'Building Muscle - Women': { emoji: '💪', subtitle: 'Track workouts' },
  'Get a Nutrition Plan':    { emoji: '🥗', subtitle: 'Calculate calories' },
};

const EXERCISE_NOTES = {
  'Incline Bench':          'Keep shoulder blades pinched and depressed. Drive feet into the floor. Lower the bar to upper chest, elbows at ~60°.',
  'Incline Bench Press':    'Keep shoulder blades pinched and depressed. Drive feet into the floor. Lower the bar to upper chest, elbows at ~60°.',
  'Seated Cable Fly':       'Slight bend in elbows throughout. Lead with your elbows, not your hands. Squeeze the chest at the peak contraction.',
  'Weighted Pull Ups':      'Start from a dead hang. Pull elbows down and back toward your hips. Avoid shrugging — keep shoulders packed down.',
  'Cable Side Lateral Raise': 'Slight forward lean. Lead with your elbow, not your wrist. Pause briefly at shoulder height before controlled lowering.',
  'Deficit Pendlay Row':    'Bar starts on the floor each rep. Flat back, horizontal torso. Explosively row to lower chest, focusing on upper back contraction.',
  'Bench Press':            'Arch naturally, feet flat. Bar path slightly diagonal — touch lower chest, press back toward the rack.',
  'Machine Shoulder Press': 'Adjust seat so handles are at shoulder height. Press straight up without shrugging. Lower with control — don\'t let the weight stack drop.',
  'Pec Deck':               'Keep elbows slightly bent and at shoulder height. Lead with your elbows to maximize chest engagement. Squeeze hard at the peak, return slowly for a full stretch.',
  'Cable Lateral Raise':    'Slight forward lean. Lead with your elbow, not your wrist. Raise to shoulder height and lower with control — don\'t let the cable pull you back.',
  'Overhead Extension':     'Keep elbows close together and pointed forward. Lower until you feel a full tricep stretch, then extend fully. Avoid flaring the elbows on the press.',
  'Cable Kickback':         'Hinge forward at the hips, upper arm parallel to the floor. Extend fully at the elbow and squeeze the tricep. Keep upper arm stationary throughout.',
  'Overhead Press':         'Brace core and glutes. Bar travels in a straight line — move your head back as bar passes, then forward again.',
  'Pull-Ups':               'Full dead hang at the bottom. Drive elbows down toward your pockets. Chin clears the bar at the top.',
  'Bicep Curls':            'Keep elbows pinned at your sides. Supinate at the top. Lower slowly for maximum stretch.',
  'Tricep Pushdowns':       'Elbows locked at your sides. Full extension at the bottom, don\'t let elbows flare on the way up.',
  'Back Squat':             'Brace 360°, chest tall. Break at hips and knees simultaneously. Drive knees out over toes throughout.',
  'Barbell Back Squat':     'Brace 360°, chest tall. Break at hips and knees simultaneously. Drive knees out over toes throughout.',
  'Seated Leg Curl':        'Sit tall with back against the pad. Curl to full contraction and pause briefly at the bottom. Return slowly for a full hamstring stretch — don\'t let the weight stack bounce.',
  'Romanian Deadlift':      'Hinge at the hips, slight knee bend. Feel the hamstring stretch before driving hips forward to stand.',
  'Standing Calf Raise':    'Stand with the balls of your feet on the edge of the platform. Lower into a full stretch, then drive up onto your toes and squeeze hard at the top. Control the descent — don\'t bounce at the bottom.',
  'Seated Calf Raise':      'Sit tall with the pad resting just above your knees. Lower into a full stretch, then drive up onto your toes and squeeze hard at the top. Control the descent — don\'t bounce at the bottom.',
  'Hip Abduction':          'Sit tall with back against the pad. Push knees outward against the pads in a controlled motion. Squeeze the glutes at peak contraction and return slowly — don\'t let the weight slam back.',
  'Hip Adduction':          'Sit tall with back against the pad. Drive knees together in a controlled motion and squeeze the inner thighs at peak contraction. Return slowly — don\'t let the weight pull your knees apart.',
  'Linear Hack Squat':      'Feet shoulder-width, toes slightly out on the platform. Keep chest tall and brace your core. Lower until thighs are parallel, driving knees out over toes. Press through the full foot to stand.',
  'Leg Extension':          'Sit tall with back against the pad. Extend to full lockout and squeeze the quad at the top. Lower slowly — don\'t let the weight drop.',
  'Leg Extensions':         'Sit tall with back against the pad. Extend to full lockout and squeeze the quad at the top. Lower slowly — don\'t let the weight drop.',
  'Leg Press':              'Feet shoulder-width, toes slightly out. Lower until hips start to tuck. Press through the full foot.',
  'Lying Leg Curl':         'Keep hips pressed into the pad throughout. Curl to full contraction, pause briefly, then lower slowly for a full hamstring stretch.',
  'Leg Curls':              'Avoid lifting your hips off the pad. Curl to full contraction and lower with control for a full stretch.',
  'Calf Raises':            'Full range of motion — stretch at the bottom, pause and squeeze hard at the top.',
  'Incline Dumbbell Press': 'Slight incline (30–45°). Keep wrists stacked over elbows. Feel the stretch at the bottom, press and squeeze at the top.',
  'Lateral Raises':         'Slight forward lean. Lead with elbows. Pinky slightly higher than thumb at the top.',
  'Tricep Dips':            'Lean slightly forward for chest emphasis, stay upright for triceps. Lower until elbows hit 90°.',
  'Cable Flys':             'Slight bend in elbows. Focus on the stretch at the start and a full squeeze at the finish.',
  'Deadlift':               'Push the floor away to initiate. Keep bar close to body. Lock out hips and knees simultaneously at the top.',
  'Cable Rows':             'Sit tall, pull to lower sternum. Squeeze shoulder blades together at the end. Don\'t let shoulders roll forward on the return.',
  'Face Pulls':             'Pull to forehead level, elbows flared high. External rotate at the end — thumbs pointing behind you.',
  'Barbell Curls':          'Keep elbows pinned. Supinate at the top for peak contraction. 3-second negative for max tension.',
  'Hammer Curls':           'Neutral grip throughout. Trains brachialis and brachioradialis. Keep elbows tucked, avoid swinging.',
  'Front Squat':            'Elbows high, upright torso. Knees track over toes. Keep core braced to maintain the front rack position.',
  'Nordic Curls':           'Brace and lower as slowly as possible. Use your hands to catch yourself. Pull yourself back with hamstrings on the way up.',
  'Close Grip Lat Pulldown': 'Grip shoulder-width or narrower, palms facing you. Pull elbows down toward your hips and squeeze the lats at the bottom. Control the return — don\'t let the bar yank you up.',
  'Chest-Supported Row':    'Chest flat against the pad to eliminate momentum. Retract shoulder blades first, then row to lower chest. Squeeze at the top and lower with full control.',
  'Close-Grip Cable Row':   'Sit tall, slight knee bend. Pull the handle to your lower sternum, driving elbows back. Squeeze shoulder blades together at the end — don\'t let shoulders roll forward on the return.',
  'Reverse Cable Flyes':    'Slight bend in elbows, hinge forward at the hips. Lead with your elbows and pull outward to shoulder height. Squeeze the rear delts at the top before lowering slowly.',
  'Shrugs':                 'Hold the weight at your sides, stand tall. Shrug straight up toward your ears — no rolling. Hold the contraction briefly at the top, then lower with control.',
  'EZ-Bar Curl':            'Grip the angled part of the bar, elbows pinned at your sides. Curl to full contraction and supinate slightly at the top. Lower slowly for maximum tension.',
  'Machine Preacher Curl':  'Upper arms flat on the pad throughout. Curl to full contraction and squeeze the bicep at the top. Lower slowly until arms are fully extended for a complete stretch.',
  'Barbell Hip Thrust':     'Upper back on bench, bar padded across hips. Drive through your heels and squeeze your glutes hard at the top — hips fully extended. Lower with control and repeat without losing tension.',
  'Bulgarian Split Squat':  'Rear foot elevated on bench, front foot far enough forward to keep shin vertical. Lower until rear knee nearly touches the floor. Drive through the front heel to stand — keep torso upright.',
  'Walking Lunges':         'Step forward into a lunge, lowering the back knee toward the floor. Push off the front foot to step forward into the next rep. Keep torso tall and core braced throughout.',
  'Rear Delt Machine Fly':  'Adjust the handles so arms are at shoulder height. Keep a slight bend in the elbows and pull the handles back in a wide arc. Squeeze the rear delts at the peak — don\'t let the weight snap back.',
  'Lat Pulldown':           'Grip slightly wider than shoulder-width. Lean back slightly and pull the bar to your upper chest, driving elbows down toward your hips. Control the return — don\'t let the bar yank you up.',
  'Seated Cable Row':       'Sit tall with a slight knee bend. Pull the handle to your lower sternum, driving elbows back. Squeeze shoulder blades together at the end and return slowly — don\'t round the lower back.',
  'Dumbbell Shoulder Press':'Sit tall, core braced. Press dumbbells from shoulder height straight up until arms are fully extended. Lower with control to just below ear level — don\'t let the weights drift forward.',
  'Seated Lateral Raise': 'Sit tall on the edge of a bench, dumbbells at your sides. Lead with your elbows and raise arms out to shoulder height — keep a slight bend in the elbow throughout. Pause briefly at the top, then lower slowly with control. Avoid shrugging or using momentum.',
  'Pec Deck':                  'Adjust the seat so handles are at chest height. Keep a slight bend in the elbows and lead with your elbows — not your hands. Squeeze the chest hard at the peak contraction, then return slowly for a full stretch. Don\'t let the weight snap back.',
  'Bent Over Barbell Row':     'Hinge at the hips until torso is roughly parallel to the floor, slight knee bend. Brace your core and keep your back flat throughout. Pull the bar to your lower chest, driving elbows back and squeezing the shoulder blades together at the top. Lower with control — don\'t let your back round on the descent.',
  'Cable Tricep Pushdowns':    'Set the cable to a high pulley with a rope or bar attachment. Keep elbows tucked at your sides throughout — they should not move. Push down to full extension and squeeze the triceps hard at the bottom. Return slowly, allowing a full stretch at the top before the next rep.',
};

// Local images — all commented out to use ExerciseDB API instead.
// Uncomment any entry to override the API with your own photo.
const EXERCISE_IMAGES = {
  // 'Incline Bench':           require('./assets/exercises/incline-bench.jpg'),
  // 'Seated Cable Fly':        require('./assets/exercises/seated-cable-fly.jpg'),
  // 'Weighted Pull Ups':       require('./assets/exercises/weighted-pull-ups.jpg'),
  // 'Cable Lateral Raise':     require('./assets/exercises/cable-lateral-raise.jpg'),
  // 'Deficit Pendlay Row':     require('./assets/exercises/deficit-pendlay-row.jpg'),
  // 'Barbell Hip Thrust':      require('./assets/exercises/barbell-hip-thrusts.jpg'),
  // 'Bulgarian Split Squat':   require('./assets/exercises/bulgarian-split-squat.jpg'),
  // 'Bench Press':             require('./assets/exercises/bench-press.jpg'),
  // 'Machine Shoulder Press':  require('./assets/exercises/shoulder-press.jpg'),
  // 'Pec Deck':                require('./assets/exercises/pec-deck.jpg'),
  // 'Overhead Extension':      require('./assets/exercises/Overhead Extension.jpg'),
  // 'Cable Kickback':          require('./assets/exercises/cable-kickbacks.jpg'),
  // 'Close Grip Lat Pulldown': require('./assets/exercises/close-grip-lat-pulldown.jpg'),
  // 'Chest-Supported Row':     require('./assets/exercises/chest-supported-row.jpg'),
  // 'Close-Grip Cable Row':    require('./assets/exercises/close-grip-cable-row.jpg'),
  // 'Reverse Cable Flyes':     require('./assets/exercises/reverse-cable-flyes.jpg'),
  // 'EZ-Bar Curl':             require('./assets/exercises/ez-bar-curl.jpg'),
  // 'Machine Preacher Curl':   require('./assets/exercises/machine-preacher-curl.jpg'),
  // 'Shrugs':                  require('./assets/exercises/shrugs.jpg'),
  // 'Seated Leg Curl':         require('./assets/exercises/seated-leg-curl.jpg'),
  // 'Hip Adduction':           require('./assets/exercises/hip-adduction.jpg'),
  // 'Linear Hack Squat':       require('./assets/exercises/linear-hack-squat.jpg'),
  // 'Back Squat':              require('./assets/exercises/back-squat.jpg'),
  // 'Romanian Deadlift':       require('./assets/exercises/romanian-deadlift.jpg'),
  // 'Leg Press':               require('./assets/exercises/leg-press.jpg'),
  // 'Leg Extension':           require('./assets/exercises/leg-extension.jpg'),
  // 'Leg Extensions':          require('./assets/exercises/leg-extension.jpg'),
  // 'Hip Abduction':           require('./assets/exercises/hip-abduction.jpg'),
  // 'Standing Calf Raise':     require('./assets/exercises/standing-calf-raise.jpg'),
  // 'Lying Leg Curl':          require('./assets/exercises/lying-leg-curl.jpg'),
  // 'Walking Lunges':          require('./assets/exercises/walking-lunges.jpg'),
  // 'Rear Delt Machine Fly':   require('./assets/exercises/rear-delt-machine-fly.jpg'),
  // 'Lat Pulldown':            require('./assets/exercises/lat-pulldown.jpg'),
  // 'Seated Cable Row':        require('./assets/exercises/seated-cable-row.jpg'),
  // 'Dumbbell Shoulder Press': require('./assets/exercises/dumbell-shoulder-press.jpg'),
};

// Maps app exercise names to their exact DB name + optional image index (default 0)
const EXERCISE_DB_ALIASES = {
  'Pec Deck':                    { name: 'butterfly', index: 1 },
  'Seated Lateral Raise':   { name: 'seated side lateral raise', index: 0 },
  'Barbell Back Squat':          { name: 'barbell full squat', index: 0 },
  'Lying Leg Curl':              { name: 'lying leg curls', index: 0 },
  'Seated Calf Raise':           { name: 'seated calf raise', index: 0 },
  'Bent Over Barbell Row':       { name: 'bent over barbell row', index: 0 },
  'Cable Tricep Pushdowns':      { name: 'reverse grip triceps pushdown', index: 0 },
};

const COMPOUND_KEYWORDS = ['bench', 'squat', 'deadlift', 'row', 'pull', 'press', 'lunge', 'hip thrust', 'dip', 'chin'];
function getRestSuggestion(exerciseName) {
  const n = cleanExerciseName(exerciseName).toLowerCase();
  return COMPOUND_KEYWORDS.some(k => n.includes(k)) ? 180 : 60;
}

function parseSetsReps(name) {
  const match = name.match(/(\d+)[×xX](\d+(?:-\d+)?)/);
  if (!match) return null;
  return { sets: match[1], reps: match[2] };
}

function cleanExerciseName(name) {
  return name
    .replace(/\s*\d+[×xX]\d+(-\d+)?\s*/g, '')
    .replace(/\s*\d+min\s*/g, '')
    .replace(/\s*\d+s\b/g, '')
    .replace(/^DB\s/i, 'Dumbbell ')
    .replace(/^BB\s/i, 'Barbell ')
    .replace(/\bOHP\b/g, 'Overhead Press')
    .replace(/\bEZ Bar\b/gi, 'Barbell')
    .trim();
}

function getExerciseEmoji(name) {
  const n = name.toLowerCase();
  if (n.includes('squat') || n.includes('lunge') || n.includes('leg') || n.includes('calf') || n.includes('nordic')) return '🦵';
  if (n.includes('bench') || n.includes('chest') || n.includes('push') || n.includes('dip') || n.includes('fly')) return '💪';
  if (n.includes('deadlift') || n.includes('row') || n.includes('pull') || n.includes('lat')) return '🏋️';
  if (n.includes('shoulder') || n.includes('press') || n.includes('lateral') || n.includes('raise') || n.includes('shrug')) return '🏋️';
  if (n.includes('curl') || n.includes('bicep') || n.includes('tricep') || n.includes('skull') || n.includes('kickback')) return '💪';
  if (n.includes('plank') || n.includes('crunch') || n.includes('ab') || n.includes('core') || n.includes('wheel') || n.includes('dragon')) return '🎯';
  if (n.includes('run') || n.includes('jog') || n.includes('sprint') || n.includes('cardio') || n.includes('jump') || n.includes('rope') || n.includes('burpee') || n.includes('bike') || n.includes('cycling')) return '🏃';
  if (n.includes('stretch') || n.includes('yoga') || n.includes('foam') || n.includes('pigeon') || n.includes('mobility')) return '🧘';
  return '🏋️';
}

const EXERCISE_DB_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

function ExerciseImage({ exerciseName, exerciseDbImages = {}, size = 120 }) {
  const [enlarged, setEnlarged] = useState(false);
  const [remoteAspectRatio, setRemoteAspectRatio] = useState(4 / 3);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const clean = cleanExerciseName(exerciseName);
  const localSource = EXERCISE_IMAGES[clean] ?? null;

  const dbKey = clean.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  function pickUrl(urls, index = 0) {
    if (!urls) return null;
    if (Array.isArray(urls)) return urls[index] ?? urls[0] ?? null;
    return urls;
  }

  let remoteUri = null;
  if (!localSource && Object.keys(exerciseDbImages).length > 0) {
    // 0. Explicit alias override (e.g. "Pec Deck (Butterfly)" → { name: 'butterfly', index: 1 })
    const alias = EXERCISE_DB_ALIASES[clean];
    if (alias) remoteUri = pickUrl(exerciseDbImages[alias.name], alias.index);
    // 1. Exact or pre-built substring match (e.g. "bench press" in DB)
    if (!remoteUri) remoteUri = pickUrl(exerciseDbImages[dbKey]);
    // 2. Reverse contains: find a DB key that our name contains (e.g. "cable fly" inside "seated cable fly")
    if (!remoteUri) {
      const match = Object.keys(exerciseDbImages).find(k => k.split(' ').length >= 2 && dbKey.includes(k));
      if (match) remoteUri = pickUrl(exerciseDbImages[match]);
    }
  }

  const source = localSource || (remoteUri ? { uri: remoteUri } : null);

  useEffect(() => {
    if (remoteUri) {
      Image.getSize(remoteUri, (w, h) => { if (w && h) setRemoteAspectRatio(w / h); }, () => {});
    }
  }, [remoteUri]);

  const thumbHeight = Math.round(size * (76 / 120));

  if (!source) {
    return (
      <View style={[styles.exImgBox, { width: size, height: thumbHeight }]}>
        <Text style={styles.exImgEmoji}>{getExerciseEmoji(exerciseName)}</Text>
      </View>
    );
  }

  let aspectRatio = remoteUri ? remoteAspectRatio : 4 / 3;
  if (localSource) {
    const info = Image.resolveAssetSource(localSource);
    aspectRatio = info && info.width && info.height ? info.width / info.height : 4 / 3;
  }
  const cardWidth = screenWidth - 40;
  const maxImgHeight = screenHeight * 0.65;
  const imgHeight = Math.min(cardWidth / aspectRatio, maxImgHeight);

  return (
    <>
      <TouchableOpacity onPress={() => setEnlarged(true)}>
        {(clean === 'Weighted Pull Ups' || clean === 'Machine Shoulder Press') ? (
          <View style={{ width: size, height: thumbHeight, borderRadius: 8, overflow: 'hidden' }}>
            <Image source={source} style={{ width: size, height: thumbHeight * 2 }} resizeMode="cover" />
          </View>
        ) : (
          <Image source={source} style={[styles.exImg, { width: size, height: thumbHeight }]} resizeMode="cover" />
        )}
      </TouchableOpacity>
      <Modal visible={enlarged} transparent animationType="fade">
        <TouchableOpacity style={styles.imgModalOverlay} onPress={() => setEnlarged(false)} activeOpacity={1}>
          <View style={styles.imgModalCard}>
            <Image source={source} style={[styles.imgModalFull, { height: imgHeight }]} resizeMode="contain" />
            <View style={styles.imgModalTextBox}>
              <Text style={styles.imgModalTitle}>{clean}</Text>
              {EXERCISE_NOTES[clean] && (
                <Text style={styles.imgModalNotes}>{EXERCISE_NOTES[clean]}</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}



function calculateTDEE(age, gender, heightFt, heightIn, weightLbs, activityLevel) {
  const totalInches = parseFloat(heightFt) * 12 + parseFloat(heightIn);
  const heightCm = totalInches * 2.54;
  const weightKg = parseFloat(weightLbs) * 0.453592;
  const a = parseFloat(age);
  const bmr = gender === 'Male'
    ? 10 * weightKg + 6.25 * heightCm - 5 * a + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * a - 161;
  const multipliers = {
    'Sedentary': 1.2,
    'Lightly Active': 1.375,
    'Moderately Active': 1.55,
    'Very Active': 1.725,
    'Extra Active': 1.9,
  };
  return Math.round(bmr * multipliers[activityLevel]);
}


function formatTime(s) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

function CircularProgress({ progress, size = 210, strokeWidth = 14 }) {
  const half = size / 2;
  const color = '#4ade80';
  const rightRotate = `${Math.min(progress, 0.5) * 360 - 180}deg`;
  const leftRotate = `${Math.max(progress - 0.5, 0) * 360}deg`;
  return (
    <View style={{ width: size, height: size }}>
      <View style={{ position: 'absolute', width: size, height: size, borderRadius: half, borderWidth: strokeWidth, borderColor: '#2a2a2a' }} />
      <View style={{ position: 'absolute', right: 0, width: half, height: size, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', left: -half, width: size, height: size, borderRadius: half, borderWidth: strokeWidth, borderColor: color, transform: [{ rotate: rightRotate }] }} />
      </View>
      {progress > 0.5 && (
        <View style={{ position: 'absolute', left: 0, width: half, height: size, overflow: 'hidden' }}>
          <View style={{ position: 'absolute', right: -half, width: size, height: size, borderRadius: half, borderWidth: strokeWidth, borderColor: color, transform: [{ rotate: leftRotate }] }} />
        </View>
      )}
    </View>
  );
}

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>Something went wrong</Text>
          <Text style={{ color: COLORS.muted, textAlign: 'center', marginBottom: 28 }}>
            An unexpected error occurred. Your data is safe — please try again.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: COLORS.accent, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 10 }}
            onPress={() => this.setState({ hasError: false })}
          >
            <Text style={{ color: COLORS.text, fontWeight: 'bold', fontSize: 16 }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

function Root() {
  const [textVal, setTextVal] = useState('');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [plan, setPlan] = useState(null);
  const [screen, setScreen] = useState('quiz');
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [logs, setLogs] = useState({});

  const [nutritionForm, setNutritionForm] = useState({ age: '', gender: '', heightFt: '', heightIn: '', weight: '', activityLevel: '' });
  const [nutritionResult, setNutritionResult] = useState(null);
  const [stretchImgModal, setStretchImgModal] = useState(null);
  const [user, setUser] = useState(null);
  const [restTimerDuration, setRestTimerDuration] = useState(60);
  const [restTimerRemaining, setRestTimerRemaining] = useState(60);
  const [restTimerRunning, setRestTimerRunning] = useState(false);
  const [restingForExercise, setRestingForExercise] = useState(null);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [sessionSets, setSessionSets] = useState([]);
  const [authForm, setAuthForm] = useState({ name: '', email: 'gbutton11@hotmail.com', password: 'Unicycle12!', gender: '' });
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [exerciseDbImages, setExerciseDbImages] = useState({});
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(1);
  const TOTAL_WEEKS = 8;

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('logs'),
      AsyncStorage.getItem('user'),
    ]).then(([logsVal, userVal]) => {
      if (logsVal) setLogs(JSON.parse(logsVal));
      if (userVal) {
        const savedUser = JSON.parse(userVal);
        setUser(savedUser);
        setAnswers({ name: savedUser.name });
        setScreen('login');
      } else {
        setScreen('register');
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    if (!restTimerRunning) return;
    if (restTimerRemaining <= 0) { setRestTimerRunning(false); return; }
    const interval = setInterval(() => {
      setRestTimerRemaining(r => {
        if (r <= 1) {
          setRestTimerRunning(false);
          setActiveExerciseIndex(i => i + 1);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [restTimerRunning, restTimerRemaining]);

  useEffect(() => {
    const CACHE_KEY = 'exerciseDbCache';
    const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

    function buildMap(data) {
      const exact = {};
      const entries = [];
      data.forEach(ex => {
        const key = ex.name.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
        if (ex.images && ex.images.length > 0) {
          const urls = ex.images.map(img => EXERCISE_DB_BASE + img);
          exact[key] = urls;
          entries.push({ key, urls });
        }
      });
      const map = { ...exact };
      entries.forEach(({ key, urls }) => {
        const words = key.split(' ');
        words.forEach((_, i) => {
          for (let len = words.length; len >= 2; len--) {
            const sub = words.slice(i, i + len).join(' ');
            if (!map[sub]) map[sub] = urls;
          }
        });
      });
      return map;
    }

    AsyncStorage.getItem(CACHE_KEY).then(cached => {
      if (cached) {
        const { timestamp, map } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setExerciseDbImages(map);
          return;
        }
      }
      fetch('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json')
        .then(r => r.json())
        .then(data => {
          const map = buildMap(data);
          setExerciseDbImages(map);
          AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), map }));
        })
        .catch(() => {});
    });
  }, []);

  function handleRegister() {
    const { name, email, password, gender } = authForm;
    if (!name || !email || !password || !gender) {
      setAuthError('Please fill in all fields.');
      return;
    }
    if (!email.includes('@')) {
      setAuthError('Please enter a valid email.');
      return;
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }
    const newUser = { name, email, password, gender };
    AsyncStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    setAnswers({ name });
    setAuthError('');
    setScreen('quiz');
  }

  function handleLogin() {
    const { email, password } = authForm;
    if (!email || !password) {
      setAuthError('Please enter your email and password.');
      return;
    }
    AsyncStorage.getItem('user').then(val => {
      if (!val) { setAuthError('No account found. Please register.'); return; }
      const saved = JSON.parse(val);
      if (saved.email !== email || saved.password !== password) {
        setAuthError('Incorrect email or password.');
        return;
      }
      setUser(saved);
      setAnswers({ name: saved.name });
      setAuthError('');
      setScreen('quiz');
    });
  }

  function handleLogout() {
    setUser(null);
    setAuthForm({ name: '', email: '', password: '', gender: '' });
    setAuthError('');
    setPlan(null);
    setAnswers({});
    setScreen('login');
  }

  function logKey(dayTitle, exercise) {
    return `${dayTitle}|${exercise}`;
  }

  function handleAnswer(value) {
    const key = QUESTIONS[step].key;
    const updated = { ...answers, [key]: value };
    setAnswers(updated);
    setTextVal('');

    if (key === 'goal' && value === 'Get a Nutrition Plan') {
      setScreen('nutrition');
      return;
    }

    if (key === 'goal' && (value === 'Building Muscle - Men' || value === 'Building Muscle - Women')) {
      setPlan(WORKOUT_PLANS[value]);
      AsyncStorage.getItem('user').then(val => {
        if (val) {
          const saved = JSON.parse(val);
          AsyncStorage.setItem('user', JSON.stringify({ ...saved, goal: value }));
        }
      });
      setScreen('plan');
      return;
    }
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    }
  }

  function restart() {
    setStep(0);
    setAnswers({});
    setPlan(null);
    setTextVal('');
    setScreen('quiz');
    setSelectedDay(null);
    setSelectedExercise(null);
    setLogs({});
    setNutritionForm({ age: '', gender: '', heightFt: '', heightIn: '', weight: '', activityLevel: '' });
    setNutritionResult(null);
  }

  function submitNutrition() {
    const { age, gender, heightFt, heightIn, weight, activityLevel } = nutritionForm;
    if (!age || !gender || !heightFt || !weight || !activityLevel) return;
    const tdee = calculateTDEE(age, gender, heightFt, heightIn || '0', weight, activityLevel);
    const cut = tdee - 500;
    const bulk = tdee + 300;
    const proteinG = Math.round(parseFloat(weight));
    setNutritionResult({ tdee, cut, bulk, proteinG, weight: parseFloat(weight) });
    setScreen('nutritionResults');
  }


  const question = QUESTIONS[step];

  function LogoutBtn() {
    return (
      <>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ position: 'absolute', top: 8, right: 0, padding: 20, zIndex: 10 }}>
          <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: '700', letterSpacing: 2 }}>⋯</Text>
        </TouchableOpacity>
        <Modal visible={menuVisible} transparent animationType="fade">
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setMenuVisible(false)}>
            <View style={{ position: 'absolute', top: 10, right: 8, backgroundColor: '#1c1c3a', borderRadius: 12, borderWidth: 1, borderColor: '#ffffff15', overflow: 'hidden', minWidth: 160 }}>
              <TouchableOpacity
                onPress={() => { setMenuVisible(false); handleLogout(); }}
                style={{ paddingVertical: 14, paddingHorizontal: 18 }}
              >
                <Text style={{ color: '#ff6b6b', fontSize: 15, fontWeight: '600' }}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </>
    );
  }

  // ── Register Screen ───────────────────────────────────────
  if (screen === 'register') {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start tracking your workouts</Text>
          <View style={styles.questionCard}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={COLORS.muted}
              value={authForm.name}
              onChangeText={v => setAuthForm(f => ({ ...f, name: v }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.muted}
              value={authForm.email}
              onChangeText={v => setAuthForm(f => ({ ...f, email: v }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.muted}
              value={authForm.password}
              onChangeText={v => setAuthForm(f => ({ ...f, password: v }))}
              secureTextEntry
            />
            <Text style={[styles.questionText, { fontSize: 15, marginTop: 8 }]}>Gender</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              {['Male', 'Female'].map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.button, { flex: 1, backgroundColor: authForm.gender === g ? COLORS.accent : COLORS.input }]}
                  onPress={() => setAuthForm(f => ({ ...f, gender: g }))}
                >
                  <Text style={styles.buttonText}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {authError ? <Text style={styles.authError}>{authError}</Text> : null}
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setAuthError(''); setScreen('login'); }} style={{ marginTop: 16, alignItems: 'center' }}>
              <Text style={{ color: COLORS.muted }}>Already have an account? <Text style={{ color: COLORS.accent }}>Log in</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── Login Screen ──────────────────────────────────────────
  if (screen === 'login') {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View style={{
              width: 90, height: 90, borderRadius: 45,
              backgroundColor: '#2a0a10',
              borderWidth: 2, borderColor: COLORS.accent,
              justifyContent: 'center', alignItems: 'center',
              shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20,
              elevation: 12,
            }}>
              <Text style={{ fontSize: 38 }}>🏋️</Text>
            </View>
          </View>

          <Text style={{ color: COLORS.text, fontSize: 30, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>Welcome Back</Text>
          <Text style={{ color: COLORS.muted, fontSize: 15, textAlign: 'center', marginBottom: 36 }}>Log in to continue</Text>

          {/* Email field */}
          <View style={styles.authField}>
            <Text style={{ color: COLORS.muted, fontSize: 16, marginRight: 12 }}>✉</Text>
            <TextInput
              style={styles.authInput}
              placeholder="Email"
              placeholderTextColor={COLORS.muted}
              value={authForm.email}
              onChangeText={v => setAuthForm(f => ({ ...f, email: v }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password field */}
          <View style={styles.authField}>
            <Text style={{ color: COLORS.muted, fontSize: 16, marginRight: 12 }}>🔒</Text>
            <TextInput
              style={[styles.authInput, { flex: 1 }]}
              placeholder="Password"
              placeholderTextColor={COLORS.muted}
              value={authForm.password}
              onChangeText={v => setAuthForm(f => ({ ...f, password: v }))}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={{ backgroundColor: COLORS.accent, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 }}
              onPress={() => setShowPassword(s => !s)}
            >
              <Text style={{ color: COLORS.text, fontSize: 12, fontWeight: '700' }}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          {authError ? <Text style={[styles.authError, { marginBottom: 12 }]}>{authError}</Text> : null}

          {/* Log In button */}
          <TouchableOpacity
            style={{ backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 17, alignItems: 'center', marginBottom: 20 }}
            onPress={handleLogin}
          >
            <Text style={{ color: COLORS.text, fontSize: 17, fontWeight: 'bold' }}>Log In</Text>
          </TouchableOpacity>

          {/* Forgot password */}
          <TouchableOpacity style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ color: COLORS.muted, fontSize: 14 }}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: '#2a2a4a', marginBottom: 20 }} />

          {/* Sign up link */}
          <TouchableOpacity onPress={() => { setAuthError(''); setScreen('register'); }} style={{ alignItems: 'center' }}>
            <Text style={{ color: COLORS.muted, fontSize: 14 }}>
              Don't have an account?{'  '}<Text style={{ color: COLORS.accent, fontWeight: '600' }}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── Week Tracker Card (shared) ───────────────────────────
  function WeekTrackerCard() {
    const workoutDays = (plan || []).filter(d => !d.day.includes('Rest'));
    const completedDays = workoutDays.filter(d =>
      d.exercises.some(e => (logs[logKey(d.day, e)] || []).length > 0)
    ).length;
    const progress = workoutDays.length > 0 ? completedDays / workoutDays.length : 0;
    const programProgress = Math.round(((currentWeek - 1) / TOTAL_WEEKS + progress / TOTAL_WEEKS) * 100);
    return (
      <View style={{ backgroundColor: '#1c1c3a88', borderWidth: 1, borderColor: '#ffffff0d', borderRadius: 14, padding: 14, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
            <Text style={{ color: COLORS.text, fontWeight: 'bold', fontSize: 18 }}>Week {currentWeek}</Text>
            <Text style={{ color: COLORS.muted, fontSize: 14 }}>of {TOTAL_WEEKS}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity onPress={() => setCurrentWeek(w => Math.max(1, w - 1))} style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: '#2a2a4a', alignItems: 'center', justifyContent: 'center', opacity: currentWeek > 1 ? 1 : 0.35 }}>
              <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '700', lineHeight: 22 }}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCurrentWeek(w => Math.min(TOTAL_WEEKS, w + 1))} style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: '#2a2a4a', alignItems: 'center', justifyContent: 'center', opacity: currentWeek < TOTAL_WEEKS ? 1 : 0.35 }}>
              <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '700', lineHeight: 22 }}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ height: 6, backgroundColor: '#2a2a4a', borderRadius: 3, marginBottom: 8 }}>
          <View style={{ height: 6, backgroundColor: '#4a90e2', borderRadius: 3, width: `${programProgress}%` }} />
        </View>
        <Text style={{ color: COLORS.muted, fontSize: 13, marginBottom: 2 }}>
          Program Progress: <Text style={{ color: COLORS.text, fontWeight: '600' }}>{programProgress}%</Text>
        </Text>
        <Text style={{ color: COLORS.muted, fontSize: 13 }}>
          <Text style={{ color: COLORS.text, fontWeight: '600' }}>{completedDays} / {workoutDays.length}</Text> Workouts Completed
        </Text>
      </View>
    );
  }

  // ── Quiz Screen ──────────────────────────────────────────
  if (screen === 'quiz') {
    return (
      <KeyboardAvoidingView style={[styles.container, { paddingTop: 70 }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {step > 0 ? (
            <TouchableOpacity onPress={() => setStep(step - 1)} style={styles.backBtn}>
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
          ) : <View />}
        </View>
        <LogoutBtn />
        <Text style={styles.title}>Workout Tracker</Text>
        <View style={styles.progress}>
          {QUESTIONS.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive, i < step && styles.dotDone]} />
          ))}
        </View>
        <Text style={styles.questionText}>{question.label}</Text>
        {question.type === 'text' && (
          <View style={styles.questionCard}>
            <TextInput
              style={styles.input}
              placeholder={question.placeholder}
              placeholderTextColor={COLORS.muted}
              value={textVal}
              onChangeText={setTextVal}
              returnKeyType="next"
              autoFocus
            />
            <TouchableOpacity style={styles.button} onPress={() => { if (textVal.trim()) handleAnswer(textVal.trim()); }}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}
        {question.type === 'choice' && (
          <View style={styles.choices}>
            {question.options.filter(opt => {
              if (opt === 'Building Muscle - Men' && user?.gender === 'Female') return false;
              if (opt === 'Building Muscle - Women' && user?.gender === 'Male') return false;
              return true;
            }).map(opt => {
              const meta = GOAL_META[opt];
              const label = opt.startsWith('Building Muscle') ? 'Build Muscle' : opt;
              return (
                <TouchableOpacity key={opt} style={styles.goalCard} onPress={() => handleAnswer(opt)}>
                  <Text style={styles.goalEmoji}>{meta?.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.goalTitle}>{label}</Text>
                    <Text style={styles.goalSubtitle}>{meta?.subtitle}</Text>
                  </View>
                  <Text style={styles.goalChevron}>›</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </KeyboardAvoidingView>
    );
  }

  // ── Nutrition Input Screen ────────────────────────────────
  if (screen === 'nutrition') {
    const activityOptions = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extra Active'];
    const allFilled = nutritionForm.age && nutritionForm.gender && nutritionForm.heightFt && nutritionForm.weight && nutritionForm.activityLevel;
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <LogoutBtn />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={() => { setStep(0); setScreen('quiz'); }} style={styles.backBtn}>
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Nutrition Plan</Text>
          <Text style={styles.subtitle}>Tell us about yourself</Text>

          <View style={styles.questionCard}>
            <Text style={[styles.sectionLabel, { textAlign: 'center', marginBottom: 16 }]}>TDEE Calculator</Text>
            <Text style={styles.fieldLabel}>Age</Text>
            <TextInput style={styles.input} placeholder="e.g. 25" placeholderTextColor={COLORS.muted}
              keyboardType="number-pad" value={nutritionForm.age}
              onChangeText={v => setNutritionForm(f => ({ ...f, age: v }))} />

            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.choices}>
              {['Male', 'Female'].map(g => (
                <TouchableOpacity key={g} style={[styles.choiceBtn, nutritionForm.gender === g && styles.choiceBtnActive]}
                  onPress={() => setNutritionForm(f => ({ ...f, gender: g }))}>
                  <Text style={styles.choiceText}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Height</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="ft" placeholderTextColor={COLORS.muted}
                keyboardType="number-pad" value={nutritionForm.heightFt}
                onChangeText={v => setNutritionForm(f => ({ ...f, heightFt: v }))} />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="in" placeholderTextColor={COLORS.muted}
                keyboardType="number-pad" value={nutritionForm.heightIn}
                onChangeText={v => setNutritionForm(f => ({ ...f, heightIn: v }))} />
            </View>

            <Text style={styles.fieldLabel}>Body Weight (lbs)</Text>
            <TextInput style={styles.input} placeholder="e.g. 180" placeholderTextColor={COLORS.muted}
              keyboardType="decimal-pad" value={nutritionForm.weight}
              onChangeText={v => setNutritionForm(f => ({ ...f, weight: v }))} />

            <Text style={styles.fieldLabel}>Activity Level</Text>
            <View style={styles.choices}>
              {activityOptions.map(a => (
                <TouchableOpacity key={a} style={[styles.choiceBtn, nutritionForm.activityLevel === a && styles.choiceBtnActive]}
                  onPress={() => setNutritionForm(f => ({ ...f, activityLevel: a }))}>
                  <Text style={styles.choiceText}>{a}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={[styles.button, { marginTop: 20, opacity: allFilled ? 1 : 0.4 }]}
              onPress={submitNutrition} disabled={!allFilled}>
              <Text style={styles.buttonText}>Calculate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={restart}>
              <Text style={styles.cancelText}>Start Over</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── Nutrition Results Screen ──────────────────────────────
  if (screen === 'nutritionResults' && nutritionResult) {
    const { tdee, cut, bulk, proteinG } = nutritionResult;
    const fatCutG = Math.round((cut * 0.25) / 9);
    const carbCutG = Math.round((cut - proteinG * 4 - fatCutG * 9) / 4);
    const fatBulkG = Math.round((bulk * 0.25) / 9);
    const carbBulkG = Math.round((bulk - proteinG * 4 - fatBulkG * 9) / 4);
    const fatMainG = Math.round((tdee * 0.25) / 9);
    const carbMainG = Math.round((tdee - proteinG * 4 - fatMainG * 9) / 4);

    const meals = [
      { name: 'Breakfast', pct: 0.25, foods: ['Eggs or egg whites', 'Oats or whole grain toast', 'Greek yogurt or cottage cheese', 'Fruit'] },
      { name: 'Mid-Morning Snack', pct: 0.10, foods: ['Protein shake', 'Rice cakes with peanut butter', 'Apple or banana'] },
      { name: 'Lunch', pct: 0.25, foods: ['Chicken breast, tuna, or lean beef', 'Brown rice or sweet potato', 'Vegetables & salad', 'Olive oil dressing'] },
      { name: 'Pre-Workout', pct: 0.15, foods: ['Oats with protein powder', 'Banana', 'Light carb source'] },
      { name: 'Post-Workout / Dinner', pct: 0.20, foods: ['Lean protein (chicken, fish, steak)', 'White or brown rice', 'Broccoli or green vegetables'] },
      { name: 'Evening Snack', pct: 0.05, foods: ['Casein protein or cottage cheese', 'Almonds or walnuts'] },
    ];

    return (
      <View style={styles.container}>
        <LogoutBtn />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={() => setScreen('nutrition')} style={styles.backBtn}>
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Your Nutrition Plan</Text>
          <Text style={styles.subtitle}>{answers.name} · {nutritionForm.weight} lbs · {nutritionForm.activityLevel}</Text>

          {/* TDEE Cards */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{tdee}</Text>
              <Text style={styles.statLabel}>TDEE (kcal)</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: COLORS.accent }]}>{cut}</Text>
              <Text style={styles.statLabel}>Cut (kcal)</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: COLORS.success }]}>{bulk}</Text>
              <Text style={styles.statLabel}>Bulk (kcal)</Text>
            </View>
          </View>

          {/* Macros Table */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Daily Macros Breakdown</Text>
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <Text style={[styles.tableCell, styles.tableHeaderCell, { flex: 2, textAlign: 'left' }]}>Goal</Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell, { flex: 2 }]}>Protein</Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell, { flex: 2 }]}>Carbs</Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell, { flex: 2 }]}>Fat</Text>
            </View>
            {[
              { label: 'Maintain', protein: proteinG, carbs: carbMainG, fat: fatMainG },
              { label: 'Cut', protein: proteinG, carbs: carbCutG, fat: fatCutG },
              { label: 'Bulk', protein: proteinG, carbs: carbBulkG, fat: fatBulkG },
            ].map((row, i) => (
              <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
                <Text style={[styles.tableCell, { flex: 2, textAlign: 'left' }]}>{row.label}</Text>
                <Text style={[styles.tableCell, { flex: 2, color: COLORS.accent }]}>{row.protein}g</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>{row.carbs}g</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>{row.fat}g</Text>
              </View>
            ))}
          </View>

          {/* Meal Plan */}
          <Text style={[styles.sectionLabel, { marginBottom: 10 }]}>Bodybuilding Meal Plan</Text>
          {meals.map((meal, i) => (
            <View key={i} style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.dayTitle}>{meal.name}</Text>
                <Text style={styles.exerciseCount}>{Math.round(tdee * meal.pct)} kcal</Text>
              </View>
              {meal.foods.map((f, j) => (
                <Text key={j} style={styles.mealFood}>· {f}</Text>
              ))}
            </View>
          ))}

          <TouchableOpacity style={[styles.button, { marginTop: 8 }]} onPress={restart}>
            <Text style={styles.buttonText}>Start Over</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }


  // ── Rest Timer Screen ────────────────────────────────────
  if (screen === 'restTimer') {
    const progress = restTimerRemaining / restTimerDuration;
    const durations = [30, 60, 90, 120];
    return (
      <View style={[styles.container, { alignItems: 'center' }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
          <TouchableOpacity onPress={() => { setRestTimerRunning(false); setScreen('day'); }} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Rest Timer</Text>

        {/* Duration selector */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 32 }}>
          {durations.map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.pill, { paddingHorizontal: 14, paddingVertical: 6, backgroundColor: restTimerDuration === d ? COLORS.accent : '#3a3a6a' }]}
              onPress={() => { setRestTimerDuration(d); setRestTimerRemaining(d); setRestTimerRunning(false); }}
            >
              <Text style={[styles.pillText, { color: COLORS.text }]}>{d}s</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Circular timer */}
        <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 40 }}>
          <CircularProgress progress={progress} />
          <View style={{ position: 'absolute', alignItems: 'center' }}>
            <Text style={{ color: COLORS.text, fontSize: 48, fontWeight: 'bold', letterSpacing: 2 }}>
              {formatTime(restTimerRemaining)}
            </Text>
            <Text style={{ color: COLORS.muted, fontSize: 13 }}>
              {restTimerRemaining === 0 ? 'Done!' : `Remaining`}
            </Text>
          </View>
        </View>

        {/* Controls */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <TouchableOpacity
            style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: '#2a2a4a', justifyContent: 'center', alignItems: 'center' }}
            onPress={() => { setRestTimerRemaining(restTimerDuration); setRestTimerRunning(false); }}
          >
            <Text style={{ fontSize: 26, color: COLORS.text }}>↺</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ width: 80, height: 80, borderRadius: 20, backgroundColor: '#4ade80', justifyContent: 'center', alignItems: 'center' }}
            onPress={() => setRestTimerRunning(r => !r)}
          >
            {restTimerRunning
              ? <View style={{ flexDirection: 'row', gap: 5 }}>
                  <View style={{ width: 8, height: 26, backgroundColor: '#1a1a2e', borderRadius: 2 }} />
                  <View style={{ width: 8, height: 26, backgroundColor: '#1a1a2e', borderRadius: 2 }} />
                </View>
              : <View style={{ width: 0, height: 0, borderTopWidth: 16, borderBottomWidth: 16, borderLeftWidth: 26, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: '#1a1a2e', marginLeft: 4 }} />
            }
          </TouchableOpacity>
          <TouchableOpacity
            style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: '#2a2a4a', justifyContent: 'center', alignItems: 'center' }}
            onPress={() => { setRestTimerRemaining(0); setRestTimerRunning(false); }}
          >
            <View style={{ width: 20, height: 20, backgroundColor: COLORS.text, borderRadius: 3 }} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Plan Overview Screen ─────────────────────────────────
  if (screen === 'plan') {
    return (
      <View style={[styles.container, { paddingTop: 70 }]}>
        <LogoutBtn />
        <TouchableOpacity onPress={restart} style={[styles.backBtn, { position: 'absolute', top: 20, left: 16, zIndex: 10 }]}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Workout Plan</Text>

        {/* Week Tracker Card */}
        <WeekTrackerCard />

        <FlatList
          data={plan}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => { setSelectedDay(item); setActiveExerciseIndex(0); setRestTimerRunning(false); setRestingForExercise(null); setScreen('day'); }}>
              <View style={styles.cardRow}>
                <Text style={styles.dayTitle}>{item.day}</Text>
                <Text style={styles.chevron}>›</Text>
              </View>
              <Text style={styles.exerciseCount}>{item.exercises.length} exercises</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  // ── Day Detail Screen ────────────────────────────────────
  if (screen === 'day') {
    const isRestDay = selectedDay.day.includes('Rest');
    const workoutExercises = isRestDay
      ? []
      : selectedDay.exercises.filter(e =>
          !e.includes('Full Body Stretching') && !e.includes('Full Body Foam Rolling') && !e.includes('Incline Walk')
        );
    const loggedCount = workoutExercises.filter(e => (logs[logKey(selectedDay.day, e)] || []).length > 0).length;
    const totalExercises = workoutExercises.length;
    const progressFraction = totalExercises > 0 ? loggedCount / totalExercises : 0;
    const estimatedMinutes = totalExercises * 8;

    function getSmartPill(exerciseName) {
      const data = logs[logKey(selectedDay.day, exerciseName)] || [];
      if (data.length === 0) return null;
      const latest = parseFloat(data[data.length - 1].weight);
      const allTime = Math.max(...data.map(d => parseFloat(d.weight)));
      const prev = data.length > 1 ? parseFloat(data[data.length - 2].weight) : null;
      if (data.length > 1 && latest >= allTime && latest > prev) {
        return { label: `🏆 PR: ${latest} lbs`, color: '#fbbf24', bg: '#3a2a00', border: '#fbbf24' };
      }
      if (prev !== null && latest > prev) {
        return { label: `↑ +${(latest - prev).toFixed(0)} lbs`, color: '#4ade80', bg: '#1a3a2a', border: '#4ade80' };
      }
      return { label: `∿ Last: ${latest} lbs`, color: COLORS.muted, bg: '#2a2a4a', border: null };
    }

    return (
      <View style={[styles.container, { paddingTop: 70 }]}>
        {/* Top nav row */}
        <LogoutBtn />
        <TouchableOpacity onPress={() => setScreen('plan')} style={[styles.backBtn, { position: 'absolute', top: 20, left: 16, zIndex: 10 }]}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={[styles.title, { marginBottom: 4 }]}>{selectedDay.day}</Text>
        {!isRestDay && (
          <Text style={{ color: COLORS.muted, fontSize: 13, textAlign: 'center', marginBottom: 10 }}>
            ⏱ {totalExercises} exercises  •  ~{estimatedMinutes} min
          </Text>
        )}

        {/* Week Tracker + Progress Ring row */}
        {!isRestDay && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <View style={{ flex: 1, backgroundColor: '#1c1c3a88', borderWidth: 1, borderColor: '#ffffff0d', borderRadius: 14, padding: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                  <Text style={{ color: COLORS.text, fontWeight: 'bold', fontSize: 15 }}>Week {currentWeek}</Text>
                  <Text style={{ color: COLORS.muted, fontSize: 12 }}>of {TOTAL_WEEKS}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <TouchableOpacity onPress={() => setCurrentWeek(w => Math.max(1, w - 1))} style={{ width: 24, height: 24, borderRadius: 5, backgroundColor: '#2a2a4a', alignItems: 'center', justifyContent: 'center', opacity: currentWeek > 1 ? 1 : 0.35 }}>
                    <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '700', lineHeight: 19 }}>‹</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setCurrentWeek(w => Math.min(TOTAL_WEEKS, w + 1))} style={{ width: 24, height: 24, borderRadius: 5, backgroundColor: '#2a2a4a', alignItems: 'center', justifyContent: 'center', opacity: currentWeek < TOTAL_WEEKS ? 1 : 0.35 }}>
                    <Text style={{ color: COLORS.text, fontSize: 15, fontWeight: '700', lineHeight: 19 }}>›</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ height: 4, backgroundColor: '#2a2a4a', borderRadius: 2, marginBottom: 6 }}>
                <View style={{ height: 4, backgroundColor: '#4a90e2', borderRadius: 2, width: `${Math.round(((currentWeek - 1) / TOTAL_WEEKS + (workoutExercises.filter(e => (logs[logKey(selectedDay.day, e)] || []).length > 0).length / Math.max(workoutExercises.length, 1)) / TOTAL_WEEKS) * 100)}%` }} />
              </View>
              <Text style={{ color: COLORS.muted, fontSize: 11 }}>
                <Text style={{ color: COLORS.text, fontWeight: '600' }}>{loggedCount} / {totalExercises}</Text> Exercises Logged
              </Text>
            </View>
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 70, height: 70 }}>
              <CircularProgress progress={progressFraction} size={70} strokeWidth={6} />
              <View style={{ position: 'absolute', alignItems: 'center' }}>
                <Text style={{ color: COLORS.text, fontSize: 12, fontWeight: 'bold' }}>{Math.round(progressFraction * 100)}%</Text>
                <Text style={{ color: COLORS.muted, fontSize: 9 }}>Complete</Text>
              </View>
            </View>
          </View>
        )}

        {/* Inline rest banner — always visible on workout days */}
        {!isRestDay && (() => {
          const activeEx = workoutExercises[activeExerciseIndex] ?? workoutExercises[0];
          const bannerName = restTimerRunning && restingForExercise
            ? cleanExerciseName(restingForExercise)
            : activeEx ? cleanExerciseName(activeEx) : '';
          const suggested = activeEx ? getRestSuggestion(activeEx) : 60;
          const progressWidth = restTimerRunning
            ? `${(restTimerRemaining / restTimerDuration) * 100}%`
            : '0%';

          return (
            <View style={styles.restBanner}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                <Text style={{ color: '#4ade80', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 }}>⏻  REST TIMER</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 12 }} numberOfLines={1}>
                  {bannerName}{' '}
                  <Text style={{ color: '#4ade80' }}>
                    {restTimerRunning ? `• ${formatTime(restTimerRemaining)}` : `• ${formatTime(suggested)}`}
                  </Text>
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {restTimerRunning ? (
                    <>
                      <TouchableOpacity
                        style={{ backgroundColor: '#2a2a3e', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7 }}
                        onPress={() => { setRestTimerRunning(false); setRestTimerRemaining(0); setRestingForExercise(null); }}
                      >
                        <Text style={{ color: COLORS.text, fontSize: 13, fontWeight: '600' }}>Skip</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{ backgroundColor: COLORS.accent, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7 }}
                        onPress={() => setRestTimerRemaining(r => Math.min(r + 30, restTimerDuration))}
                      >
                        <Text style={{ color: COLORS.text, fontSize: 13, fontWeight: '700' }}>+30s</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={{ backgroundColor: '#4ade80', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 7 }}
                      onPress={() => {
                        setRestingForExercise(activeEx);
                        setRestTimerDuration(suggested);
                        setRestTimerRemaining(suggested);
                        setRestTimerRunning(true);
                      }}
                    >
                      <Text style={{ color: '#000', fontSize: 13, fontWeight: '700' }}>Start</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <View style={{ height: 3, backgroundColor: '#1a2a1a', borderRadius: 2 }}>
                <View style={{ height: 3, backgroundColor: '#4ade80', borderRadius: 2, width: progressWidth }} />
              </View>
            </View>
          );
        })()}

        <View style={{ flex: 1 }}>
          <FlatList
            data={selectedDay.exercises}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item, index }) => {
              const entryLogs = logs[logKey(selectedDay.day, item)] || [];
              const isStretching = item.includes('Full Body Stretching');
              const isFoamRolling = item.includes('Full Body Foam Rolling');
              const isResting = restTimerRunning && restingForExercise === item;
              const isActive = !isRestDay && !isStretching && !isFoamRolling && index === activeExerciseIndex;
              const sr = parseSetsReps(item);
              const smartPill = (!isStretching && !isFoamRolling && !isRestDay) ? getSmartPill(item) : null;
              const restSecs = (!isStretching && !isFoamRolling && !isRestDay) ? getRestSuggestion(item) : null;
              const restLabel = restSecs === 180 ? '3 min rest' : restSecs === 60 ? '1 min rest' : null;
              const foamRollingItems = [
                { label: 'Upper Back', duration: '1 min', emoji: '🔵' },
                { label: 'Lats', duration: '45 sec each side', emoji: '🔵' },
                { label: 'Glutes', duration: '45 sec each side', emoji: '🔵' },
                { label: 'Hamstrings', duration: '1 min', emoji: '🔵' },
                { label: 'Quads', duration: '1 min', emoji: '🔵' },
                { label: 'Calves', duration: '45 sec each side', emoji: '🔵' },
              ];
              const stretchingItems = [
                { label: 'Forward Fold', duration: '45 sec', img: require('./assets/stretches/forward-fold.jpg') },
                { label: 'Hip Flexor', duration: '45 sec each side', img: require('./assets/stretches/hip-flexor.jpg') },
                { label: 'Figure 4', duration: '45 sec each side', img: require('./assets/stretches/figure-4.jpg') },
                { label: "Child's Pose", duration: '1 min', img: require('./assets/stretches/childs-pose.jpg') },
                { label: 'Chest Stretch', duration: '45 sec each side', img: require('./assets/stretches/chest-stretch.jpg') },
                { label: 'Spinal Twist', duration: '45 sec each side', img: require('./assets/stretches/spinal-twist.jpg') },
                { label: 'Deep Squat', duration: '1 min', img: require('./assets/stretches/Deep Squat.jpg') },
              ];
              return (
                <TouchableOpacity
                  style={[styles.exerciseCard, isActive && { borderLeftWidth: 3, borderLeftColor: COLORS.accent }, isResting && { borderColor: '#4ade8044', borderWidth: 1 }]}
                  onPress={() => {
                    if (!isStretching && !isFoamRolling && !isRestDay) {
                      setSelectedExercise(item);
                      setActiveExerciseIndex(index);
                      const sr = parseSetsReps(item);
                      const count = sr ? parseInt(sr.sets) : 3;
                      const lastLogs = logs[logKey(selectedDay.day, item)] || [];
                      const lastEntry = lastLogs.length > 0 ? lastLogs[lastLogs.length - 1] : null;
                      const fallbackReps = lastEntry?.reps || (sr ? sr.reps.split('-')[0] : '');
                      setSessionSets(Array.from({ length: count }, (_, idx) => ({
                        weight: lastEntry?.sets?.[idx]?.weight || lastEntry?.weight || '',
                        reps: lastEntry?.sets?.[idx]?.reps || fallbackReps,
                        completed: false,
                      })));
                      setScreen('progress');
                    }
                  }}
                  activeOpacity={(isStretching || isFoamRolling || isRestDay) ? 1 : 0.75}
                >
                  <View style={[styles.exerciseCardTop, (isStretching || isFoamRolling) && { justifyContent: 'center' }]}>
                    {!isStretching && !isFoamRolling && <ExerciseImage exerciseName={item} exerciseDbImages={exerciseDbImages} />}
                    <View style={[styles.exerciseCardInfo, (isStretching || isFoamRolling) && { alignItems: 'center' }]}>
                      <Text style={styles.exerciseName}>{cleanExerciseName(item)}</Text>
                      {sr && (
                        <View style={styles.pillRow}>
                          <View style={styles.pill}><Text style={styles.pillText}>{sr.sets} sets</Text></View>
                          <View style={styles.pill}><Text style={styles.pillText}>{sr.reps} reps</Text></View>
                          {smartPill && (
                            <View style={[styles.pill, { backgroundColor: smartPill.bg, borderWidth: smartPill.border ? 1 : 0, borderColor: smartPill.border || 'transparent' }]}>
                              <Text style={[styles.pillText, { color: smartPill.color }]}>{smartPill.label}</Text>
                            </View>
                          )}
                        </View>
                      )}
                      {!isRestDay && !isStretching && !isFoamRolling && (
                        isResting
                          ? <Text style={{ color: '#4ade80', fontSize: 12, fontWeight: '600', marginTop: 2 }}>Resting • {formatTime(restTimerRemaining)}</Text>
                          : entryLogs.length === 0
                            ? <Text style={styles.logCount}>No logs yet</Text>
                            : null
                      )}
                      {restLabel && !isResting && (
                        <Text style={{ color: COLORS.muted, fontSize: 11, marginTop: 2 }}>⏱ {restLabel}</Text>
                      )}
                    </View>
                    {!isStretching && !isFoamRolling && !isRestDay && (
                      <Text style={[styles.chevron, { fontSize: 22, color: COLORS.muted }]}>›</Text>
                    )}
                  </View>
                  {isFoamRolling && (
                    <View style={styles.stretchGrid}>
                      {foamRollingItems.map((s, i) => (
                        <View key={i} style={styles.stretchItem}>
                          <Text style={styles.stretchEmoji}>{s.emoji}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.stretchLabel}>{s.label}</Text>
                            <Text style={styles.stretchDuration}>{s.duration}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                  {isStretching && (
                    <View style={styles.stretchGrid}>
                      {stretchingItems.map((s, i) => (
                        <View key={i} style={styles.stretchItem}>
                          <TouchableOpacity onPress={() => setStretchImgModal(s)}>
                            <Image source={s.img} style={styles.stretchImg} resizeMode="cover" />
                          </TouchableOpacity>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.stretchLabel}>{s.label}</Text>
                            <Text style={styles.stretchDuration}>{s.duration}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>

        {/* Finish Workout bar */}
        {!isRestDay && (
          <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 12 }}>
            <TouchableOpacity
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 15, gap: 10 }}
              onPress={() => Alert.alert('Finish Workout', 'Great work! Workout complete.', [{ text: 'Done', onPress: () => setScreen('plan') }])}
            >
              <View style={{ width: 0, height: 0, borderTopWidth: 8, borderBottomWidth: 8, borderLeftWidth: 13, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: '#fff' }} />
              <Text style={{ color: COLORS.text, fontWeight: 'bold', fontSize: 16 }}>Finish Workout</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ width: 52, backgroundColor: '#2a2a4a', borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}
            >
              <Text style={{ fontSize: 20 }}>🚩</Text>
            </TouchableOpacity>
          </View>
        )}

        <Modal visible={!!stretchImgModal} transparent animationType="fade">
          <TouchableOpacity style={styles.imgModalOverlay} onPress={() => setStretchImgModal(null)} activeOpacity={1}>
            <View style={styles.imgModalCard}>
              <Image source={stretchImgModal?.img} style={{ width: '100%', height: 280, borderTopLeftRadius: 12, borderTopRightRadius: 12 }} resizeMode="cover" />
              <View style={styles.imgModalTextBox}>
                <Text style={styles.imgModalTitle}>{stretchImgModal?.label}</Text>
                <Text style={styles.imgModalNotes}>{stretchImgModal?.duration}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  // ── Progress Screen ──────────────────────────────────────
  if (screen === 'progress') {
    const data = logs[logKey(selectedDay.day, selectedExercise)] || [];
    const latest = data.length > 0 ? data[data.length - 1].weight : null;
    const first = data.length > 1 ? data[0].weight : null;
    const totalChange = first && latest ? (parseFloat(latest) - parseFloat(first)).toFixed(1) : null;

    return (
      <View style={styles.container}>
        <LogoutBtn />
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => setScreen('day')} style={styles.backBtn}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
        </View>

        {/* Rest timer banner on progress screen */}
        {(() => {
          const suggested = getRestSuggestion(selectedExercise);
          const isRunning = restTimerRunning && restingForExercise === selectedExercise;
          const progressWidth = isRunning ? `${(restTimerRemaining / restTimerDuration) * 100}%` : '0%';
          return (
            <View style={[styles.restBanner, { marginBottom: 8 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                <Text style={{ color: '#4ade80', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 }}>⏻  REST TIMER</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 12 }} numberOfLines={1}>
                  {cleanExerciseName(selectedExercise)}{' '}
                  <Text style={{ color: '#4ade80' }}>
                    {isRunning ? `• ${formatTime(restTimerRemaining)}` : `• ${formatTime(suggested)}`}
                  </Text>
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {isRunning ? (
                    <>
                      <TouchableOpacity
                        style={{ backgroundColor: '#2a2a3e', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7 }}
                        onPress={() => { setRestTimerRunning(false); setRestTimerRemaining(0); setRestingForExercise(null); }}
                      >
                        <Text style={{ color: COLORS.text, fontSize: 13, fontWeight: '600' }}>Skip</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{ backgroundColor: COLORS.accent, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7 }}
                        onPress={() => setRestTimerRemaining(r => Math.min(r + 30, restTimerDuration))}
                      >
                        <Text style={{ color: COLORS.text, fontSize: 13, fontWeight: '700' }}>+30s</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={{ backgroundColor: '#4ade80', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 7 }}
                      onPress={() => {
                        setRestingForExercise(selectedExercise);
                        setRestTimerDuration(suggested);
                        setRestTimerRemaining(suggested);
                        setRestTimerRunning(true);
                      }}
                    >
                      <Text style={{ color: '#000', fontSize: 13, fontWeight: '700' }}>Start</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <View style={{ height: 3, backgroundColor: '#1a2a1a', borderRadius: 2 }}>
                <View style={{ height: 3, backgroundColor: '#4ade80', borderRadius: 2, width: progressWidth }} />
              </View>
            </View>
          );
        })()}

        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.progressHeader}>
            <ExerciseImage exerciseName={selectedExercise} exerciseDbImages={exerciseDbImages} size={160} />
            <View style={{ flex: 1 }}>
              <Text style={styles.title2}>{cleanExerciseName(selectedExercise)}</Text>
              {parseSetsReps(selectedExercise) && (
                <View style={[styles.pillRow, { marginTop: 6 }]}>
                  <View style={styles.pill}><Text style={styles.pillText}>{parseSetsReps(selectedExercise).sets} sets</Text></View>
                  <View style={styles.pill}><Text style={styles.pillText}>{parseSetsReps(selectedExercise).reps} reps</Text></View>
                </View>
              )}
            </View>
          </View>

          {/* Stats Row */}
          {data.length > 0 && (
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{latest}</Text>
                <Text style={styles.statLabel}>Latest</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{data.length}</Text>
                <Text style={styles.statLabel}>Weeks</Text>
              </View>
              {totalChange !== null && (
                <View style={styles.statCard}>
                  <Text style={[styles.statValue, { color: parseFloat(totalChange) >= 0 ? COLORS.success : COLORS.accent }]}>
                    {parseFloat(totalChange) >= 0 ? '+' : ''}{totalChange}
                  </Text>
                  <Text style={styles.statLabel}>Total Change</Text>
                </View>
              )}
            </View>
          )}

          {/* Log Sets */}
          <View style={{ backgroundColor: '#1c1c3a55', borderWidth: 1, borderColor: '#ffffff0d', borderRadius: 14, padding: 14, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <Text style={{ color: COLORS.text, fontWeight: 'bold', fontSize: 16 }}>Log Sets</Text>
                {data.length > 0 && <Text style={{ color: COLORS.muted, fontSize: 11 }}>(last week's data)</Text>}
              </View>
              <TouchableOpacity
                onPress={() => {
                  const sr = parseSetsReps(selectedExercise);
                  const count = sr ? parseInt(sr.sets) : 3;
                  const lastLogs = logs[logKey(selectedDay.day, selectedExercise)] || [];
                  const lastEntry = lastLogs.length > 0 ? lastLogs[lastLogs.length - 1] : null;
                  const fallbackReps = lastEntry?.reps || (sr ? sr.reps.split('-')[0] : '');
                  setSessionSets(Array.from({ length: count }, (_, idx) => ({
                    weight: lastEntry?.sets?.[idx]?.weight || lastEntry?.weight || '',
                    reps: lastEntry?.sets?.[idx]?.reps || fallbackReps,
                    completed: false,
                  })));
                }}
              >
                <Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: '600' }}>Reset</Text>
              </TouchableOpacity>
            </View>
            {sessionSets.map((set, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 6 }}>
                <View style={{ backgroundColor: COLORS.accent, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3, minWidth: 44, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>SET {i + 1}</Text>
                </View>
                {set.completed ? (
                  <>
                    <Text style={{ color: COLORS.text, fontSize: 13, flex: 1 }}>{set.weight} lbs × {set.reps} reps</Text>
                    <Text style={{ color: COLORS.muted, fontSize: 12, marginRight: 6 }}>{set.weight} / {set.reps}</Text>
                    <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: '#4ade80', justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ color: '#000', fontSize: 13, fontWeight: 'bold' }}>✓</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 0 }}>
                      <TouchableOpacity
                        style={{ backgroundColor: '#2a2a4a', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 }}
                        onPress={() => {
                          const s = [...sessionSets];
                          s[i] = { ...s[i], weight: String(Math.max(0, (parseFloat(s[i].weight) || 0) - 5)) };
                          setSessionSets(s);
                        }}
                      >
                        <Text style={{ color: COLORS.accent, fontSize: 10 }}>−5</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{ backgroundColor: '#2a2a4a', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 }}
                        onPress={() => {
                          const s = [...sessionSets];
                          s[i] = { ...s[i], weight: String((parseFloat(s[i].weight) || 0) + 5) };
                          setSessionSets(s);
                        }}
                      >
                        <Text style={{ color: '#4ade80', fontSize: 10 }}>+5</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={{ color: COLORS.text, fontSize: 13, backgroundColor: '#2a2a4a', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 4, width: 46, textAlign: 'center' }}
                        keyboardType="decimal-pad"
                        value={set.weight}
                        onChangeText={v => { const s = [...sessionSets]; s[i] = { ...s[i], weight: v }; setSessionSets(s); }}
                        placeholder="lbs"
                        placeholderTextColor={COLORS.muted}
                      />
                    </View>
                    <Text style={{ color: COLORS.muted, fontSize: 10 }}>lbs ×</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 0 }}>
                      <TouchableOpacity
                        style={{ backgroundColor: '#2a2a4a', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 }}
                        onPress={() => { const s = [...sessionSets]; s[i] = { ...s[i], reps: String(Math.max(0, (parseInt(s[i].reps) || 0) - 1)) }; setSessionSets(s); }}
                      >
                        <Text style={{ color: COLORS.accent, fontSize: 12 }}>−1</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{ backgroundColor: '#2a2a4a', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 }}
                        onPress={() => { const s = [...sessionSets]; s[i] = { ...s[i], reps: String((parseInt(s[i].reps) || 0) + 1) }; setSessionSets(s); }}
                      >
                        <Text style={{ color: '#4ade80', fontSize: 12 }}>+1</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={{ color: COLORS.text, fontSize: 13, backgroundColor: '#2a2a4a', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 4, width: 38, textAlign: 'center' }}
                        keyboardType="number-pad"
                        value={set.reps}
                        onChangeText={v => { const s = [...sessionSets]; s[i] = { ...s[i], reps: v }; setSessionSets(s); }}
                        placeholder="reps"
                        placeholderTextColor={COLORS.muted}
                      />
                    </View>
                    <Text style={{ color: COLORS.muted, fontSize: 12 }}>Reps</Text>
                    <TouchableOpacity
                      style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: COLORS.muted, justifyContent: 'center', alignItems: 'center' }}
                      onPress={() => {
                        if (set.weight && set.reps) {
                          const s = [...sessionSets];
                          s[i] = { ...s[i], completed: true };
                          if (i + 1 < s.length && !s[i + 1].completed && !s[i + 1].weight) {
                            s[i + 1] = { ...s[i + 1], weight: set.weight };
                          }
                          setSessionSets(s);
                          const suggested = getRestSuggestion(selectedExercise);
                          setRestingForExercise(selectedExercise);
                          setRestTimerDuration(suggested);
                          setRestTimerRemaining(suggested);
                          setRestTimerRunning(true);
                        }
                      }}
                    />
                  </>
                )}
              </View>
            ))}
            <TouchableOpacity
              style={{ backgroundColor: COLORS.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 6 }}
              onPress={() => {
                const completed = sessionSets.filter(s => s.completed);
                if (completed.length === 0) return;
                const maxWeight = Math.max(...completed.map(s => parseFloat(s.weight) || 0));
                const bestSet = completed.find(s => parseFloat(s.weight) === maxWeight) || completed[completed.length - 1];
                const key = logKey(selectedDay.day, selectedExercise);
                const existing = logs[key] || [];
                const allSets = sessionSets.map((s, idx) => s.completed ? { weight: s.weight, reps: s.reps } : (existing[existing.length - 1]?.sets?.[idx] || { weight: '', reps: '' }));
                setLogs(prev => ({ ...prev, [key]: [...existing, { week: existing.length + 1, weight: String(maxWeight), reps: bestSet.reps, sets: allSets }] }));
                const sr = parseSetsReps(selectedExercise);
                const count = sr ? parseInt(sr.sets) : 3;
                setSessionSets(Array.from({ length: count }, (_, idx) => ({ weight: allSets[idx]?.weight || String(maxWeight), reps: allSets[idx]?.reps || bestSet.reps, completed: false })));
              }}
            >
              <Text style={{ color: COLORS.text, fontWeight: 'bold', fontSize: 15 }}>Save Sets</Text>
            </TouchableOpacity>
          </View>

          {/* Log History */}
          {data.length > 0 ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>Log History</Text>
                <TouchableOpacity
                  onPress={() => Alert.alert(
                    'Clear Log History',
                    `Are you sure you want to clear all log history for ${cleanExerciseName(selectedExercise)}? This cannot be undone.`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Clear', style: 'destructive', onPress: () => {
                        setLogs(prev => ({ ...prev, [logKey(selectedDay.day, selectedExercise)]: [] }));
                        setSessionSets(s => s.map(set => ({ ...set, weight: '', completed: false })));
                      }},
                    ]
                  )}
                >
                  <Text style={{ color: COLORS.accent, fontSize: 13, fontWeight: '600' }}>Clear</Text>
                </TouchableOpacity>
              </View>
            {data.slice().reverse().map((entry, revIdx) => {
              const i = data.length - 1 - revIdx;
              const sets = entry.sets || [];
              const topSet = sets.length > 0 ? sets.reduce((best, s) => (parseFloat(s.weight) || 0) >= (parseFloat(best.weight) || 0) ? s : best, sets[0]) : { weight: entry.weight, reps: entry.reps };
              const volume = sets.reduce((sum, s) => sum + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0), 0);
              const prevEntry = i > 0 ? data[i - 1] : null;
              const prevVolume = prevEntry?.sets ? prevEntry.sets.reduce((sum, s) => sum + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0), 0) : 0;
              const volumeChange = prevEntry && volume > 0 ? volume - prevVolume : null;
              const allVolumes = data.slice(0, i + 1).map(e => e.sets ? e.sets.reduce((sum, s) => sum + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0), 0) : 0);
              const isPR = volume > 0 && volume === Math.max(...allVolumes);
              const isFirst = i === 0;
              return (
                <View key={i} style={{ backgroundColor: '#1c1c3a88', borderWidth: 1, borderColor: '#ffffff0d', borderRadius: 14, padding: 14, marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                        <Text style={{ color: COLORS.text, fontWeight: 'bold', fontSize: 16 }}>Week {entry.week}</Text>
                        <Text style={{ color: COLORS.muted, fontSize: 12 }}>{cleanExerciseName(selectedExercise)}</Text>
                      </View>
                      {isPR && !isFirst && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                          <Text style={{ fontSize: 13 }}>🏆</Text>
                          <Text style={{ color: '#fbbf24', fontSize: 12, fontWeight: '700' }}>New PR</Text>
                        </View>
                      )}
                      {isFirst && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                          <Text style={{ fontSize: 13 }}>🏆</Text>
                          <Text style={{ color: '#fbbf24', fontSize: 12, fontWeight: '700' }}>First Entry</Text>
                        </View>
                      )}
                      {topSet && sets.length > 0 && (
                        <Text style={{ color: COLORS.muted, fontSize: 13, marginBottom: 2 }}>
                          Top Set <Text style={{ color: COLORS.text, fontWeight: 'bold' }}>{topSet.weight} × {topSet.reps}</Text> lbs
                        </Text>
                      )}
                      {volume > 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <Text style={{ color: COLORS.muted, fontSize: 13 }}>
                            Volume <Text style={{ color: COLORS.text, fontWeight: 'bold' }}>{volume.toLocaleString()}</Text> lbs
                          </Text>
                          {volumeChange !== null && (
                            <Text style={{ color: volumeChange >= 0 ? '#4ade80' : COLORS.accent, fontSize: 13, fontWeight: '700' }}>
                              {volumeChange >= 0 ? '+' : ''}{volumeChange} lb
                            </Text>
                          )}
                        </View>
                      )}
                      {sets.length > 0 && (
                        <Text style={{ color: COLORS.muted, fontSize: 11 }}>
                          {sets.map(s => `${s.weight}×${s.reps}`).join(' · ')}
                        </Text>
                      )}
                    </View>

                  </View>
                </View>
              );
            })}
            </>
          ) : null}
        </ScrollView>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14,
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.input },
  dotActive: { backgroundColor: COLORS.accent, width: 24 },
  dotDone: { backgroundColor: COLORS.success },
  questionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
  },
  questionText: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'left',
  },
  input: {
    backgroundColor: COLORS.input,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
  authError: { color: '#ff6b6b', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  authField: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e32', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 14 },
  authInput: { flex: 1, color: COLORS.text, fontSize: 15 },
  choices: { gap: 10 },
  choiceBtn: {
    backgroundColor: COLORS.input,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  choiceBtnActive: {
    backgroundColor: COLORS.accent,
  },
  choiceText: { color: COLORS.text, fontSize: 16 },
  goalCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c1c3a55', borderRadius: 14, padding: 16, gap: 14, borderWidth: 1, borderColor: '#ffffff10' },
  goalEmoji: { fontSize: 32 },
  goalTitle: { color: COLORS.text, fontSize: 17, fontWeight: 'bold' },
  goalSubtitle: { color: COLORS.muted, fontSize: 13, marginTop: 2 },
  goalChevron: { color: COLORS.muted, fontSize: 22, fontWeight: 'bold' },
  fieldLabel: { color: COLORS.muted, fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 4 },
  mealFood: { color: COLORS.muted, fontSize: 13, marginTop: 4, paddingLeft: 4 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dayTitle: { color: COLORS.accent, fontWeight: 'bold', fontSize: 15, flex: 1 },
  chevron: { color: COLORS.muted, fontSize: 24 },
  exerciseCount: { color: COLORS.muted, fontSize: 13, marginTop: 4 },
  backBtn: { marginBottom: 12, paddingRight: 80, paddingVertical: 16 },
  backText: { color: COLORS.text, fontSize: 44, fontWeight: '700', lineHeight: 48 },
  exerciseCard: {
    backgroundColor: '#1c1c3a55',
    borderWidth: 1,
    borderColor: '#ffffff0d',
    borderRadius: 12,
    padding: 11,
    marginBottom: 10,
  },
  exerciseCardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stretchGrid: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stretchItem: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '47%', backgroundColor: COLORS.input, borderRadius: 10, padding: 10 },
  stretchNumber: { color: COLORS.muted, fontSize: 16, fontWeight: 'bold', width: 22, textAlign: 'center' },
  stretchEmoji: { fontSize: 28 },
  stretchImg: { width: 64, height: 64, borderRadius: 8 },
  stretchLabel: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  stretchDuration: { color: COLORS.muted, fontSize: 11 },
  exerciseCardInfo: { flex: 1 },
  exImgBox: { width: 120, height: 76, borderRadius: 8, backgroundColor: COLORS.input, justifyContent: 'center', alignItems: 'center' },
  exImgEmoji: { fontSize: 30 },
  exImg: { width: 120, height: 76, borderRadius: 8, overflow: 'hidden' },
  progressImgRow: { alignItems: 'center', marginBottom: 16 },
  progressHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  title2: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  subtitle2: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  tableContainer: { backgroundColor: COLORS.card, borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12 },
  tableHeaderRow: { backgroundColor: COLORS.input },
  tableRowAlt: { backgroundColor: '#ffffff08' },
  tableCell: { fontSize: 13, color: COLORS.text, textAlign: 'center' },
  tableHeaderCell: { color: COLORS.muted, fontWeight: 'bold', fontSize: 12 },
  weekCol: { flex: 2, textAlign: 'left' },
  weightCol: { flex: 2, textAlign: 'center' },
  changeCol: { flex: 2, textAlign: 'center' },
  dateCol: { flex: 1, textAlign: 'right' },
  weightValue: { fontWeight: 'bold', color: COLORS.text },
  entryNum: { color: COLORS.muted, fontSize: 11 },
  exerciseName: { color: COLORS.text, fontSize: 13, fontWeight: 'bold', marginBottom: 2 },
  pillRow: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  pill: { backgroundColor: '#3a3a6a', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3 },
  pillText: { color: '#d0d0f0', fontSize: 11, fontWeight: '600' },
  logCount: { color: COLORS.muted, fontSize: 12, marginBottom: 10 },
  exerciseBtns: { flexDirection: 'row', gap: 8 },
  logBtn: {
    flex: 1,
    backgroundColor: COLORS.input,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  progressBtn: {
    backgroundColor: COLORS.success + '22',
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  logBtnText: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  restTimerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a3a2a', borderWidth: 1, borderColor: '#4ade80', borderRadius: 10, paddingVertical: 10, marginBottom: 12 },
  restTimerBtnText: { color: '#4ade80', fontWeight: '700', fontSize: 15 },
  floatBtn: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    flex: 0,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    padding: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: { color: COLORS.text, fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  modalSubtitle: { color: COLORS.muted, fontSize: 14, marginBottom: 16 },
  cancelBtn: { marginTop: 10, alignItems: 'center', padding: 10 },
  cancelText: { color: COLORS.muted, fontSize: 15 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  statValue: { color: COLORS.text, fontSize: 20, fontWeight: 'bold' },
  statLabel: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  chartContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: { color: COLORS.text, fontWeight: 'bold', fontSize: 14, marginBottom: 12 },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 160,
    gap: 8,
    paddingBottom: 4,
  },
  barCol: { alignItems: 'center', width: 52 },
  barWeightLabel: { color: COLORS.muted, fontSize: 10, marginBottom: 4 },
  bar: { width: 36, backgroundColor: COLORS.accent, borderRadius: 4 },
  barLatest: { backgroundColor: COLORS.success },
  weekLabel: { color: COLORS.muted, fontSize: 10, marginTop: 4 },
  emptyChart: { color: COLORS.muted, textAlign: 'center', fontSize: 13, padding: 16 },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
  },
  logWeek: { color: COLORS.muted, fontSize: 14 },
  logWeight: { color: COLORS.text, fontWeight: 'bold', fontSize: 14 },
  sectionLabel: { color: COLORS.text, fontWeight: 'bold', fontSize: 15, marginBottom: 8 },
  restBanner: {
    backgroundColor: '#1a1a2e',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  restBannerLabel: {
    color: '#4ade80',
    fontWeight: '700',
    fontSize: 13,
    flex: 1,
  },
  restBannerTime: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  imgModalOverlay: { flex: 1, backgroundColor: '#000000ee', justifyContent: 'center', alignItems: 'center', padding: 20 },
  imgModalCard: { width: '100%' },
  imgModalFull: { width: '100%', borderTopLeftRadius: 12, borderTopRightRadius: 12, overflow: 'hidden' },
  imgModalTextBox: { backgroundColor: '#ffffff', padding: 12, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, overflow: 'hidden' },
  imgModalTitle: { color: '#000000', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  imgModalNotes: { color: '#333333', fontSize: 13, lineHeight: 19 },
});

export default function App() {
  return (
    <ErrorBoundary>
      <LinearGradient
        colors={['#0d0d1a', '#090910', '#050508']}
        locations={[0, 0.6, 1]}
        start={{ x: 0.4, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={{ flex: 1 }}
      >
        <Root />
      </LinearGradient>
    </ErrorBoundary>
  );
}
