import { useState } from 'react';
import styled from '@emotion/styled';
import useEyeStore from '../store/useEyeStore';

const Container = styled.div`
  background-color: var(--university-white);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
`;

const Title = styled.h2`
  font-size: 1.4rem;
  font-weight: var(--font-weight-semibold);
  color: var(--university-primary);
  margin: 0;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: var(--university-dark-gray);
  font-size: 0.875rem;
  cursor: pointer;
  transition: color var(--transition-quick);
  
  &:hover {
    color: var(--university-secondary);
  }
`;

const Section = styled.div`
  margin-bottom: var(--spacing-lg);
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-sm);
  color: var(--university-primary);
`;

const Text = styled.p`
  font-size: 0.9rem;
  color: var(--university-dark-gray);
  margin-bottom: var(--spacing-sm);
  line-height: 1.5;
`;

const ConditionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const ConditionCard = styled.div`
  background-color: var(--university-light-gray);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-sm);
  transition: transform var(--transition-default), box-shadow var(--transition-default);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
  }
`;

const ConditionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
`;

const ConditionName = styled.span`
  font-weight: var(--font-weight-medium);
  color: var(--university-primary);
`;

interface BadgeProps {
  type: 'tropia' | 'phoria';
}

const Badge = styled.span<BadgeProps>`
  font-size: 0.75rem;
  font-weight: var(--font-weight-medium);
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  background-color: ${(props: BadgeProps) => props.type === 'tropia' ? '#fee2e2' : '#fef3c7'};
  color: ${(props: BadgeProps) => props.type === 'tropia' ? 'var(--university-accent)' : '#b45309'};
`;

const ConditionDescription = styled.p`
  font-size: 0.875rem;
  color: var(--university-dark-gray);
  margin: 0;
`;

const InfoBox = styled.div`
  background-color: #e6f0fa;
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md);
  border-left: 3px solid var(--university-secondary);
`;

const BoldText = styled.span`
  font-weight: var(--font-weight-semibold);
`;

const LegendGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
  font-size: 0.875rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
`;

interface ColorDotProps {
  color: string;
}

const ColorDot = styled.div<ColorDotProps>`
  width: 0.75rem;
  height: 0.75rem;
  background-color: ${(props: ColorDotProps) => props.color};
  border-radius: 50%;
  margin-right: var(--spacing-xs);
`;

