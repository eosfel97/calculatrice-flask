document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const resultDisplay = document.getElementById('result-display');
    const historyDisplay = document.getElementById('history-display');
    const historyList = document.getElementById('history-list');
    const memoryIndicator = document.getElementById('memory-indicator');
    
    // Variables d'état
    let currentInput = '0';
    let previousInput = '';
    let operation = null;
    let resetInput = false;
    
    // Initialisation
    updateDisplay();
    loadHistory();
    updateMemoryIndicator();
    
    // Gestion des boutons numériques
    document.querySelectorAll('.number-btn').forEach(button => {
        button.addEventListener('click', () => {
            if (currentInput === '0' || resetInput) {
                currentInput = button.dataset.value;
                resetInput = false;
            } else {
                currentInput += button.dataset.value;
            }
            updateDisplay();
        });
    });
    
    // Point décimal
    document.getElementById('decimal-point').addEventListener('click', () => {
        if (resetInput) {
            currentInput = '0.';
            resetInput = false;
        } else if (!currentInput.includes('.')) {
            currentInput += '.';
        }
        updateDisplay();
    });
    
    // Boutons d'opération
    document.querySelectorAll('.operation-btn, .advanced-btn').forEach(button => {
        button.addEventListener('click', () => {
            if (operation !== null && !resetInput) {
                calculate();
            }
            previousInput = currentInput;
            operation = button.dataset.operation;
            historyDisplay.textContent = `${currentInput} ${button.textContent}`;
            resetInput = true;
        });
    });
    
    // Bouton égal
    document.getElementById('equals-btn').addEventListener('click', () => {
        if (operation !== null) {
            calculate();
            operation = null;
        }
    });
    
    // Bouton C (effacer)
    document.getElementById('clear-btn').addEventListener('click', () => {
        currentInput = '0';
        previousInput = '';
        operation = null;
        resetInput = false;
        historyDisplay.textContent = '';
        updateDisplay();
    });
    
    // Mémoire: M+
    document.getElementById('memory-add').addEventListener('click', () => {
        const value = parseFloat(currentInput) || 0;
        fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=memory_add&value=${value}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                updateMemoryIndicator(data.memory);
            }
        });
    });
    
    // Mémoire: MR
    document.getElementById('memory-recall').addEventListener('click', () => {
        fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=memory_recall'
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                currentInput = data.value.toString();
                updateDisplay();
            }
        });
    });
    
    // Effacer l'historique
    document.getElementById('clear-history-btn').addEventListener('click', () => {
        fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=clear'
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                loadHistory(true);
            }
        });
    });
    
    function calculate() {
        const num1 = parseFloat(previousInput);
        const num2 = parseFloat(currentInput);
        
        fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=calculate&num1=${num1}&num2=${num2}&operation=${operation}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                currentInput = data.result.toString();
                previousInput = '';
                historyDisplay.textContent = '';
                resetInput = true;
                updateDisplay();
                loadHistory();
            }
        });
    }
    
    function updateDisplay() {
        resultDisplay.textContent = currentInput;
    }
    
    function loadHistory(clear = false) {
        if (clear) {
            historyList.innerHTML = '<div class="empty-history">Aucun calcul effectué</div>';
            return;
        }
        
        fetch('/')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newHistoryList = doc.getElementById('history-list');
            if (newHistoryList) {
                historyList.innerHTML = newHistoryList.innerHTML;
            }
        });
    }
    
    function updateMemoryIndicator(value = null) {
        if (value !== null) {
            memoryIndicator.textContent = `M: ${value}`;
        }
    }
});