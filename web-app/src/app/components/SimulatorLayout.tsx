import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import ControlPanel from './ControlPanel';
import InfoPanel from './InfoPanel';
import dynamic from 'next/dynamic';
import ViewToggle from './ViewToggle';

// Dynamically import models with SSR disabled
const DynamicFaceModel = dynamic(() => import('./FaceModel'), { ssr: false });
const DynamicHeadModel3D = dynamic(() => import('./3D/HeadModel3D'), { 
  ssr: false,
  loading: () => (
    <div style={{ 
      width: '100%', 
      height: '600px', 
      background: '#f0f0f0', 
      borderRadius: '8px', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center'
    }}>
      <div>Loading 3D Model...</div>
    </div>
  )
});

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f7f9fc;
`;

const Header = styled.header`
  background-color: #2c3e50;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
`;

const ModeToggle = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ModeButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${(props: { active: boolean }) => props.active ? '#3498db' : 'rgba(255, 255, 255, 0.2)'};
  color: white;
  
  &:hover {
    background-color: ${(props: { active: boolean }) => props.active ? '#3498db' : 'rgba(255, 255, 255, 0.3)'};
  }
`;

const Main = styled.main`
  flex-grow: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const SimulationContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 1024px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const EyeSimulation = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  height: 600px;
`;

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ContentSection = styled.section`
  margin-top: 2rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2c3e50;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
`;

const Card = styled.div`
  border: 1px solid #e1e4e8;
  border-radius: 0.5rem;
  padding: 1.25rem;
  
  h3 {
    font-size: 1.1rem;
    font-weight: 500;
    margin-top: 0;
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 0.9rem;
    color: #4a5568;
    margin-bottom: 1rem;
  }
`;

interface CardButtonProps {
  color?: string;
}

const CardButton = styled.button<CardButtonProps>`
  display: block;
  width: 100%;
  padding: 0.5rem 0;
  text-align: center;
  border-radius: 0.25rem;
  background-color: ${(props: CardButtonProps) => props.color || '#f1f5f9'};
  color: ${(props: CardButtonProps) => props.color ? 'white' : '#475569'};
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.9;
  }
`;

const Footer = styled.footer`
  background-color: white;
  border-top: 1px solid #e5e7eb;
  padding: 1.5rem 0;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 640px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const Copyright = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  
  a {
    font-size: 0.875rem;
    color: #6b7280;
    text-decoration: none;
    transition: color 0.2s ease;
    
    &:hover {
      color: #1f2937;
    }
  }
`;

const SimulatorLayout = () => {
  const [activeMode, setActiveMode] = useState<'explore' | 'test'>('explore');
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [isMounted, setIsMounted] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Wait until component is mounted to prevent hydration errors
  useEffect(() => {
    setIsMounted(true);
    
    // Check for database connection issues
    const checkDatabaseConnection = async () => {
      try {
        const response = await fetch('/api/check-db');
        if (response.ok) {
          const data = await response.json();
          if (data.status !== 'success') {
            setConnectionError(data.message || 'Database connection error');
          }
        }
      } catch (error) {
        console.error('Error checking database:', error);
        setConnectionError('Unable to check database connection');
      }
    };
    
    checkDatabaseConnection();
  }, []);

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>Eyes Simulator</Title>
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
        {connectionError && (
          <div style={{
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: '#fee2e2',
            borderRadius: '0.375rem',
            color: '#b91c1c'
          }}>
            <p>{connectionError}</p>
          </div>
        )}
        
        {/* View mode toggle for 2D/3D */}
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        
        {viewMode === '3D' && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#eef2ff',
            borderRadius: '0.375rem',
            borderLeft: '4px solid #4f46e5',
            color: '#4f46e5'
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              <strong>3D Mode:</strong> Use mouse to rotate view, scroll to zoom in/out. All control panel changes apply to the 3D model in real-time.
            </p>
          </div>
        )}
        
        <SimulationContainer>
          <EyeSimulation>
            {/* Render the appropriate model based on viewMode */}
            {isMounted && viewMode === '2D' && <DynamicFaceModel />}
            {isMounted && viewMode === '3D' && <DynamicHeadModel3D />}
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
                <h3>Patient Scenario 1</h3>
                <p>
                  A 7-year-old child with complaints of eye strain while reading.
                  No previous history of vision problems.
                </p>
                <CardButton color="#3498db">Examine Patient</CardButton>
              </Card>
              <Card>
                <h3>Patient Scenario 2</h3>
                <p>
                  A 45-year-old adult reporting double vision that worsens throughout the day.
                  Onset was 2 months ago.
                </p>
                <CardButton color="#3498db">Examine Patient</CardButton>
              </Card>
              <Card>
                <h3>Patient Scenario 3</h3>
                <p>
                  A 12-year-old with a history of strabismus surgery, now experiencing
                  increasing eye turn after 3 years of stability.
                </p>
                <CardButton color="#3498db">Examine Patient</CardButton>
              </Card>
            </CardsGrid>
          </ContentSection>
        )}

        {activeMode === 'explore' && (
          <ContentSection>
            <SectionTitle>Learning Resources</SectionTitle>
            <CardsGrid>
              <Card>
                <h3>Basic Eye Anatomy</h3>
                <p>
                  Learn about the structures of the eye and how they work
                  together to provide vision.
                </p>
                <CardButton>View Guide</CardButton>
              </Card>
              <Card>
                <h3>3D Eye Structures</h3>
                <p>
                  Explore the three-dimensional structure of the eye and understand 
                  spatial relationships between different components.
                </p>
                <CardButton onClick={() => setViewMode('3D')}>View in 3D</CardButton>
              </Card>
              <Card>
                <h3>Treatment Options</h3>
                <p>
                  Overview of treatment approaches for various types of
                  strabismus conditions.
                </p>
                <CardButton>View Guide</CardButton>
              </Card>
            </CardsGrid>
          </ContentSection>
        )}
      </Main>

      <Footer>
        <FooterContent>
          <Copyright>
            &copy; {new Date().getFullYear()} Advanced Eye Simulator. For medical education only.
          </Copyright>
          <FooterLinks>
            <a href="#">About</a>
            <a href="#">Help</a>
            <a href="#">Contact</a>
          </FooterLinks>
        </FooterContent>
      </Footer>
    </Container>
  );
};

export default SimulatorLayout; 