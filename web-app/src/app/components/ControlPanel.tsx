import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import useEyeStore, { EyeSide, PathologyType } from '../store/useEyeStore';
import EyeMovementControl from './EyeMovementControl';

const ControlContainer = styled.div`
  background-color: var(--university-white);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  overflow-y: auto;
  max-height: 100%;
`;

const TabGroup = styled.div`
  display: flex;
  border-bottom: 1px solid var(--university-gray);
  margin-bottom: var(--spacing-md);
`;

const Tab = styled.button<{ active: boolean }>`
  background: ${props => props.active ? 'var(--university-white)' : 'transparent'};
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  font-weight: ${props => props.active ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)'};
  border-bottom: ${props => props.active ? `2px solid var(--university-secondary)` : 'none'};
  color: ${props => props.active ? 'var(--university-secondary)' : 'var(--university-dark-gray)'};
  transition: all var(--transition-quick);
  
  &:hover {
    background-color: var(--university-light-gray);
  }
`;

const ControlGroup = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const GroupTitle = styled.h3`
  font-size: 1rem;
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-sm);
  color: var(--university-primary);
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
  color: var(--university-dark-gray);
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
  color: var(--university-dark-gray);
  width: 2.5rem;
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button`
  background-color: var(--university-secondary);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color var(--transition-quick);
  
  &:hover {
    background-color: #2980b9;
  }

  &:disabled {
    background-color: var(--university-gray);
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: var(--university-dark-gray);

  &:hover {
    background-color: #3a4555;
  }
`;

const ResetButton = styled(Button)`
  background-color: var(--university-accent);

  &:hover {
    background-color: #c0392b;
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
  border: 1px solid var(--university-gray);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
`;

const Select = styled.select`
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--university-gray);
  border-radius: var(--border-radius-sm);
  background-color: var(--university-white);
  flex: 2;
`;

const MirrorButton = styled.button`
  background-color: transparent;
  border: 1px solid var(--university-gray);
  border-radius: var(--border-radius-sm);
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  
  &:hover {
    background-color: var(--university-light-gray);
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
    color: var(--university-dark-gray);
    cursor: pointer;
  }
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
  } = useEyeStore();

  return (
    <ControlGroup>
      <GroupTitle>Eye Deviations</GroupTitle>
      
      <ControlRow>
        <Label>Esotropia (Inward)</Label>
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
        <Label>Exotropia (Outward)</Label>
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
        <Label>Hypertropia (Upward)</Label>
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
        <Label>Hypotropia (Downward)</Label>
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
        <Label>Esophoria</Label>
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
        <Label>Exophoria</Label>
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
        <Label>Hyperphoria</Label>
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
        <Label>Hypophoria</Label>
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
  const [savedConfigs, setSavedConfigs] = useState<string[]>([]);
  const [selectedConfig, setSelectedConfig] = useState('');

  // Load saved configurations on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const configs = getSavedConfigurations();
      setSavedConfigs(configs);
      if (configs.length > 0) {
        setSelectedConfig(configs[0]);
      }
    }
  }, [getSavedConfigurations]);

  const handleSaveConfig = () => {
    if (configName.trim()) {
      saveConfiguration(configName);
      setConfigName('');
      setSavedConfigs(getSavedConfigurations());
    }
  };

  const handleLoadConfig = () => {
    if (selectedConfig) {
      loadConfiguration(selectedConfig);
    }
  };

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
                  borderRadius: 'var(--border-radius-sm)',
                  border: '1px solid var(--university-gray)'
                }}
                placeholder="Enter a name for this configuration"
              />
              <Button 
                onClick={handleSaveConfig}
                disabled={!configName.trim()}
              >
                Save
              </Button>
            </div>
          </ControlRow>
          
          <GroupTitle>Load Configuration</GroupTitle>
          {savedConfigs.length > 0 ? (
            <>
              <ControlRow>
                <Label>Select Configuration</Label>
                <Select
                  value={selectedConfig}
                  onChange={(e) => setSelectedConfig(e.target.value)}
                  style={{ flex: 2 }}
                >
                  {savedConfigs.map(config => (
                    <option key={config} value={config}>
                      {config}
                    </option>
                  ))}
                </Select>
              </ControlRow>
              <ControlRow>
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                  <Button onClick={handleLoadConfig}>
                    Load Configuration
                  </Button>
                </div>
              </ControlRow>
            </>
          ) : (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--university-dark-gray)' }}>
              No saved configurations found.
            </div>
          )}
        </ControlGroup>
      )}
    </ControlContainer>
  );
} 