import { create } from 'zustand';

export type EyeSide = 'left' | 'right';
export type TestType = 'cover-uncover' | 'alternate-cover' | 'alternate-cover-prism' | 'simultaneous-prism';
export type MovementMode = 'iris_and_pupil' | 'iris_only' | 'pupil_only';
export type PathologyType = 'normal' | 'conjunctivitis' | 'jaundice' | 'subconjunctival_hemorrhage' | 'arcus' | 'cataract';

interface EyeState {
  // Eye parameters
  pupilSize: { left: number; right: number };
  irisColor: { left: string; right: string };
  irisTexture: { left: string; right: string };
  irisPatternIntensity: { left: number; right: number };
  eyeSize: { left: number; right: number };
  eyePosition: { 
    left: { x: number; y: number };
    right: { x: number; y: number };
  };
  
  // Iris and pupil movement
  irisPosition: {
    left: { x: number; y: number };
    right: { x: number; y: number };
  };
  pupilPosition: {
    left: { x: number; y: number };
    right: { x: number; y: number };
  };
  movementMode: MovementMode;
  
  dominantEye: EyeSide | null;
  
  // Eyelid parameters
  eyelidPosition: { left: number; right: number };
  eyelidCurvature: { left: number; right: number };
  enableBlinking: boolean;
  blinkFrequency: number; // Blinks per minute

  // Tear film parameters
  tearFilmVisible: { left: boolean; right: boolean };
  tearFilmIntensity: { left: number; right: number };
  
  // Pathology parameters
  pathologyType: { left: PathologyType; right: PathologyType };
  pathologyIntensity: { left: number; right: number };
  
  // Disease/condition parameters
  esotropia: number; // Inward eye deviation
  exotropia: number; // Outward eye deviation
  hypertropia: number; // Upward eye deviation
  hypotropia: number; // Downward eye deviation
  esophoria: number; // Latent inward deviation
  exophoria: number; // Latent outward deviation
  hyperphoria: number; // Latent upward deviation
  hypophoria: number; // Latent downward deviation
  
  // Test parameters
  activeTool: 'occluder' | 'prism' | 'target' | 'none';
  occluderPosition: EyeSide | null;
  prismValue: number;
  prismAxis: number;
  currentTest: TestType;
  
  // Actions
  setPupilSize: (eye: EyeSide, size: number) => void;
  setIrisColor: (eye: EyeSide, color: string) => void;
  setIrisTexture: (eye: EyeSide, texture: string) => void;
  setIrisPatternIntensity: (eye: EyeSide, intensity: number) => void;
  setEyeSize: (eye: EyeSide, size: number) => void;
  setEyePosition: (eye: EyeSide, position: { x: number; y: number }) => void;
  setIrisPosition: (eye: EyeSide, position: { x: number; y: number }) => void;
  setPupilPosition: (eye: EyeSide, position: { x: number; y: number }) => void;
  setMovementMode: (mode: MovementMode) => void;
  moveEyeComponents: (eye: EyeSide, delta: { x: number; y: number }) => void;
  setEyelidPosition: (eye: EyeSide, position: number) => void;
  setEyelidCurvature: (eye: EyeSide, curvature: number) => void;
  setEnableBlinking: (enabled: boolean) => void;
  setBlinkFrequency: (frequency: number) => void;
  setTearFilmVisible: (eye: EyeSide, visible: boolean) => void;
  setTearFilmIntensity: (eye: EyeSide, intensity: number) => void;
  setPathologyType: (eye: EyeSide, type: PathologyType) => void;
  setPathologyIntensity: (eye: EyeSide, intensity: number) => void;
  setDominantEye: (eye: EyeSide | null) => void;
  setDeviation: (type: string, value: number) => void;
  setActiveTool: (tool: 'occluder' | 'prism' | 'target' | 'none') => void;
  setOccluderPosition: (position: EyeSide | null) => void;
  setPrismValue: (value: number) => void;
  setPrismAxis: (degrees: number) => void;
  setCurrentTest: (test: TestType) => void;
  resetEyes: () => void;
  mirrorEyeSettings: (fromEye: EyeSide) => void;
  saveConfiguration: (name: string) => void;
  loadConfiguration: (name: string) => void;
  getSavedConfigurations: () => string[];
}

