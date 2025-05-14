import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import ControlPanel from './ControlPanel';
import InfoPanel from './InfoPanel';
import dynamic from 'next/dynamic';
import UniversityLogo from './UniversityLogo';

// Dynamically import FaceModel with SSR disabled
const DynamicFaceModel = dynamic(() => import('./FaceModel'), { ssr: false });

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--background-alt);
`;

const Header = styled.header`
  background-color: var(--university-primary);
  color: white;
  padding: 1rem 0;
  box-shadow: var(--shadow-md);
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
  margin: 0;
  color: white;
`;

const ModeToggle = styled.div`
  display: flex;
  gap: var(--spacing-sm);
`;

const ModeButton = styled.button<{ active: boolean }>`
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  border: none;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-quick);
  background-color: ${(props: { active: boolean }) => props.active ? 'var(--university-secondary)' : 'rgba(255, 255, 255, 0.2)'};
  color: white;
  
  &:hover {
    background-color: ${(props: { active: boolean }) => props.active ? 'var(--university-secondary)' : 'rgba(255, 255, 255, 0.3)'};
  }
`;

const Main = styled.main`
  flex-grow: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
`;

const SimulationContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-xl);
  
  @media (min-width: 1024px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const EyeSimulation = styled.div`
  background-color: var(--university-white);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  height: 600px;
`;

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const ContentSection = styled.section`
  margin-top: var(--spacing-xl);
  background-color: var(--university-white);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: var(--font-weight-semibold);
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  color: var(--university-primary);
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
`;

const Card = styled.div`
  border: 1px solid var(--university-gray);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  transition: transform var(--transition-default), box-shadow var(--transition-default);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
  }
  
  h3 {
    font-size: 1.1rem;
    font-weight: var(--font-weight-medium);
    margin-top: 0;
    margin-bottom: var(--spacing-sm);
    color: var(--university-primary);
  }
  
  p {
    font-size: 0.9rem;
    color: var(--university-dark-gray);
    margin-bottom: var(--spacing-md);
  }
`;

interface CardButtonProps {
  color?: string;
}

const CardButton = styled.button<CardButtonProps>`
  display: block;
  width: 100%;
  padding: var(--spacing-sm) 0;
  text-align: center;
  border-radius: var(--border-radius-sm);
  background-color: ${(props: CardButtonProps) => props.color || 'var(--university-light-gray)'};
  color: ${(props: CardButtonProps) => props.color ? 'white' : 'var(--university-dark-gray)'};
  font-weight: var(--font-weight-medium);
  border: none;
  cursor: pointer;
  transition: all var(--transition-quick);
  
  &:hover {
    opacity: 0.9;
  }
`;

const Footer = styled.footer`
  background-color: var(--university-white);
  border-top: 1px solid var(--university-gray);
  padding: var(--spacing-lg) 0;
`;

const FooterContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 640px) {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
  }
`;

const FooterLogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`;

const Copyright = styled.div`
  font-size: 0.875rem;
  color: var(--university-dark-gray);
`;

const FooterLinks = styled.div`
  display: flex;
  gap: var(--spacing-lg);
  
  a {
    font-size: 0.875rem;
    color: var(--university-dark-gray);
    text-decoration: none;
    transition: color var(--transition-quick);
    
    &:hover {
      color: var(--university-secondary);
    }
  }
`;

const SimulatorLayout = () => {
  const [activeMode, setActiveMode] = useState<'explore' | 'test'>('explore');
  const [isMounted, setIsMounted] = useState(false);

  // Wait until component is mounted to prevent hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Container>
      <Header>
        <HeaderContent>
          <LogoContainer>
            <UniversityLogo width={60} height={60} />
            <Title>Eyes Simulator</Title>
          </LogoContainer>
          <ModeToggle>
            <ModeButton 
              active={activeMode === 'explore'} 
              onClick={() => setActiveMode('explore')}
            >
              Explore Mode
            </ModeButton>
            <ModeButton 
              active={activeMode === 'test'} 
              onClick={() => setActiveMode('test')}
            >
              Test Mode
            </ModeButton>
          </ModeToggle>
        </HeaderContent>
      </Header>

      <Main>
        <SimulationContainer>
          <EyeSimulation>
            {/* Only render FaceModel on the client */}
            {isMounted ? <DynamicFaceModel /> : null}
          </EyeSimulation>

          <ControlsContainer>
            {isMounted ? (
              <>
                <ControlPanel />
                <InfoPanel />
              </>
            ) : null}
          </ControlsContainer>
        </SimulationContainer>

        {activeMode === 'test' && (
          <ContentSection>
            <SectionTitle>Test Your Knowledge</SectionTitle>
            <CardsGrid>
              <Card>
                <h3>Strabismus Identification</h3>
                <p>Identify different types of strabismus and their characteristics.</p>
                <CardButton color="var(--university-secondary)">Start Test</CardButton>
              </Card>
              <Card>
                <h3>Eye Movement Disorders</h3>
                <p>Test your knowledge of different eye movement disorders.</p>
                <CardButton color="var(--university-secondary)">Start Test</CardButton>
              </Card>
              <Card>
                <h3>Clinical Cases</h3>
                <p>Analyze real-world clinical cases and provide your diagnosis.</p>
                <CardButton color="var(--university-secondary)">View Cases</CardButton>
              </Card>
            </CardsGrid>
          </ContentSection>
        )}

        <ContentSection>
          <SectionTitle>Learning Resources</SectionTitle>
          <CardsGrid>
            <Card>
              <h3>Anatomy of the Eye</h3>
              <p>Learn about the structure and function of the human eye.</p>
              <CardButton>View Resource</CardButton>
            </Card>
            <Card>
              <h3>Common Eye Disorders</h3>
              <p>Explore common eye disorders and their clinical presentations.</p>
              <CardButton>View Resource</CardButton>
            </Card>
            <Card>
              <h3>Clinical Examination</h3>
              <p>Learn techniques for clinical examination of eye movements.</p>
              <CardButton>View Resource</CardButton>
            </Card>
            <Card>
              <h3>Treatment Options</h3>
              <p>Explore treatment options for various eye movement disorders.</p>
              <CardButton>View Resource</CardButton>
            </Card>
          </CardsGrid>
        </ContentSection>
      </Main>

      <Footer>
        <FooterContent>
          <FooterLogoContainer>
            <UniversityLogo width={40} height={40} />
            <Copyright>© {new Date().getFullYear()} University Medical School. All rights reserved.</Copyright>
          </FooterLogoContainer>
          <FooterLinks>
            <a href="#">About</a>
            <a href="#">Contact</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
          </FooterLinks>
        </FooterContent>
      </Footer>
    </Container>
  );
};

export default SimulatorLayout; 