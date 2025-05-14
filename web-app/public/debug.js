// Debug helper for authentication troubleshooting
document.addEventListener('DOMContentLoaded', function() {
  console.log('Debug tool initialized');

  // Create UI
  const debugPanel = document.createElement('div');
  debugPanel.style.position = 'fixed';
  debugPanel.style.bottom = '10px';
  debugPanel.style.right = '10px';
  debugPanel.style.backgroundColor = 'rgba(0,0,0,0.7)';
  debugPanel.style.color = 'white';
  debugPanel.style.padding = '10px';
  debugPanel.style.borderRadius = '5px';
  debugPanel.style.zIndex = '9999';
  debugPanel.style.fontSize = '12px';
  debugPanel.style.maxWidth = '300px';
  
  // Add toggle button
  const toggleButton = document.createElement('button');
  toggleButton.textContent = 'Auth Debug';
  toggleButton.style.position = 'fixed';
  toggleButton.style.bottom = '10px';
  toggleButton.style.right = '10px'; 
  toggleButton.style.padding = '5px 10px';
  toggleButton.style.backgroundColor = '#3B82F6';
  toggleButton.style.color = 'white';
  toggleButton.style.border = 'none';
  toggleButton.style.borderRadius = '5px';
  toggleButton.style.zIndex = '10000';
  toggleButton.style.cursor = 'pointer';
  
  // Initial state
  let isVisible = false;
  debugPanel.style.display = 'none';
  
  // Toggle functionality
  toggleButton.addEventListener('click', function() {
    isVisible = !isVisible;
    debugPanel.style.display = isVisible ? 'block' : 'none';
    if (isVisible) {
      checkAuth();
    }
  });
  
  // Add buttons
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.gap = '5px';
  buttonContainer.style.marginTop = '10px';
  
  const checkButton = document.createElement('button');
  checkButton.textContent = 'Check Auth';
  checkButton.style.padding = '3px 8px';
  checkButton.style.backgroundColor = '#10B981';
  checkButton.style.color = 'white';
  checkButton.style.border = 'none';
  checkButton.style.borderRadius = '3px';
  checkButton.style.cursor = 'pointer';
  checkButton.addEventListener('click', checkAuth);
  
  const goToSimulator = document.createElement('button');
  goToSimulator.textContent = 'Go to Simulator';
  goToSimulator.style.padding = '3px 8px';
  goToSimulator.style.backgroundColor = '#8B5CF6';
  goToSimulator.style.color = 'white';
  goToSimulator.style.border = 'none';
  goToSimulator.style.borderRadius = '3px';
  goToSimulator.style.cursor = 'pointer';
  goToSimulator.addEventListener('click', function() {
    window.location.assign('/simulator');
  });
  
  const goToLogin = document.createElement('button');
  goToLogin.textContent = 'Go to Login';
  goToLogin.style.padding = '3px 8px';
  goToLogin.style.backgroundColor = '#F59E0B';
  goToLogin.style.color = 'white';
  goToLogin.style.border = 'none';
  goToLogin.style.borderRadius = '3px';
  goToLogin.style.cursor = 'pointer';
  goToLogin.addEventListener('click', function() {
    window.location.assign('/login?callbackUrl=/simulator');
  });
  
  // Content element
  const content = document.createElement('div');
  content.style.marginBottom = '10px';
  
  // Assemble UI
  buttonContainer.appendChild(checkButton);
  buttonContainer.appendChild(goToSimulator);
  buttonContainer.appendChild(goToLogin);
  debugPanel.appendChild(content);
  debugPanel.appendChild(buttonContainer);

  // Add to DOM
  document.body.appendChild(debugPanel);
  document.body.appendChild(toggleButton);
  
  // Auth checking function
  function checkAuth() {
    content.innerHTML = 'Checking auth...';
    
    fetch('/api/debug', {
      credentials: 'include'
    })
    .then(function(response) {
      if (!response.ok) {
        content.innerHTML = 'Error checking auth: ' + response.status;
        return Promise.reject('Error: ' + response.status);
      }
      return response.json();
    })
    .then(function(data) {
      // Format the data
      let html = '<b>Authentication:</b><br>';
      html += 'Cookie exists: ' + (data.authentication.cookieExists ? 'Yes' : 'No') + '<br>';
      html += 'Token valid: ' + (data.authentication.tokenValid ? 'Yes' : 'No') + '<br>';
      
      if (data.authentication.email) {
        html += 'User: ' + data.authentication.email + '<br>';
      }
      
      html += '<br><b>Cookies:</b><br>';
      if (data.cookies && data.cookies.length) {
        html += data.cookies.join('<br>');
      } else {
        html += 'No cookies found';
      }
      
      html += '<br><br><b>Environment:</b><br>';
      html += 'NODE_ENV: ' + data.environment.nodeEnv + '<br>';
      html += 'JWT_SECRET: ' + data.environment.jwtSecret + '<br>';
      
      content.innerHTML = html;
    })
    .catch(function(error) {
      content.innerHTML = 'Error: ' + error;
    });
  }
}); 