const DEFAULT_PUPIL_SIZE = 4;
const DEFAULT_IRIS_COLOR = '#3c7fb1';
const DEFAULT_IRIS_TEXTURE = 'radial';
const DEFAULT_IRIS_PATTERN_INTENSITY = 0.7;
const DEFAULT_EYE_SIZE = 1.0;
const DEFAULT_EYELID_POSITION = 1.0;
const DEFAULT_EYELID_CURVATURE = 0.5;
const DEFAULT_BLINK_FREQUENCY = 15; // 15 blinks per minute is average

const useEyeStore = create<EyeState>((set, get) => ({
  // Initial state
  pupilSize: { left: DEFAULT_PUPIL_SIZE, right: DEFAULT_PUPIL_SIZE },
  irisColor: { left: DEFAULT_IRIS_COLOR, right: DEFAULT_IRIS_COLOR },
  irisTexture: { left: DEFAULT_IRIS_TEXTURE, right: DEFAULT_IRIS_TEXTURE },
  irisPatternIntensity: { left: DEFAULT_IRIS_PATTERN_INTENSITY, right: DEFAULT_IRIS_PATTERN_INTENSITY },
  eyeSize: { left: DEFAULT_EYE_SIZE, right: DEFAULT_EYE_SIZE },
  eyePosition: { 
    left: { x: 0, y: 0 },
    right: { x: 0, y: 0 }
  },
  
  // Iris and pupil positions
  irisPosition: {
    left: { x: 0, y: 0 },
    right: { x: 0, y: 0 }
  },
  pupilPosition: {
    left: { x: 0, y: 0 },
    right: { x: 0, y: 0 }
  },
  movementMode: 'iris_and_pupil',
  
  eyelidPosition: { left: DEFAULT_EYELID_POSITION, right: DEFAULT_EYELID_POSITION },
  eyelidCurvature: { left: DEFAULT_EYELID_CURVATURE, right: DEFAULT_EYELID_CURVATURE },
  enableBlinking: true,
  blinkFrequency: DEFAULT_BLINK_FREQUENCY,
  
  // Tear film parameters
  tearFilmVisible: { left: false, right: false },
  tearFilmIntensity: { left: 0.5, right: 0.5 },
  
  // Pathology parameters
  pathologyType: { left: 'normal', right: 'normal' },
  pathologyIntensity: { left: 0, right: 0 },
  
  dominantEye: null,
  
  // Disease/condition parameters
  esotropia: 0,
  exotropia: 0,
  hypertropia: 0,
  hypotropia: 0,
  esophoria: 0,
  exophoria: 0,
  hyperphoria: 0,
  hypophoria: 0,
  
  // Test parameters
  activeTool: 'none',
  occluderPosition: null,
  prismValue: 0,
  prismAxis: 0,
  currentTest: 'cover-uncover',
  
  // Actions
  setPupilSize: (eye, size) => 
    set((state) => ({
      pupilSize: { ...state.pupilSize, [eye]: size }
    })),
    
  setIrisColor: (eye, color) => 
    set((state) => ({
      irisColor: { ...state.irisColor, [eye]: color }
    })),
    
  setIrisTexture: (eye, texture) => 
    set((state) => ({
      irisTexture: { ...state.irisTexture, [eye]: texture }
    })),
    
  setIrisPatternIntensity: (eye, intensity) => 
    set((state) => ({
      irisPatternIntensity: { ...state.irisPatternIntensity, [eye]: intensity }
    })),
    
  setEyeSize: (eye, size) => 
    set((state) => ({
      eyeSize: { ...state.eyeSize, [eye]: size }
    })),
    
  setEyePosition: (eye, position) => 
    set((state) => ({
      eyePosition: { 
        ...state.eyePosition, 
        [eye]: position 
      }
    })),
    
  setIrisPosition: (eye, position) => 
    set((state) => ({
      irisPosition: { 
        ...state.irisPosition, 
        [eye]: position 
      },
      // If pupil is attached to iris, also update pupil position
      ...(state.movementMode === 'iris_and_pupil' ? {
        pupilPosition: {
          ...state.pupilPosition,
          [eye]: position
        }
      } : {})
    })),
    
  setPupilPosition: (eye, position) => 
    set((state) => {
      // Ensure pupil stays within iris bounds
      const irisPos = state.irisPosition[eye];
      const maxDistance = 0.4; // Maximum distance pupil can move from iris center
      
      // Calculate distance from iris center
      const dx = position.x - irisPos.x;
      const dy = position.y - irisPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // If pupil would move out of bounds, keep it at the edge of allowed area
      let finalPosition = position;
      if (distance > maxDistance) {
        const ratio = maxDistance / distance;
        finalPosition = {
          x: irisPos.x + dx * ratio,
          y: irisPos.y + dy * ratio
        };
      }
      
      return {
        pupilPosition: {
          ...state.pupilPosition,
          [eye]: finalPosition
        }
      };
    }),
    
  setMovementMode: (mode) => 
    set({ movementMode: mode }),
  
  moveEyeComponents: (eye, delta) => 
    set((state) => {
      const { movementMode } = state;
      
      // Define a type for potential updates
      type ComponentUpdates = {
        irisPosition?: {
          left: { x: number; y: number };
          right: { x: number; y: number };
        };
        pupilPosition?: {
          left: { x: number; y: number };
          right: { x: number; y: number };
        };
      };
      
      // Initialize updates with correct type
      const updates: ComponentUpdates = {};
      
      if (movementMode === 'iris_only' || movementMode === 'iris_and_pupil') {
        const newIrisPos = {
          x: state.irisPosition[eye].x + delta.x,
          y: state.irisPosition[eye].y + delta.y
        };
        
        // Constrain iris movement within eyeball
        // Increase max movement range from 0.5 to 0.8 for more extreme positioning
        const maxIrisMove = 0.8;
        newIrisPos.x = Math.max(-maxIrisMove, Math.min(maxIrisMove, newIrisPos.x));
        newIrisPos.y = Math.max(-maxIrisMove, Math.min(maxIrisMove, newIrisPos.y));
        
        updates.irisPosition = {
          ...state.irisPosition,
          [eye]: newIrisPos
        };
        
        // If pupil is attached to iris, update pupil position too
        if (movementMode === 'iris_and_pupil') {
          updates.pupilPosition = {
            ...state.pupilPosition,
            [eye]: newIrisPos
          };
        }
      }
      
      if (movementMode === 'pupil_only') {
        // Calculate new pupil position
        const newPupilPos = {
          x: state.pupilPosition[eye].x + delta.x,
          y: state.pupilPosition[eye].y + delta.y
        };
        
        // Ensure pupil stays within iris bounds
        const irisPos = state.irisPosition[eye];
        const maxDistance = 0.4; // Maximum distance pupil can move from iris center
        
        // Calculate distance from iris center
        const dx = newPupilPos.x - irisPos.x;
        const dy = newPupilPos.y - irisPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If pupil would move out of bounds, keep it at the edge of allowed area
        if (distance > maxDistance) {
          const ratio = maxDistance / distance;
          newPupilPos.x = irisPos.x + dx * ratio;
          newPupilPos.y = irisPos.y + dy * ratio;
        }
        
        updates.pupilPosition = {
          ...state.pupilPosition,
          [eye]: newPupilPos
        };
      }
      
      return updates;
    }),
    
  setEyelidPosition: (eye, position) => 
    set((state) => ({
      eyelidPosition: { ...state.eyelidPosition, [eye]: position }
    })),
    
  setEyelidCurvature: (eye, curvature) => 
    set((state) => ({
      eyelidCurvature: { ...state.eyelidCurvature, [eye]: curvature }
    })),
    
  setEnableBlinking: (enabled) => 
    set({ enableBlinking: enabled }),
    
  setBlinkFrequency: (frequency) => 
    set({ blinkFrequency: frequency }),
    
  setTearFilmVisible: (eye, visible) => 
    set((state) => ({
      tearFilmVisible: { ...state.tearFilmVisible, [eye]: visible }
    })),
    
  setTearFilmIntensity: (eye, intensity) => 
    set((state) => ({
      tearFilmIntensity: { ...state.tearFilmIntensity, [eye]: intensity }
    })),
    
  setPathologyType: (eye, type) => 
    set((state) => ({
      pathologyType: { ...state.pathologyType, [eye]: type }
    })),
    
  setPathologyIntensity: (eye, intensity) => 
    set((state) => ({
      pathologyIntensity: { ...state.pathologyIntensity, [eye]: intensity }
    })),
    
  setDominantEye: (eye) => 
    set({ dominantEye: eye }),
    
  setDeviation: (type, value) => 
    set({ [type]: value }),
    
  setActiveTool: (tool) => 
    set({ activeTool: tool }),
    
  setOccluderPosition: (position) => 
    set({ occluderPosition: position }),
    
  setPrismValue: (value) => 
    set({ prismValue: value }),
    
  setPrismAxis: (degrees) => 
    set({ prismAxis: degrees }),
    
  setCurrentTest: (test) => 
    set({ currentTest: test }),
    
  mirrorEyeSettings: (fromEye) => 
    set((state) => {
      const toEye = fromEye === 'left' ? 'right' : 'left';
      return {
        pupilSize: { ...state.pupilSize, [toEye]: state.pupilSize[fromEye] },
        irisColor: { ...state.irisColor, [toEye]: state.irisColor[fromEye] },
        irisTexture: { ...state.irisTexture, [toEye]: state.irisTexture[fromEye] },
        irisPatternIntensity: { ...state.irisPatternIntensity, [toEye]: state.irisPatternIntensity[fromEye] },
        eyeSize: { ...state.eyeSize, [toEye]: state.eyeSize[fromEye] },
        eyelidPosition: { ...state.eyelidPosition, [toEye]: state.eyelidPosition[fromEye] },
        eyelidCurvature: { ...state.eyelidCurvature, [toEye]: state.eyelidCurvature[fromEye] },
        irisPosition: { ...state.irisPosition, [toEye]: state.irisPosition[fromEye] },
        pupilPosition: { ...state.pupilPosition, [toEye]: state.pupilPosition[fromEye] },
        tearFilmVisible: { ...state.tearFilmVisible, [toEye]: state.tearFilmVisible[fromEye] },
        tearFilmIntensity: { ...state.tearFilmIntensity, [toEye]: state.tearFilmIntensity[fromEye] },
        pathologyType: { ...state.pathologyType, [toEye]: state.pathologyType[fromEye] },
        pathologyIntensity: { ...state.pathologyIntensity, [toEye]: state.pathologyIntensity[fromEye] }
      };
    }),

  saveConfiguration: (name) => {
    if (typeof window !== 'undefined') {
      const currentState = get();
      
      // Extract state to save (excluding functions)
      const stateToSave = {
        pupilSize: currentState.pupilSize,
        irisColor: currentState.irisColor,
        irisTexture: currentState.irisTexture,
        irisPatternIntensity: currentState.irisPatternIntensity,
        eyeSize: currentState.eyeSize,
        eyePosition: currentState.eyePosition,
        irisPosition: currentState.irisPosition,
        pupilPosition: currentState.pupilPosition,
        eyelidPosition: currentState.eyelidPosition,
        eyelidCurvature: currentState.eyelidCurvature,
        tearFilmVisible: currentState.tearFilmVisible,
        tearFilmIntensity: currentState.tearFilmIntensity,
        pathologyType: currentState.pathologyType,
        pathologyIntensity: currentState.pathologyIntensity,
        esotropia: currentState.esotropia,
        exotropia: currentState.exotropia,
        hypertropia: currentState.hypertropia,
        hypotropia: currentState.hypotropia,
        esophoria: currentState.esophoria,
        exophoria: currentState.exophoria,
        hyperphoria: currentState.hyperphoria,
        hypophoria: currentState.hypophoria
      };
      
      // Get existing saved configurations
      const existingConfigs = JSON.parse(localStorage.getItem('eyeConfigurations') || '{}');
      
      // Add new configuration
      existingConfigs[name] = stateToSave;
      
      // Save to local storage
      localStorage.setItem('eyeConfigurations', JSON.stringify(existingConfigs));
    }
  },
  
  loadConfiguration: (name) => {
    if (typeof window !== 'undefined') {
      const savedConfigs = JSON.parse(localStorage.getItem('eyeConfigurations') || '{}');
      const config = savedConfigs[name];
      
      if (config) {
        set({
          ...config,
          // Keep the current values for these properties
          enableBlinking: get().enableBlinking,
          blinkFrequency: get().blinkFrequency,
          movementMode: get().movementMode,
          dominantEye: get().dominantEye,
          activeTool: get().activeTool,
          occluderPosition: get().occluderPosition,
          prismValue: get().prismValue,
          prismAxis: get().prismAxis,
          currentTest: get().currentTest
        });
      }
    }
  },
  
  getSavedConfigurations: () => {
    if (typeof window !== 'undefined') {
      const savedConfigs = JSON.parse(localStorage.getItem('eyeConfigurations') || '{}');
      return Object.keys(savedConfigs);
    }
    return [];
  },
    
  resetEyes: () => 
    set({
      pupilSize: { left: DEFAULT_PUPIL_SIZE, right: DEFAULT_PUPIL_SIZE },
      irisColor: { left: DEFAULT_IRIS_COLOR, right: DEFAULT_IRIS_COLOR },
      irisTexture: { left: DEFAULT_IRIS_TEXTURE, right: DEFAULT_IRIS_TEXTURE },
      irisPatternIntensity: { left: DEFAULT_IRIS_PATTERN_INTENSITY, right: DEFAULT_IRIS_PATTERN_INTENSITY },
      eyeSize: { left: DEFAULT_EYE_SIZE, right: DEFAULT_EYE_SIZE },
      eyePosition: { 
        left: { x: 0, y: 0 },
        right: { x: 0, y: 0 }
      },
      irisPosition: {
        left: { x: 0, y: 0 },
        right: { x: 0, y: 0 }
      },
      pupilPosition: {
        left: { x: 0, y: 0 },
        right: { x: 0, y: 0 }
      },
      movementMode: 'iris_and_pupil',
      eyelidPosition: { left: DEFAULT_EYELID_POSITION, right: DEFAULT_EYELID_POSITION },
      eyelidCurvature: { left: DEFAULT_EYELID_CURVATURE, right: DEFAULT_EYELID_CURVATURE },
      enableBlinking: true,
      blinkFrequency: DEFAULT_BLINK_FREQUENCY,
      tearFilmVisible: { left: false, right: false },
      tearFilmIntensity: { left: 0.5, right: 0.5 },
      pathologyType: { left: 'normal', right: 'normal' },
      pathologyIntensity: { left: 0, right: 0 },
      dominantEye: null,
      esotropia: 0,
      exotropia: 0,
      hypertropia: 0,
      hypotropia: 0,
      esophoria: 0,
      exophoria: 0,
      hyperphoria: 0,
      hypophoria: 0,
      occluderPosition: null,
      prismValue: 0,
      prismAxis: 0
    })
}));

export default useEyeStore;