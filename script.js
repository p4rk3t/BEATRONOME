// Элементы DOM
const bpmSlider = document.getElementById('bpmSlider');
const bpmValue = document.getElementById('bpmValue');
const increaseBpm = document.getElementById('increaseBpm');
const decreaseBpm = document.getElementById('decreaseBpm');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const metronomeVisual = document.getElementById('metronomeVisual');
const pendulum = document.getElementById('pendulum');
const indicator = document.getElementById('indicator');
const statusText = document.getElementById('statusText');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');

// Аудио контекст и элементы
let audioContext;
let metronomeInterval;
let pendulumAnimationTimeout;
let isRunning = false;
let currentBpm = 120;
let currentVolume = 0.5;
let pendulumDirection = 1;
let isPendulumAnimating = false;

// Инициализация аудио контекста
function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

// Воспроизведение звука метронома
function playClick() {
    if (!audioContext) initAudio();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 800;
    gainNode.gain.value = currentVolume;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.05);
    
    // Анимация индикатора
    metronomeVisual.classList.add('active');
    setTimeout(() => {
        metronomeVisual.classList.remove('active');
    }, 100);
}

// Анимация маятника
function animatePendulum() {
    if (!isRunning || isPendulumAnimating) return;
    
    isPendulumAnimating = true;
    const interval = 60000 / currentBpm;
    const swingDuration = interval / 2;
    
    pendulumDirection *= -1;
    
    pendulum.style.transitionDuration = `${swingDuration}ms`;
    pendulum.style.transform = `translateX(-50%) rotate(${pendulumDirection * 30}deg)`;
    
    // Звук в середине анимации
    setTimeout(() => {
        if (isRunning) {
            playClick();
        }
    }, swingDuration / 2);
    
    // Завершение анимации
    setTimeout(() => {
        isPendulumAnimating = false;
        if (isRunning) {
            animatePendulum();
        }
    }, swingDuration);
}

// Запуск метронома
function startMetronome() {
    if (isRunning) return;
    
    isRunning = true;
    isPendulumAnimating = false;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    statusText.textContent = `Метроном работает: ${currentBpm} BPM`;
    statusText.classList.add('status-active');
    
    // Сброс положения
    pendulum.style.transitionDuration = '0ms';
    pendulum.style.transform = 'translateX(-50%) rotate(0deg)';
    
    // Первый удар
    playClick();
    
    // Начало анимации
    setTimeout(() => {
        pendulum.style.transitionDuration = `${30000 / currentBpm}ms`;
        animatePendulum();
    }, 10);
    
    // Контрольный интервал
    metronomeInterval = setInterval(() => {
        if (!isPendulumAnimating && isRunning) {
            animatePendulum();
        }
    }, 60000 / currentBpm);
}

// Остановка метронома
function stopMetronome() {
    if (!isRunning) return;
    
    isRunning = false;
    isPendulumAnimating = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    statusText.textContent = "Метроном остановлен";
    statusText.classList.remove('status-active');
    
    clearInterval(metronomeInterval);
    clearTimeout(pendulumAnimationTimeout);
    
    // Плавный возврат в центр
    pendulum.style.transitionDuration = '0.3s';
    pendulum.style.transform = 'translateX(-50%) rotate(0deg)';
}

// Обновление BPM
function updateBpm() {
    currentBpm = parseInt(bpmSlider.value);
    bpmValue.textContent = currentBpm;
    
    if (isRunning) {
        statusText.textContent = `Метроном работает: ${currentBpm} BPM`;
        
        clearInterval(metronomeInterval);
        clearTimeout(pendulumAnimationTimeout);
        
        metronomeInterval = setInterval(() => {
            if (!isPendulumAnimating && isRunning) {
                animatePendulum();
            }
        }, 60000 / currentBpm);
        
        if (!isPendulumAnimating) {
            animatePendulum();
        }
    }
}

// Обновление громкости
function updateVolume() {
    currentVolume = parseFloat(volumeSlider.value);
    volumeValue.textContent = `${Math.round(currentVolume * 100)}%`;
}

// Обработчики событий
bpmSlider.addEventListener('input', updateBpm);
increaseBpm.addEventListener('click', () => {
    bpmSlider.value = parseInt(bpmSlider.value) + 1;
    updateBpm();
});
decreaseBpm.addEventListener('click', () => {
    bpmSlider.value = parseInt(bpmSlider.value) - 1;
    updateBpm();
});
startBtn.addEventListener('click', startMetronome);
stopBtn.addEventListener('click', stopMetronome);
volumeSlider.addEventListener('input', updateVolume);

// Инициализация при загрузке
window.addEventListener('load', () => {
    initAudio();
    updateVolume();
});