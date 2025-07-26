const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');
const modeSwitch = document.getElementById('modeSwitch');
const modeLabel = document.getElementById('modeLabel');
const voiceBtn = document.getElementById('voice');
const micIcon = document.getElementById('mic');

let currentInput = '';
let resultDisplayed = false;

// Calculator logic
function updateDisplay(value) {
  display.textContent = value;
}

function clearDisplay() {
  currentInput = '';
  updateDisplay('0');
}

function calculate() {
  try {
    // Replace × and ÷ with * and /
    const sanitized = currentInput.replace(/×/g, '*').replace(/÷/g, '/');
    const result = eval(sanitized);
    updateDisplay(result);
    currentInput = result.toString();
    resultDisplayed = true;
  } catch {
    updateDisplay('Error');
    currentInput = '';
    resultDisplayed = false;
  }
}

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const value = btn.dataset.value;
    if (btn.id === 'clear') {
      clearDisplay();
    } else if (btn.id === 'equals') {
      calculate();
    } else if (btn.id === 'voice') {
      startVoiceInput();
    } else {
      if (resultDisplayed && !isNaN(value)) {
        currentInput = value;
        resultDisplayed = false;
      } else {
        currentInput += value;
      }
      updateDisplay(currentInput);
    }
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key.match(/[0-9\\.\\+\\-\\*\\/]/)) {
    if (resultDisplayed && e.key.match(/[0-9]/)) {
      currentInput = e.key;
      resultDisplayed = false;
    } else {
      currentInput += e.key;
    }
    updateDisplay(currentInput);
  } else if (e.key === 'Enter') {
    calculate();
  } else if (e.key === 'Escape') {
    clearDisplay();
  }
});

// Dark/Light mode toggle
modeSwitch.addEventListener('change', () => {
  document.body.classList.toggle('dark', modeSwitch.checked);
  modeLabel.textContent = modeSwitch.checked ? 'Dark Mode' : 'Light Mode';
  localStorage.setItem('calcMode', modeSwitch.checked ? 'dark' : 'light');
});

// Load mode from localStorage
window.addEventListener('DOMContentLoaded', () => {
  const savedMode = localStorage.getItem('calcMode');
  if (savedMode === 'dark') {
    document.body.classList.add('dark');
    modeSwitch.checked = true;
    modeLabel.textContent = 'Dark Mode';
  }
});

// Voice input
let recognition;
function startVoiceInput() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Sorry, your browser does not support Speech Recognition.');
    return;
  }
  if (recognition) {
    recognition.stop();
    recognition = null;
    voiceBtn.classList.remove('active');
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  voiceBtn.classList.add('active');
  recognition.start();
  recognition.onresult = (event) => {
    let transcript = event.results[0][0].transcript;
    transcript = transcript.toLowerCase();
    // Improved replacements for multiply and minus
    transcript = transcript.replace(/plus/g, '+')
      .replace(/add|added by/g, '+')
      .replace(/minus|subtract|subtracted by/g, '-')
      .replace(/negative /g, '-')
      .replace(/times|multiply|multiplied by|x /g, '*')
      .replace(/divide|divided by|over/g, '/')
      .replace(/equals|equal/g, '=')
      .replace(/point/g, '.');
    transcript = transcript.replace(/ /g, '');
    // Only allow valid characters
    transcript = transcript.replace(/[^0-9\\+\\-\\*\\/\\.\\=]/g, '');
    if (transcript.includes('=')) {
      currentInput = transcript.replace('=', '');
      updateDisplay(currentInput);
      calculate();
    } else {
      currentInput = transcript;
      updateDisplay(currentInput);
    }
    recognition.stop();
    recognition = null;
    voiceBtn.classList.remove('active');
  };
  recognition.onerror = () => {
    recognition.stop();
    recognition = null;
    voiceBtn.classList.remove('active');
    alert('Could not recognize speech. Please try again.');
  };
  recognition.onend = () => {
    recognition = null;
    voiceBtn.classList.remove('active');
  };
}
  