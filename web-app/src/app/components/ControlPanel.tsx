import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import useEyeStore, { EyeSide, PathologyType } from '../store/useEyeStore';
import type { ConfigItem } from '../store/useEyeStore';
import EyeMovementControl from './EyeMovementControl';

const ControlContainer = styled.div`
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  max-height: 100%;
`;

const TabGroup = styled.div`
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 1rem;
`;

const Tab = styled.button<{ active: boolean }>`
  background: ${props => props.active ? '#fff' : 'transparent'};
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  border-bottom: ${props => props.active ? '2px solid #3b82f6' : 'none'};
  color: ${props => props.active ? '#3b82f6' : '#333'};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #eee;
  }
`;

const ControlGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const GroupTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
`;

const ControlRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  justify-content: space-between;
`;

const Label = styled.label`
  font-size: 0.875rem;
  margin-right: 1rem;
  color: #555;
  flex: 1;
`;

const SliderContainer = styled.div`
  flex: 2;
  display: flex;
  align-items: center;
`;

const Slider = styled.input`
  flex: 1;
  margin-right: 0.5rem;
`;

const Value = styled.span`
  font-size: 0.75rem;
  color: #666;
  width: 2.5rem;
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button`
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #2563eb;
  }

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: #6b7280;

  &:hover {
    background-color: #4b5563;
  }
`;

const ResetButton = styled(Button)`
  background-color: #ef4444;

  &:hover {
    background-color: #dc2626;
  }
`;

const ColorPickerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 2;
`;

const ColorInput = styled.input`
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
`;

const Select = styled.select`
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  flex: 2;
`;

