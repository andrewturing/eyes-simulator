import { useState, useEffect } from 'react';
import styled from '@emotion/styled';

const SetupContainer = styled.div`
  padding: 1rem;
  margin: 1rem 0;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: #f9fafb;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  margin-top: 0;
  margin-bottom: 1rem;
  color: #374151;
`;

const ErrorBox = styled.div`
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: #fee2e2;
  border-radius: 0.5rem;
  color: #b91c1c;
`;

const SuccessBox = styled.div`
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: #d1fae5;
  border-radius: 0.5rem;
  color: #065f46;
`;

const Button = styled.button`
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  margin-right: 0.5rem;
  
  &:hover {
    background-color: #2563eb;
  }
  
  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const EnvTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  
  th, td {
    border: 1px solid #e5e7eb;
    padding: 0.5rem;
    text-align: left;
  }
  
  th {
    background-color: #f3f4f6;
  }
`;

const CodeBlock = styled.pre`
  background-color: #1e293b;
  color: #e2e8f0;
  padding: 0.75rem;
  border-radius: 0.25rem;
  overflow-x: auto;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

interface DbStats {
  size: number;
  storageSize: number;
  collections: number;
  indexes: number;
  // Other properties can be added here as needed
}

interface DbStatusResponse {
  status: string;
  message: string;
  database?: {
    name: string;
    collections: string[];
    stats: DbStats;
  };
  error?: string;
  environment?: Record<string, string>;
  authentication?: {
    status: string;
    userId?: string;
    error?: string;
  };
}

export default function DatabaseSetupHelper() {
  const [status, setStatus] = useState<DbStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  
  useEffect(() => {
    checkDatabaseStatus();
  }, []);
  
  const checkDatabaseStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/check-db');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        console.error('Failed to check database status');
      }
    } catch (error) {
      console.error('Error checking database:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const setupDatabase = async () => {
    setIsSettingUp(true);
    try {
      const response = await fetch('/api/db-setup');
      if (response.ok) {
        await checkDatabaseStatus();
        alert('Database setup complete!');
      } else {
        console.error('Failed to set up database');
      }
    } catch (error) {
      console.error('Error setting up database:', error);
    } finally {
      setIsSettingUp(false);
    }
  };
  
  const isConnected = status?.status === 'success';
  
  return (
    <SetupContainer>
      <Title>Database Connection</Title>
      
      {!isLoading && !isConnected && (
        <ErrorBox>
          {status?.message || 'Unable to connect to the MongoDB database'}
        </ErrorBox>
      )}
      
      {!isLoading && isConnected && (
        <SuccessBox>
          {status.message || 'Successfully connected to the database'}
        </SuccessBox>
      )}
      
      <div style={{ marginBottom: '1rem' }}>
        <Button onClick={checkDatabaseStatus} disabled={isLoading}>
          {isLoading ? 'Checking...' : 'Check Connection'}
        </Button>
        <Button onClick={setupDatabase} disabled={isSettingUp}>
          {isSettingUp ? 'Setting up...' : 'Setup Database'}
        </Button>
      </div>
      
      {status?.environment && (
        <>
          <h3>Environment Configuration</h3>
          <EnvTable>
            <thead>
              <tr>
                <th>Variable</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(status.environment).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </EnvTable>
        </>
      )}
      
      {!isConnected && (
        <>
          <h3>Troubleshooting Steps</h3>
          <ol>
            <li>Check that your MongoDB is running and accessible</li>
            <li>Verify the connection details in your .env file</li>
            <li>Make sure your MongoDB user has the correct permissions</li>
            <li>Check network connectivity between your application and database</li>
          </ol>
          
          <h3>Required .env Configuration</h3>
          <CodeBlock>{`MONGODB_DATABASE=EyesSimulator
MONGODB_USER=admin
MONGODB_PASSWORD=yourpassword
MONGODB_HOST=yourhostname
MONGODB_PORT=27017

# Authentication
JWT_SECRET=yoursecretkey`}</CodeBlock>
        </>
      )}
      
      {status?.database && (
        <>
          <h3>Database Information</h3>
          <p>Name: {status.database.name}</p>
          <p>Collections: {status.database.collections.join(', ') || 'No collections found'}</p>
        </>
      )}
    </SetupContainer>
  );
} 