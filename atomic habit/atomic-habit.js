document.addEventListener('DOMContentLoaded', function() {
    const readAloudButton = document.getElementById('read-aloud');
    const pauseResumeButton = document.getElementById('pause-resume');
    const voiceSelect = document.getElementById('voice-select');
    const speedControl = document.getElementById('speed-control');
    const progressBar = document.getElementById('progress-bar');
    
    const keyThemesSection = document.querySelector('.additional-content');
    const summaryContent = keyThemesSection ? keyThemesSection.textContent : '';
    
    let utterance = null;
    let speaking = false;
    let paused = false;
    let currentPosition = 0;
    let voices = [];

    const synth = window.speechSynthesis;
    let synthState = {
        speaking: false,
        pending: false,
        paused: false
    };

    function updateSynthState() {
        synthState = {
            speaking: synth.speaking,
            pending: synth.pending,
            paused: synth.paused
        };
    }

    function updateProgressBar() {
        const progress = Math.min((currentPosition / summaryContent.length) * 100, 100);
        progressBar.style.width = `${progress}%`;
    }

    const pitchControl = document.createElement('input');
    pitchControl.type = 'range';
    pitchControl.id = 'pitch-control';
    pitchControl.min = '0.5';
    pitchControl.max = '2';
    pitchControl.step = '0.1';
    pitchControl.value = '1';

    const volumeControl = document.createElement('input');
    volumeControl.type = 'range';
    volumeControl.id = 'volume-control';
    volumeControl.min = '0';
    volumeControl.max = '1';
    volumeControl.step = '0.1';
    volumeControl.value = '1';

    const controlsContainer = document.querySelector('.text-to-speech-controls');
    controlsContainer.insertBefore(pitchControl, speedControl.nextSibling);
    controlsContainer.insertBefore(volumeControl, pitchControl.nextSibling);

    const pitchLabel = document.createElement('label');
    pitchLabel.htmlFor = 'pitch-control';
    pitchLabel.textContent = 'Pitch: ';
    const pitchValue = document.createElement('span');
    pitchValue.id = 'pitch-value';
    pitchValue.textContent = '1x';
    pitchLabel.appendChild(pitchValue);
    controlsContainer.insertBefore(pitchLabel, pitchControl);

    const volumeLabel = document.createElement('label');
    volumeLabel.htmlFor = 'volume-control';
    volumeLabel.textContent = 'Volume: ';
    const volumeValue = document.createElement('span');
    volumeValue.id = 'volume-value';
    volumeValue.textContent = '100%';
    volumeLabel.appendChild(volumeValue);
    controlsContainer.insertBefore(volumeLabel, volumeControl);

    function createUtterance() {
        const utterance = new SpeechSynthesisUtterance(summaryContent.substring(currentPosition));
        utterance.rate = parseFloat(speedControl.value);
        utterance.pitch = parseFloat(pitchControl.value);
        utterance.volume = parseFloat(volumeControl.value);
        utterance.voice = voices[voiceSelect.selectedIndex];

        utterance.onboundary = function(event) {
            if (event.name === 'word') {
                currentPosition = Math.min(currentPosition + event.charIndex, summaryContent.length);
                updateProgressBar();
            }
        };

        utterance.onend = function() {
            if (currentPosition >= summaryContent.length) {
                stopSpeech();
            } else {
                startSpeech();
            }
        };

        return utterance;
    }

    function startSpeech() {
        synth.cancel();
        utterance = new SpeechSynthesisUtterance(summaryContent.substring(currentPosition));
        utterance.rate = parseFloat(speedControl.value);
        utterance.pitch = parseFloat(pitchControl.value);
        utterance.volume = parseFloat(volumeControl.value);
        utterance.voice = voices[voiceSelect.selectedIndex];

        utterance.onboundary = function(event) {
            if (event.name === 'word') {
                currentPosition = Math.min(currentPosition + event.charIndex, summaryContent.length);
                updateProgressBar();
            }
        };

        utterance.onend = function() {
            if (currentPosition >= summaryContent.length) {
                stopSpeech();
            } else {
                startSpeech();
            }
        };

        synth.speak(utterance);
        updateUI('speaking');
    }

    function stopSpeech() {
        synth.cancel();
        currentPosition = 0;
        updateProgressBar();
        updateUI('stopped');
    }

    function pauseSpeech() {
        synth.pause();
        updateUI('paused');
    }

    function resumeSpeech() {
        synth.resume();
        updateUI('speaking');
    }

    function updateUI(state) {
        switch(state) {
            case 'speaking':
                readAloudButton.textContent = '🔇 Stop';
                pauseResumeButton.textContent = '⏸️ Pause';
                pauseResumeButton.style.display = 'inline-block';
                speaking = true;
                paused = false;
                break;
            case 'paused':
                pauseResumeButton.textContent = '▶️ Resume';
                paused = true;
                break;
            case 'stopped':
                readAloudButton.textContent = '🔊 Read Aloud';
                pauseResumeButton.style.display = 'none';
                speaking = false;
                paused = false;
                break;
        }
    }

    readAloudButton.addEventListener('click', function() {
        updateSynthState();
        if (!synthState.speaking && !synthState.pending) {
            startSpeech();
        } else {
            stopSpeech();
        }
    });

    pauseResumeButton.addEventListener('click', function() {
        updateSynthState();
        if (synthState.speaking && !synthState.paused) {
            pauseSpeech();
        } else if (synthState.paused) {
            resumeSpeech();
        }
    });

    speedControl.addEventListener('input', function() {
        const newRate = parseFloat(this.value);
        document.getElementById('speed-value').textContent = `${newRate.toFixed(1)}x`;
        
        if (synth.speaking) {
            updateSpeechParameter('rate', newRate);
        }
    });

    pitchControl.addEventListener('input', function() {
        const newPitch = parseFloat(this.value);
        document.getElementById('pitch-value').textContent = `${newPitch.toFixed(1)}x`;
        
        if (synth.speaking) {
            updateSpeechParameter('pitch', newPitch);
        }
    });

    volumeControl.addEventListener('input', function() {
        const newVolume = parseFloat(this.value);
        document.getElementById('volume-value').textContent = `${(newVolume * 100).toFixed(0)}%`;
        
        if (synth.speaking) {
            updateSpeechParameter('volume', newVolume);
        }
    });

    function updateSpeechParameter(parameter, value) {
        const currentText = utterance.text.substring(currentPosition);
        synth.cancel();
        utterance = new SpeechSynthesisUtterance(currentText);
        utterance.voice = voices[voiceSelect.selectedIndex];
        utterance.rate = parseFloat(speedControl.value);
        utterance.pitch = parseFloat(pitchControl.value);
        utterance.volume = parseFloat(volumeControl.value);
        utterance[parameter] = value;

        utterance.onboundary = function(event) {
            if (event.name === 'word') {
                currentPosition = Math.min(currentPosition + event.charIndex, summaryContent.length);
                updateProgressBar();
            }
        };

        utterance.onend = function() {
            if (currentPosition >= summaryContent.length) {
                stopSpeech();
            } else {
                startSpeech();
            }
        };

        synth.speak(utterance);
    }

    function populateVoiceList() {
        voices = synth.getVoices();
        voiceSelect.innerHTML = '';
        voices.forEach((voice, index) => {
            const option = new Option(voice.name, index);
            voiceSelect.add(option);
        });
    }

    populateVoiceList();
    if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = populateVoiceList;
    }

    voiceSelect.addEventListener('change', function() {
        if (utterance) {
            utterance.voice = voices[this.selectedIndex];
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space' && event.target === document.body) {
            event.preventDefault();
            updateSynthState();
            if (!synthState.speaking && !synthState.pending) {
                startSpeech();
            } else if (synthState.paused) {
                resumeSpeech();
            } else {
                pauseSpeech();
            }
        } else if (event.code === 'ArrowRight' && speaking) {
            event.preventDefault();
            currentPosition = Math.min(currentPosition + 50, summaryContent.length);
            if (!paused) {
                startSpeech();
            }
        } else if (event.code === 'ArrowLeft' && speaking) {
            event.preventDefault();
            currentPosition = Math.max(currentPosition - 50, 0);
            if (!paused) {
                startSpeech();
            }
        }
    });
});