const InfoPanel = () => {
  const { currentTest, esotropia, exotropia, hypertropia, hypotropia, esophoria, exophoria, hyperphoria, hypophoria } = useEyeStore();
  const [expanded, setExpanded] = useState(true);

  // Determine current conditions
  const activeConditions = [
    { name: 'Esotropia', value: esotropia, type: 'tropia' as const, description: 'Inward turning of the eye' },
    { name: 'Exotropia', value: exotropia, type: 'tropia' as const, description: 'Outward turning of the eye' },
    { name: 'Hypertropia', value: hypertropia, type: 'tropia' as const, description: 'Upward turning of the eye' },
    { name: 'Hypotropia', value: hypotropia, type: 'tropia' as const, description: 'Downward turning of the eye' },
    { name: 'Esophoria', value: esophoria, type: 'phoria' as const, description: 'Tendency for the eye to turn inward' },
    { name: 'Exophoria', value: exophoria, type: 'phoria' as const, description: 'Tendency for the eye to turn outward' },
    { name: 'Hyperphoria', value: hyperphoria, type: 'phoria' as const, description: 'Tendency for the eye to turn upward' },
    { name: 'Hypophoria', value: hypophoria, type: 'phoria' as const, description: 'Tendency for the eye to turn downward' },
  ].filter(condition => condition.value > 0);

  // Test descriptions
  const testDescriptions = {
    'cover-uncover': {
      title: 'Cover-Uncover Test',
      description: 'Used to identify a tropia (manifest deviation). The examiner covers one eye and observes any movement in the uncovered eye. If the uncovered eye moves to fixate, it indicates a tropia.',
      technique: 'Cover one eye and observe the uncovered eye for movement. Then repeat with the other eye.',
      interpretation: 'If the uncovered eye moves, it indicates a manifest deviation (tropia). No movement means no manifest deviation is present.',
    },
    'alternate-cover': {
      title: 'Alternate Cover Test',
      description: 'Used to measure the total deviation (tropia + phoria). The examiner alternately covers each eye, breaking fusion and revealing the full deviation.',
      technique: 'Quickly alternate the occluder from one eye to the other several times, then observe the movement of the eye as the occluder is removed.',
      interpretation: 'Any movement observed represents the total deviation, including both manifest (tropia) and latent (phoria) components.',
    },
    'alternate-cover-prism': {
      title: 'Alternate Cover Test with Prism',
      description: 'Used to quantify the total deviation by using prisms of increasing power until no movement is observed.',
      technique: 'Perform the alternate cover test while holding prisms of increasing power in front of the eye until no movement is observed during the alternate cover test.',
      interpretation: 'The prism power that neutralizes the movement represents the measurement of the total deviation in prism diopters.',
    },
    'simultaneous-prism': {
      title: 'Simultaneous Prism Cover Test',
      description: 'Used to measure only the manifest component (tropia) of a deviation.',
      technique: 'Place a prism in front of one eye and simultaneously cover the other eye. Observe for movement of the eye behind the prism.',
      interpretation: 'The prism power that prevents movement when the fellow eye is covered measures only the tropic component of the deviation.',
    },
  };

  return (
    <Container>
      <Header>
        <Title>Information Panel</Title>
        <ToggleButton onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Collapse' : 'Expand'}
        </ToggleButton>
      </Header>
      
      {expanded && (
        <>
          {/* Current Test Info */}
          <Section>
            <SectionTitle>{testDescriptions[currentTest].title}</SectionTitle>
            <Text>{testDescriptions[currentTest].description}</Text>
            
            <div>
              <BoldText>Technique:</BoldText>
              <Text>{testDescriptions[currentTest].technique}</Text>
            </div>
            
            <div>
              <BoldText>Interpretation:</BoldText>
              <Text>{testDescriptions[currentTest].interpretation}</Text>
            </div>
          </Section>
          
          {/* Active Conditions */}
          {activeConditions.length > 0 && (
            <Section>
              <SectionTitle>Active Eye Conditions</SectionTitle>
              <ConditionList>
                {activeConditions.map((condition, index) => (
                  <ConditionCard key={index}>
                    <ConditionHeader>
                      <ConditionName>{condition.name}</ConditionName>
                      <Badge type={condition.type}>
                        {condition.value}Δ
                      </Badge>
                    </ConditionHeader>
                    <ConditionDescription>{condition.description}</ConditionDescription>
                  </ConditionCard>
                ))}
              </ConditionList>
            </Section>
          )}
          
          {/* Educational Content */}
          <Section>
            <SectionTitle>Understanding Strabismus</SectionTitle>
            <InfoBox>
              <Text>
                <BoldText>Strabismus</BoldText> is a condition in which the eyes are not properly aligned with each other, resulting in double vision or the suppression of the image from the affected eye.
              </Text>
              <Text>
                <BoldText>Tropias</BoldText> are manifest deviations that are present at all times, even when both eyes are open.
              </Text>
              <Text style={{ marginBottom: 0 }}>
                <BoldText>Phorias</BoldText> are latent deviations that appear only when binocular vision is disrupted, such as when one eye is covered.
              </Text>
            </InfoBox>
          </Section>
          
          {/* Legend */}
          <Section>
            <SectionTitle>Terminology</SectionTitle>
            <LegendGrid>
              <LegendItem>
                <ColorDot color="#ef4444" />
                <span>Tropia (Manifest)</span>
              </LegendItem>
              <LegendItem>
                <ColorDot color="#f59e0b" />
                <span>Phoria (Latent)</span>
              </LegendItem>
              <LegendItem>
                <span style={{ marginRight: '0.25rem' }}>Δ</span>
                <span>= Prism Diopter</span>
              </LegendItem>
              <LegendItem>
                <span style={{ marginRight: '0.25rem' }}>OD/OS</span>
                <span>= Right/Left Eye</span>
              </LegendItem>
            </LegendGrid>
          </Section>
        </>
      )}
    </Container>
  );
};

export default InfoPanel; 