const MirrorButton = styled.button`
  background-color: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  
  &:hover {
    background-color: #eee;
  }
`;

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  input {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
  
  label {
    font-size: 0.875rem;
    color: #555;
    cursor: pointer;
  }
`;

const DeleteButton = styled(Button)`
  background-color: #ef4444;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;

  &:hover {
    background-color: #dc2626;
  }
`;

const ConfigList = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
  max-height: 300px;
  overflow-y: auto;
`;

const ConfigItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ConfigInfo = styled.div`
  flex: 1;
`;

const ConfigName = styled.div`
  font-weight: 500;
`;

const ConfigDate = styled.div`
  font-size: 0.75rem;
  color: #666;
`;

const ConfigActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const SortSelect = styled.select`
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-left: auto;
`;

interface EyeControlsProps {
  side: EyeSide;
}

const EyeControls = ({ side }: EyeControlsProps) => {
  const {
    pupilSize,
    setPupilSize,
    irisColor,
    setIrisColor,
    irisTexture,
    setIrisTexture,
    irisPatternIntensity,
    setIrisPatternIntensity,
    eyeSize,
    setEyeSize,
    eyelidPosition,
    setEyelidPosition,
    eyelidCurvature,
    setEyelidCurvature,
    tearFilmVisible,
    setTearFilmVisible,
    tearFilmIntensity,
    setTearFilmIntensity,
    pathologyType,
    setPathologyType,
    pathologyIntensity,
    setPathologyIntensity,
    mirrorEyeSettings,
  } = useEyeStore();

  const otherSide = side === 'left' ? 'right' : 'left';

  return (
    <ControlGroup>
      <GroupTitle>
        {side === 'left' ? 'Left Eye' : 'Right Eye'} Controls
        <MirrorButton onClick={() => mirrorEyeSettings(side)}>
          Mirror to {otherSide === 'left' ? 'Left' : 'Right'}
        </MirrorButton>
      </GroupTitle>

      <ControlRow>
        <Label>Pupil Size</Label>
        <SliderContainer>
          <Slider
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={pupilSize[side]}
            onChange={(e) => setPupilSize(side, parseFloat(e.target.value))}
          />
          <Value>{pupilSize[side]}</Value>
        </SliderContainer>
      </ControlRow>

      <ControlRow>
        <Label>Iris Color</Label>
        <ColorPickerContainer>
          <ColorInput
            type="color"
            value={irisColor[side]}
            onChange={(e) => setIrisColor(side, e.target.value)}
          />
          <Value>{irisColor[side]}</Value>
        </ColorPickerContainer>
      </ControlRow>

      <ControlRow>
        <Label>Iris Texture</Label>
        <Select
          value={irisTexture[side]}
          onChange={(e) => setIrisTexture(side, e.target.value)}
        >
          <option value="radial">Radial</option>
          <option value="starburst">Starburst</option>
          <option value="solid">Solid</option>
        </Select>
      </ControlRow>

      <ControlRow>
        <Label>Texture Intensity</Label>
        <SliderContainer>
          <Slider
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={irisPatternIntensity[side]}
            onChange={(e) => setIrisPatternIntensity(side, parseFloat(e.target.value))}
          />
          <Value>{irisPatternIntensity[side]}</Value>
        </SliderContainer>
      </ControlRow>

      <ControlRow>
        <Label>Eye Size</Label>
        <SliderContainer>
          <Slider
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={eyeSize[side]}
            onChange={(e) => setEyeSize(side, parseFloat(e.target.value))}
          />
          <Value>{eyeSize[side]}</Value>
        </SliderContainer>
      </ControlRow>

      <ControlRow>
        <Label>Eyelid Position</Label>
        <SliderContainer>
          <Slider
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={eyelidPosition[side]}
            onChange={(e) => setEyelidPosition(side, parseFloat(e.target.value))}
          />
          <Value>{Math.round(eyelidPosition[side] * 100)}%</Value>
        </SliderContainer>
      </ControlRow>

      <ControlRow>
        <Label>Eyelid Curvature</Label>
        <SliderContainer>
          <Slider
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={eyelidCurvature[side]}
            onChange={(e) => setEyelidCurvature(side, parseFloat(e.target.value))}
          />
          <Value>{eyelidCurvature[side]}</Value>
        </SliderContainer>
      </ControlRow>

      <ControlRow>
        <Label>Tear Film</Label>
        <Checkbox>
          <input 
            type="checkbox" 
            id={`tear-film-${side}`}
            checked={tearFilmVisible[side]} 
            onChange={(e) => setTearFilmVisible(side, e.target.checked)}
          />
          <label htmlFor={`tear-film-${side}`}>Visible</label>
        </Checkbox>
      </ControlRow>

      {tearFilmVisible[side] && (
        <ControlRow>
          <Label>Tear Film Intensity</Label>
          <SliderContainer>
            <Slider
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={tearFilmIntensity[side]}
              onChange={(e) => setTearFilmIntensity(side, parseFloat(e.target.value))}
            />
            <Value>{tearFilmIntensity[side]}</Value>
          </SliderContainer>
        </ControlRow>
      )}

      <ControlRow>
        <Label>Pathology</Label>
        <Select
          value={pathologyType[side]}
          onChange={(e) => setPathologyType(side, e.target.value as PathologyType)}
        >
          <option value="normal">Normal</option>
          <option value="conjunctivitis">Conjunctivitis</option>
          <option value="jaundice">Jaundice</option>
          <option value="subconjunctival_hemorrhage">Subconjunctival Hemorrhage</option>
          <option value="arcus">Arcus Senilis</option>
          <option value="cataract">Cataract</option>
        </Select>
      </ControlRow>

      {pathologyType[side] !== 'normal' && (
        <ControlRow>
          <Label>Pathology Intensity</Label>
          <SliderContainer>
            <Slider
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={pathologyIntensity[side]}
              onChange={(e) => setPathologyIntensity(side, parseFloat(e.target.value))}
            />
            <Value>{pathologyIntensity[side]}</Value>
          </SliderContainer>
        </ControlRow>
      )}
    </ControlGroup>
  );
};

const DeviationControls = () => {
  const {
    esotropia,
    exotropia,
    hypertropia,
    hypotropia,
    esophoria,
    exophoria,
    hyperphoria,
    hypophoria,
    setDeviation,
    activeTool,
    setActiveTool,
    occluderPosition,
    setOccluderPosition,
  } = useEyeStore();

  return (
    <ControlGroup>
      <div style={{ 
        marginBottom: '1rem',
        padding: '0.75rem 1rem',
        backgroundColor: '#eef2ff',
        borderRadius: '0.375rem',
        borderLeft: '4px solid #4f46e5',
        fontSize: '0.875rem',
        color: '#4f46e5'
      }}>
        <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>Using the Deviation Controls:</p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          <li>Tropias are visible at all times</li>
          <li>Phorias require covering an eye to see the deviation</li>
          <li>Use the occluder tool below to cover an eye</li>
        </ul>
      </div>

      <GroupTitle>Eye Deviations (Tropias)</GroupTitle>
      
      <ControlRow>
        <Label>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            Esotropia
            <span style={{ color: '#4f46e5', marginLeft: '0.25rem', marginRight: '0.25rem' }}>→←</span>
            (Inward)
          </span>
        </Label>
        <SliderContainer>
          <Slider
            type="range"
            min="0"
            max="30"
            step="1"
            value={esotropia}
            onChange={(e) => setDeviation('esotropia', parseFloat(e.target.value))}
          />
          <Value>{esotropia}Δ</Value>
        </SliderContainer>
      </ControlRow>

      <ControlRow>
        <Label>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            Exotropia
            <span style={{ color: '#4f46e5', marginLeft: '0.25rem', marginRight: '0.25rem' }}>←→</span>
            (Outward)
          </span>
        </Label>
        <SliderContainer>
          <Slider
            type="range"
            min="0"
            max="30"
            step="1"
            value={exotropia}
            onChange={(e) => setDeviation('exotropia', parseFloat(e.target.value))}
          />
          <Value>{exotropia}Δ</Value>
        </SliderContainer>
      </ControlRow>

      <ControlRow>
        <Label>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            Hypertropia
            <span style={{ color: '#4f46e5', marginLeft: '0.25rem', marginRight: '0.25rem' }}>↑</span>
            (Upward)
          </span>
        </Label>
        <SliderContainer>
          <Slider
            type="range"
            min="0"
            max="30"
            step="1"
            value={hypertropia}
            onChange={(e) => setDeviation('hypertropia', parseFloat(e.target.value))}
          />
          <Value>{hypertropia}Δ</Value>
        </SliderContainer>
      </ControlRow>

      <ControlRow>
        <Label>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            Hypotropia
            <span style={{ color: '#4f46e5', marginLeft: '0.25rem', marginRight: '0.25rem' }}>↓</span>
            (Downward)
          </span>
        </Label>
        <SliderContainer>
          <Slider
            type="range"
            min="0"
            max="30"
            step="1"
            value={hypotropia}
            onChange={(e) => setDeviation('hypotropia', parseFloat(e.target.value))}
          />
          <Value>{hypotropia}Δ</Value>
        </SliderContainer>
      </ControlRow>

      <GroupTitle>Phorias (Latent Deviations)</GroupTitle>
      
      <ControlRow>
        <Label style={{ fontWeight: '500', color: '#4f46e5' }}>Occluder Tool</Label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              background: activeTool === 'occluder' ? '#4f46e5' : '#e5e7eb',
              color: activeTool === 'occluder' ? 'white' : '#374151',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
            onClick={() => setActiveTool(activeTool === 'occluder' ? 'none' : 'occluder')}
          >
            {activeTool === 'occluder' ? 'Activated' : 'Activate'}
          </button>
          
          {activeTool === 'occluder' && (
            <>
              <button
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  background: occluderPosition === 'left' ? '#4f46e5' : '#e5e7eb',
                  color: occluderPosition === 'left' ? 'white' : '#374151',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
                onClick={() => setOccluderPosition(occluderPosition === 'left' ? null : 'left')}
              >
                Cover Left
              </button>
              
              <button
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  background: occluderPosition === 'right' ? '#4f46e5' : '#e5e7eb',
                  color: occluderPosition === 'right' ? 'white' : '#374151',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
                onClick={() => setOccluderPosition(occluderPosition === 'right' ? null : 'right')}
              >
                Cover Right
              </button>
            </>
          )}
        </div>
      </ControlRow>

      <ControlRow>
        <Label>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            Esophoria
            <span style={{ color: '#f59e0b', marginLeft: '0.25rem', marginRight: '0.25rem' }}>→←</span>
          </span>
        </Label>
        <SliderContainer>
          <Slider
            type="range"
            min="0"
            max="30"
            step="1"
            value={esophoria}
            onChange={(e) => setDeviation('esophoria', parseFloat(e.target.value))}
          />
          <Value>{esophoria}Δ</Value>
        </SliderContainer>
      </ControlRow>

      <ControlRow>
        <Label>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            Exophoria
            <span style={{ color: '#f59e0b', marginLeft: '0.25rem', marginRight: '0.25rem' }}>←→</span>
          </span>
        </Label>
        <SliderContainer>
          <Slider
            type="range"
            min="0"
            max="30"
            step="1"
            value={exophoria}
            onChange={(e) => setDeviation('exophoria', parseFloat(e.target.value))}
          />
          <Value>{exophoria}Δ</Value>
        </SliderContainer>
      </ControlRow>

      <ControlRow>
        <Label>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            Hyperphoria
            <span style={{ color: '#f59e0b', marginLeft: '0.25rem', marginRight: '0.25rem' }}>↑</span>
          </span>
        </Label>
        <SliderContainer>
          <Slider
            type="range"
            min="0"
            max="30"
            step="1"
            value={hyperphoria}
            onChange={(e) => setDeviation('hyperphoria', parseFloat(e.target.value))}
          />
          <Value>{hyperphoria}Δ</Value>
        </SliderContainer>
      </ControlRow>

      <ControlRow>
        <Label>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            Hypophoria
            <span style={{ color: '#f59e0b', marginLeft: '0.25rem', marginRight: '0.25rem' }}>↓</span>
          </span>
        </Label>
        <SliderContainer>
          <Slider
            type="range"
            min="0"
            max="30"
            step="1"
            value={hypophoria}
            onChange={(e) => setDeviation('hypophoria', parseFloat(e.target.value))}
          />
          <Value>{hypophoria}Δ</Value>
        </SliderContainer>
      </ControlRow>
    </ControlGroup>
  );
};

const TestingTools = () => {
  const {
    activeTool,
    setActiveTool,
    occluderPosition,
    setOccluderPosition,
    prismValue,
    setPrismValue,
    prismAxis,
    setPrismAxis,
    dominantEye,
    setDominantEye,
    currentTest,
    setCurrentTest,
  } = useEyeStore();

  return (
    <ControlGroup>
      <GroupTitle>Testing Tools</GroupTitle>

      <ControlRow>
        <Label>Active Tool</Label>
        <Select
          value={activeTool}
          onChange={(e) => setActiveTool(e.target.value as 'occluder' | 'prism' | 'target' | 'none')}
        >
          <option value="none">None</option>
          <option value="occluder">Occluder</option>
          <option value="prism">Prism</option>
          <option value="target">Target</option>
        </Select>
      </ControlRow>

      {activeTool === 'occluder' && (
        <ControlRow>
          <Label>Occluder Position</Label>
          <ButtonGroup>
            <Button
              onClick={() => setOccluderPosition('left')}
              disabled={occluderPosition === 'left'}
            >
              Left
            </Button>
            <Button
              onClick={() => setOccluderPosition('right')}
              disabled={occluderPosition === 'right'}
            >
              Right
            </Button>
            <SecondaryButton onClick={() => setOccluderPosition(null)}>
              Remove
            </SecondaryButton>
          </ButtonGroup>
        </ControlRow>
      )}

      {activeTool === 'prism' && (
        <>
          <ControlRow>
            <Label>Prism Value</Label>
            <SliderContainer>
              <Slider
                type="range"
                min="0"
                max="20"
                step="1"
                value={prismValue}
                onChange={(e) => setPrismValue(parseInt(e.target.value))}
              />
              <Value>{prismValue}</Value>
            </SliderContainer>
          </ControlRow>

          <ControlRow>
            <Label>Prism Axis</Label>
            <SliderContainer>
              <Slider
                type="range"
                min="0"
                max="360"
                step="15"
                value={prismAxis}
                onChange={(e) => setPrismAxis(parseInt(e.target.value))}
              />
              <Value>{prismAxis}°</Value>
            </SliderContainer>
          </ControlRow>
        </>
      )}

      <ControlRow>
        <Label>Dominant Eye</Label>
        <ButtonGroup>
          <Button
            onClick={() => setDominantEye('left')}
            disabled={dominantEye === 'left'}
          >
            Left
          </Button>
          <Button
            onClick={() => setDominantEye('right')}
            disabled={dominantEye === 'right'}
          >
            Right
          </Button>
          <SecondaryButton onClick={() => setDominantEye(null)}>
            None
          </SecondaryButton>
        </ButtonGroup>
      </ControlRow>

      <ControlRow>
        <Label>Test Type</Label>
        <Select
          value={currentTest}
          onChange={(e) => setCurrentTest(e.target.value as 'cover-uncover' | 'alternate-cover' | 'alternate-cover-prism' | 'simultaneous-prism')}
        >
          <option value="cover-uncover">Cover-Uncover</option>
          <option value="alternate-cover">Alternate Cover</option>
          <option value="alternate-cover-prism">Alternate Cover with Prism</option>
          <option value="simultaneous-prism">Simultaneous Prism</option>
        </Select>
      </ControlRow>
    </ControlGroup>
  );
};

export default function ControlPanel() {
  const { 
    resetEyes, 
    enableBlinking, 
    setEnableBlinking, 
    blinkFrequency, 
    setBlinkFrequency,
    saveConfiguration,
    loadConfiguration,
    getSavedConfigurations
  } = useEyeStore();
  const [activeTab, setActiveTab] = useState('eyes');
  const [configName, setConfigName] = useState('');
  const [savedConfigs, setSavedConfigs] = useState<ConfigItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [sortOrder, setSortOrder] = useState<'name' | 'newest' | 'oldest'>('newest');
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

  // Load saved configurations on mount
  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    if (typeof window !== 'undefined') {
      setIsLoading(true);
      let dbCheckPassed = false;
      
      // First check if the auth and database connection are working
      try {
        const checkResponse = await fetch('/api/check-db');
        if (checkResponse.ok) {
          const checkData = await checkResponse.json();
          console.log('System status:', checkData);
          
          if (checkData.authentication?.status !== 'authenticated') {
            setStatusMessage(`Authentication error: ${checkData.authentication?.error || 'Not authenticated'}`);
            setIsLoading(false);
            return;
          }
          
          if (checkData.status !== 'success') {
            setStatusMessage(`Database connection error: ${checkData.error || 'Connection failed'}`);
            setIsLoading(false);
            return;
          }
          
          dbCheckPassed = true;
        } else {
          console.error('Database check failed:', checkResponse.status, checkResponse.statusText);
          setStatusMessage(`Database check failed: ${checkResponse.status} ${checkResponse.statusText}`);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error checking system status:', error);
        setStatusMessage(`System check error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsLoading(false);
        return;
      }
      
      // If database check passed, continue to load configurations
      if (dbCheckPassed) {
        try {
          console.log('Database check passed, loading configurations...');
          const configs = await getSavedConfigurations();
          console.log('Loaded configurations:', configs);
          setSavedConfigs(Array.isArray(configs) ? configs : []);
          
          if (!Array.isArray(configs) || configs.length === 0) {
            setStatusMessage('No saved configurations found. Create your first one!');
          } else {
            setStatusMessage('');
          }
        } catch (error) {
          console.error('Error loading configurations:', error);
          setStatusMessage(`Failed to load saved configurations: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const handleSaveConfig = () => {
    if (configName.trim()) {
      setIsLoading(true);
      setStatusMessage('Saving configuration...');
      
      // Save the configuration
      saveConfiguration(configName);
      
      // Clear the input field
      setConfigName('');
      
      // Refresh the saved configurations list after a short delay
      setTimeout(() => {
        loadConfigurations().then(() => {
          setStatusMessage('Configuration saved successfully!');
          // Clear success message after a delay
          setTimeout(() => setStatusMessage(''), 3000);
        });
      }, 800);
    }
  };

  const handleDeleteConfig = async (configId: string) => {
    // If this is a confirmation request
    if (deleteConfirmation !== configId) {
      setDeleteConfirmation(configId);
      return;
    }
    
    setIsLoading(true);
    setStatusMessage('Deleting configuration...');
    
    try {
      const response = await fetch(`/api/configurations/${configId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setStatusMessage('Configuration deleted successfully!');
        await loadConfigurations();
      } else {
        throw new Error('Failed to delete configuration');
      }
    } catch (error) {
      console.error('Error deleting configuration:', error);
      setStatusMessage('Failed to delete configuration');
    }
    
    setDeleteConfirmation(null);
    setIsLoading(false);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? 'Invalid date' 
      : date.toLocaleString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
  };

  const sortConfigurations = (configs: ConfigItem[]) => {
    if (!configs || configs.length === 0) return [];
    
    return [...configs].sort((a, b) => {
      switch (sortOrder) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.updatedAt || b.createdAt || '').getTime() - 
                 new Date(a.updatedAt || a.createdAt || '').getTime();
        case 'oldest':
          return new Date(a.updatedAt || a.createdAt || '').getTime() - 
                 new Date(b.updatedAt || b.createdAt || '').getTime();
        default:
          return 0;
      }
    });
  };

  // Sort the configurations
  const sortedConfigs = sortConfigurations(savedConfigs);

  return (
    <ControlContainer>
      <TabGroup>
        <Tab
          active={activeTab === 'eyes'}
          onClick={() => setActiveTab('eyes')}
        >
          Eye Controls
        </Tab>
        <Tab
          active={activeTab === 'movement'}
          onClick={() => setActiveTab('movement')}
        >
          Movement
        </Tab>
        <Tab
          active={activeTab === 'deviations'}
          onClick={() => setActiveTab('deviations')}
        >
          Deviations
        </Tab>
        <Tab
          active={activeTab === 'testing'}
          onClick={() => setActiveTab('testing')}
        >
          Testing Tools
        </Tab>
        <Tab
          active={activeTab === 'configurations'}
          onClick={() => setActiveTab('configurations')}
        >
          Configurations
        </Tab>
      </TabGroup>

      {activeTab === 'eyes' && (
        <>
          <Checkbox>
            <input 
              type="checkbox" 
              id="enable-blinking"
              checked={enableBlinking} 
              onChange={(e) => setEnableBlinking(e.target.checked)}
            />
            <label htmlFor="enable-blinking">Enable Automatic Blinking</label>
          </Checkbox>
          
          {enableBlinking && (
            <ControlRow>
              <Label>Blink Frequency (per minute)</Label>
              <SliderContainer>
                <Slider
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={blinkFrequency}
                  onChange={(e) => setBlinkFrequency(parseInt(e.target.value))}
                />
                <Value>{blinkFrequency}</Value>
              </SliderContainer>
            </ControlRow>
          )}
          
          <EyeControls side="left" />
          <EyeControls side="right" />
          <ResetButton onClick={resetEyes}>Reset All</ResetButton>
        </>
      )}

      {activeTab === 'movement' && <EyeMovementControl />}

      {activeTab === 'deviations' && <DeviationControls />}
      {activeTab === 'testing' && <TestingTools />}
      
      {activeTab === 'configurations' && (
        <ControlGroup>
          <GroupTitle>Save Configuration</GroupTitle>
          <ControlRow>
            <Label>Configuration Name</Label>
            <div style={{ display: 'flex', gap: '0.5rem', flex: 2 }}>
              <input 
                type="text" 
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                style={{ 
                  flex: 1, 
                  padding: '0.5rem', 
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
                placeholder="Enter a name for this configuration"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSaveConfig}
                disabled={!configName.trim() || isLoading}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </ControlRow>
          
          <GroupTitle>
            Saved Configurations
            <SortSelect 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value as 'name' | 'newest' | 'oldest')}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">By Name</option>
            </SortSelect>
          </GroupTitle>
          
          {isLoading && savedConfigs.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
              Loading configurations...
            </div>
          ) : sortedConfigs.length > 0 ? (
            <ConfigList>
              {sortedConfigs.map(config => (
                <ConfigItem key={config._id}>
                  <ConfigInfo>
                    <ConfigName>{config.name}</ConfigName>
                    <ConfigDate>
                      {config.updatedAt 
                        ? `Updated: ${formatDate(config.updatedAt)}`
                        : config.createdAt 
                          ? `Created: ${formatDate(config.createdAt)}`
                          : 'No date information'}
                    </ConfigDate>
                  </ConfigInfo>
                  <ConfigActions>
                    <Button 
                      onClick={() => {
                        loadConfiguration(config._id);
                        setStatusMessage('Configuration loaded successfully!');
                        setTimeout(() => setStatusMessage(''), 3000);
                      }}
                      disabled={isLoading}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      Load
                    </Button>
                    {deleteConfirmation === config._id ? (
                      <>
                        <DeleteButton 
                          onClick={() => handleDeleteConfig(config._id)}
                          disabled={isLoading}
                        >
                          Confirm
                        </DeleteButton>
                        <Button 
                          onClick={cancelDelete}
                          disabled={isLoading}
                          style={{ 
                            padding: '0.25rem 0.5rem', 
                            fontSize: '0.75rem',
                            backgroundColor: '#6b7280'
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <DeleteButton 
                        onClick={() => handleDeleteConfig(config._id)}
                        disabled={isLoading}
                      >
                        Delete
                      </DeleteButton>
                    )}
                  </ConfigActions>
                </ConfigItem>
              ))}
            </ConfigList>
          ) : (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
              No saved configurations found.
            </div>
          )}
          
          {statusMessage && (
            <div style={{ 
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: statusMessage.includes('failed') || statusMessage.includes('Failed') 
                ? '#fee2e2' 
                : '#ecfdf5',
              borderRadius: '4px',
              color: statusMessage.includes('failed') || statusMessage.includes('Failed')
                ? '#b91c1c' 
                : '#065f46',
              textAlign: 'center'
            }}>
              {statusMessage}
            </div>
          )}
        </ControlGroup>
      )}
    </ControlContainer>
  );
} 