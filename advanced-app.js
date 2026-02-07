// Global o'zgaruvchilar
let allTests = [];
let currentTest = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let userName = "";
let startTime = null;
let timerInterval = null;
let timeElapsed = 0;
let editingQuestionIndex = -1;

// LocalStorage'dan testlarni yuklash
function loadTests() {
    const savedTests = localStorage.getItem('allTests');
    if (savedTests) {
        allTests = JSON.parse(savedTests);
    } else {
        // Default test
        allTests = [{
            id: Date.now(),
            name: "JavaScript Asoslari",
            description: "JavaScript dasturlash tilining asosiy tushunchalari bo'yicha test",
            time: 30,
            difficulty: "O'rta",
            createdAt: new Date().toISOString(),
            questions: [
                {
                    question: "JavaScript qayerda ishlaydi?",
                    options: ["Browser", "Printer", "Scanner", "Faqat serverlarda"],
                    answer: 0
                },
                {
                    question: "HTML nima uchun ishlatiladi?",
                    options: ["Ma'lumotlar bazasi", "Veb sahifa tuzilmasi", "O'yin yaratish", "Grafik dizayn"],
                    answer: 1
                },
                {
                    question: "CSS ning asosiy vazifasi nima?",
                    options: ["Ma'lumotlarni saqlash", "Sahifani stilizatsiya qilish", "Dastur logikasi", "Backend yaratish"],
                    answer: 1
                }
            ]
        }];
        saveTests();
    }
}

// Testlarni saqlash
function saveTests() {
    localStorage.setItem('allTests', JSON.stringify(allTests));
}

// Screen management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Bosh sahifaga qaytish
function backToMenu() {
    showScreen('mainMenu');
    if (timerInterval) {
        clearInterval(timerInterval);
    }
}

// Test yaratish ekranini ko'rsatish
function showCreateTest() {
    showScreen('createTestScreen');
    document.getElementById('testName').value = '';
    document.getElementById('testDescription').value = '';
    document.getElementById('testTime').value = 30;
    document.getElementById('testDifficulty').value = "O'rta";
    document.getElementById('questionsList').innerHTML = '';
    updateQuestionCount();
}

// Test ro'yxatini ko'rsatish
function showTestList() {
    showScreen('testListScreen');
    displayTestsList();
}

// Mening testlarim
function showMyTests() {
    showScreen('myTestsScreen');
    displayMyTests();
}

// Savol qo'shish
function addQuestion() {
    const questionsList = document.getElementById('questionsList');
    const questionNumber = questionsList.children.length + 1;
    
    const questionItem = document.createElement('div');
    questionItem.className = 'question-item';
    questionItem.innerHTML = `
        <div class="question-item-header">
            <div class="question-number-badge">Savol ${questionNumber}</div>
            <div class="question-item-actions">
                <button class="btn-icon btn-delete" onclick="deleteQuestion(this)">🗑️</button>
            </div>
        </div>
        
        <div class="question-input-group">
            <label>Savol matni</label>
            <input type="text" class="question-text-input modern-input" placeholder="Savolni kiriting...">
        </div>
        
        <div class="question-input-group">
            <label>Javob variantlari</label>
            <div class="options-inputs">
                <div class="option-input-row">
                    <div class="option-letter-label">A</div>
                    <input type="text" class="option-text-input modern-input" placeholder="Variant A...">
                    <input type="checkbox" class="correct-checkbox" title="To'g'ri javob">
                </div>
                <div class="option-input-row">
                    <div class="option-letter-label">B</div>
                    <input type="text" class="option-text-input modern-input" placeholder="Variant B...">
                    <input type="checkbox" class="correct-checkbox" title="To'g'ri javob">
                </div>
                <div class="option-input-row">
                    <div class="option-letter-label">C</div>
                    <input type="text" class="option-text-input modern-input" placeholder="Variant C...">
                    <input type="checkbox" class="correct-checkbox" title="To'g'ri javob">
                </div>
                <div class="option-input-row">
                    <div class="option-letter-label">D</div>
                    <input type="text" class="option-text-input modern-input" placeholder="Variant D...">
                    <input type="checkbox" class="correct-checkbox" title="To'g'ri javob">
                </div>
            </div>
            <button class="add-option-btn" onclick="addOption(this)">
                ➕ Yana variant qo'shish
            </button>
        </div>
    `;
    
    questionsList.appendChild(questionItem);
    updateQuestionCount();
    
    // Checkbox'lar uchun event listener
    const checkboxes = questionItem.querySelectorAll('.correct-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                checkboxes.forEach(cb => {
                    if (cb !== this) cb.checked = false;
                });
            }
        });
    });
    
    questionItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Variant qo'shish
function addOption(button) {
    const optionsInputs = button.previousElementSibling;
    const optionCount = optionsInputs.children.length;
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    
    if (optionCount >= 10) {
        alert('Maksimal 10 ta variant qo\'shish mumkin!');
        return;
    }
    
    const newOption = document.createElement('div');
    newOption.className = 'option-input-row';
    newOption.innerHTML = `
        <div class="option-letter-label">${letters[optionCount]}</div>
        <input type="text" class="option-text-input modern-input" placeholder="Variant ${letters[optionCount]}...">
        <input type="checkbox" class="correct-checkbox" title="To'g'ri javob">
    `;
    
    optionsInputs.appendChild(newOption);
    
    // Checkbox event listener
    const questionItem = button.closest('.question-item');
    const checkboxes = questionItem.querySelectorAll('.correct-checkbox');
    const newCheckbox = newOption.querySelector('.correct-checkbox');
    
    newCheckbox.addEventListener('change', function() {
        if (this.checked) {
            checkboxes.forEach(cb => {
                if (cb !== this) cb.checked = false;
            });
        }
    });
}

// Savolni o'chirish
function deleteQuestion(button) {
    if (confirm('Bu savolni o\'chirmoqchimisiz?')) {
        button.closest('.question-item').remove();
        updateQuestionNumbers();
        updateQuestionCount();
    }
}

// Savol raqamlarini yangilash
function updateQuestionNumbers() {
    const questions = document.querySelectorAll('.question-item');
    questions.forEach((item, index) => {
        item.querySelector('.question-number-badge').textContent = `Savol ${index + 1}`;
    });
}

// Savollar sonini yangilash
function updateQuestionCount() {
    const count = document.querySelectorAll('.question-item').length;
    document.getElementById('questionCount').textContent = `(${count})`;
}

// Testni saqlash
function saveTest() {
    const testName = document.getElementById('testName').value.trim();
    const testDescription = document.getElementById('testDescription').value.trim();
    const testTime = parseInt(document.getElementById('testTime').value);
    const testDifficulty = document.getElementById('testDifficulty').value;
    
    if (!testName) {
        alert('Test nomini kiriting!');
        return;
    }
    
    const questionItems = document.querySelectorAll('.question-item');
    if (questionItems.length === 0) {
        alert('Kamida bitta savol qo\'shing!');
        return;
    }
    
    const questions = [];
    let hasError = false;
    
    questionItems.forEach((item, index) => {
        const questionText = item.querySelector('.question-text-input').value.trim();
        const optionInputs = item.querySelectorAll('.option-text-input');
        const checkboxes = item.querySelectorAll('.correct-checkbox');
        
        if (!questionText) {
            alert(`Savol ${index + 1}: Savol matnini kiriting!`);
            hasError = true;
            return;
        }
        
        const options = [];
        let hasCorrectAnswer = false;
        let correctAnswerIndex = -1;
        
        optionInputs.forEach((input, i) => {
            const optionText = input.value.trim();
            if (optionText) {
                options.push(optionText);
                if (checkboxes[i].checked) {
                    hasCorrectAnswer = true;
                    correctAnswerIndex = options.length - 1;
                }
            }
        });
        
        if (options.length < 2) {
            alert(`Savol ${index + 1}: Kamida 2 ta variant kiriting!`);
            hasError = true;
            return;
        }
        
        if (!hasCorrectAnswer) {
            alert(`Savol ${index + 1}: To'g'ri javobni belgilang!`);
            hasError = true;
            return;
        }
        
        questions.push({
            question: questionText,
            options: options,
            answer: correctAnswerIndex
        });
    });
    
    if (hasError || questions.length === 0) {
        return;
    }
    
    const newTest = {
        id: Date.now(),
        name: testName,
        description: testDescription || "Test tavsifi kiritilmagan",
        time: testTime,
        difficulty: testDifficulty,
        createdAt: new Date().toISOString(),
        questions: questions
    };
    
    allTests.push(newTest);
    saveTests();
    
    alert('✅ Test muvaffaqiyatli saqlandi!');
    backToMenu();
}

// Testlar ro'yxatini ko'rsatish
function displayTestsList() {
    const testsGrid = document.getElementById('testsGrid');
    testsGrid.innerHTML = '';
    
    if (allTests.length === 0) {
        testsGrid.innerHTML = `
            <div class="empty-state">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <h3>Hozircha testlar yo'q</h3>
                <p>Birinchi testingizni yarating!</p>
            </div>
        `;
        return;
    }
    
    allTests.forEach(test => {
        const card = createTestCard(test);
        testsGrid.appendChild(card);
    });
}

// Mening testlarim ro'yxati
function displayMyTests() {
    const myTestsGrid = document.getElementById('myTestsGrid');
    myTestsGrid.innerHTML = '';
    
    if (allTests.length === 0) {
        myTestsGrid.innerHTML = `
            <div class="empty-state">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <h3>Siz hali test yaratmagansiz</h3>
                <p>Yangi test yarating!</p>
            </div>
        `;
        return;
    }
    
    allTests.forEach(test => {
        const card = createTestCard(test, true);
        myTestsGrid.appendChild(card);
    });
}

// Test kartochkasini yaratish
function createTestCard(test, showActions = false) {
    const card = document.createElement('div');
    card.className = 'test-card';
    
    const date = new Date(test.createdAt).toLocaleDateString('uz-UZ');
    
    card.innerHTML = `
        <div class="test-card-header">
            <div class="test-card-icon">📝</div>
        </div>
        <h3>${test.name}</h3>
        <p>${test.description}</p>
        <div class="test-card-stats">
            <div class="test-stat">
                <div class="test-stat-label">Savollar</div>
                <div class="test-stat-value">${test.questions.length}</div>
            </div>
            <div class="test-stat">
                <div class="test-stat-label">Vaqt</div>
                <div class="test-stat-value">${test.time} daq</div>
            </div>
            <div class="test-stat">
                <div class="test-stat-label">Qiyinlik</div>
                <div class="test-stat-value">${test.difficulty}</div>
            </div>
        </div>
        ${showActions ? `
            <div class="test-card-actions">
                <button class="btn-secondary btn-small" onclick="deleteTest(${test.id})">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"/>
                    </svg>
                    O'chirish
                </button>
            </div>
        ` : ''}
    `;
    
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.test-card-actions')) {
            selectTest(test);
        }
    });
    
    return card;
}

// Testni tanlash
function selectTest(test) {
    currentTest = test;
    
    document.getElementById('selectedTestName').textContent = test.name;
    document.getElementById('selectedTestDescription').textContent = test.description;
    document.getElementById('totalQuestions').textContent = test.questions.length;
    document.getElementById('testTimeDisplay').textContent = test.time + ' daqiqa';
    document.getElementById('testDifficultyDisplay').textContent = test.difficulty;
    
    showScreen('welcomeScreen');
}

// Test ro'yxatiga qaytish
function backToTestList() {
    showScreen('testListScreen');
}

// Testni o'chirish
function deleteTest(testId) {
    if (confirm('Bu testni o\'chirmoqchimisiz?')) {
        allTests = allTests.filter(t => t.id !== testId);
        saveTests();
        displayMyTests();
    }
}

// Test boshlash
function startTest() {
    const input = document.getElementById('userName');
    userName = input.value.trim();
    
    if (!userName) {
        alert("Iltimos, ismingizni kiriting!");
        input.focus();
        return;
    }
    
    if (!currentTest) {
        alert("Test tanlanmagan!");
        return;
    }
    
    // Initialize
    currentQuestionIndex = 0;
    userAnswers = new Array(currentTest.questions.length).fill(null);
    startTime = Date.now();
    timeElapsed = 0;
    
    // Update UI
    document.getElementById('displayName').textContent = userName;
    document.getElementById('userAvatar').textContent = userName.charAt(0).toUpperCase();
    document.getElementById('totalQ').textContent = currentTest.questions.length;
    
    // Create question navigator
    createQuestionNavigator();
    
    // Show first question
    displayQuestion();
    
    // Start timer
    startTimer();
    
    // Show quiz screen
    showScreen('quizScreen');
}

// Timer
function startTimer() {
    const maxTime = currentTest.time * 60; // daqiqalarni soniyalarga aylantirish
    timerInterval = setInterval(() => {
        timeElapsed++;
        const remaining = maxTime - timeElapsed;
        
        if (remaining <= 0) {
            finishTest();
            return;
        }
        
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        document.getElementById('timeLeft').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Savol ko'rsatish
function displayQuestion() {
    const question = currentTest.questions[currentQuestionIndex];
    const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    
    document.getElementById('questionText').textContent = question.question;
    document.getElementById('qNum').textContent = currentQuestionIndex + 1;
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    
    // Progress bar
    const progress = ((currentQuestionIndex + 1) / currentTest.questions.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    
    // Options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        if (userAnswers[currentQuestionIndex] === index) {
            optionDiv.classList.add('selected');
        }
        optionDiv.onclick = () => selectOption(index);
        
        optionDiv.innerHTML = `
            <div class="option-letter">${optionLetters[index]}</div>
            <div class="option-text">${option}</div>
        `;
        
        optionsContainer.appendChild(optionDiv);
    });
    
    // Update navigation
    updateQuestionNav();
    
    // Button states
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    
    const nextBtn = document.getElementById('nextBtn');
    if (currentQuestionIndex === currentTest.questions.length - 1) {
        nextBtn.innerHTML = `
            Yakunlash
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
            </svg>
        `;
    } else {
        nextBtn.innerHTML = `
            Keyingi
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
            </svg>
        `;
    }
}

// Javobni tanlash
function selectOption(optionIndex) {
    userAnswers[currentQuestionIndex] = optionIndex;
    displayQuestion();
}

// Keyingi savol
function nextQuestion() {
    if (currentQuestionIndex < currentTest.questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        finishTest();
    }
}

// Oldingi savol
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

// Savol navigatori yaratish
function createQuestionNavigator() {
    const navGrid = document.getElementById('questionNav');
    navGrid.innerHTML = '';
    
    currentTest.questions.forEach((_, index) => {
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        btn.textContent = index + 1;
        btn.onclick = () => jumpToQuestion(index);
        navGrid.appendChild(btn);
    });
}

// Savol navigatorini yangilash
function updateQuestionNav() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach((btn, index) => {
        btn.classList.remove('active', 'answered');
        if (index === currentQuestionIndex) {
            btn.classList.add('active');
        } else if (userAnswers[index] !== null) {
            btn.classList.add('answered');
        }
    });
}

// Savolga o'tish
function jumpToQuestion(index) {
    currentQuestionIndex = index;
    displayQuestion();
}

// Testni yakunlash
function finishTest() {
    clearInterval(timerInterval);
    
    // Calculate results
    let correctCount = 0;
    currentTest.questions.forEach((question, index) => {
        if (userAnswers[index] === question.answer) {
            correctCount++;
        }
    });
    
    const incorrectCount = currentTest.questions.length - correctCount;
    const percentage = Math.round((correctCount / currentTest.questions.length) * 100);
    
    // Update results UI
    document.getElementById('scorePercentage').textContent = percentage + '%';
    document.getElementById('correctAnswers').textContent = correctCount;
    document.getElementById('incorrectAnswers').textContent = incorrectCount;
    
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    document.getElementById('timeTaken').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Congratulation message
    let message = '';
    if (percentage >= 90) {
        message = 'Ajoyib! Siz a\'lo natijaga erishdingiz! ';
    } else if (percentage >= 70) {
        message = 'Juda yaxshi! Davom eting! ';
    } else if (percentage >= 50) {
        message = 'Yaxshi, lekin yana mashq qiling! ';
    } else {
        message = 'Yana bir bor urinib ko\'ring! ';
    }
    document.getElementById('congratsMessage').textContent = message;
    
    // Animate score circle
    animateScoreCircle(percentage);
    
    // Show results screen
    showScreen('resultsScreen');
}

// Score circle animatsiyasi
function animateScoreCircle(percentage) {
    const circle = document.getElementById('scoreCircle');
    const circumference = 2 * Math.PI * 80;
    const offset = circumference - (percentage / 100) * circumference;
    
    // Add gradient
    const svg = circle.closest('svg');
    if (!svg.querySelector('#scoreGradient')) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.id = 'scoreGradient';
        gradient.innerHTML = `
            <stop offset="0%" stop-color="#667eea"/>
            <stop offset="100%" stop-color="#764ba2"/>
        `;
        defs.appendChild(gradient);
        svg.appendChild(defs);
    }
    
    setTimeout(() => {
        circle.style.strokeDashoffset = offset;
    }, 100);
}

// Javoblarni ko'rish
function reviewAnswers() {
    const reviewSection = document.getElementById('reviewSection');
    const reviewContent = document.getElementById('reviewContent');
    
    reviewContent.innerHTML = '';
    
    currentTest.questions.forEach((question, index) => {
        const isCorrect = userAnswers[index] === question.answer;
        const itemDiv = document.createElement('div');
        itemDiv.className = `review-item ${isCorrect ? 'correct' : 'incorrect'}`;
        
        const userAnswerText = userAnswers[index] !== null 
            ? question.options[userAnswers[index]] 
            : 'Javob berilmagan';
        
        itemDiv.innerHTML = `
            <div class="review-question">
                ${index + 1}. ${question.question}
            </div>
            <div class="review-answer">
                <div class="review-label">Sizning javobingiz:</div>
                <div style="color: ${isCorrect ? '#10b981' : '#ef4444'}; font-weight: 600;">
                    ${userAnswerText}
                </div>
            </div>
            ${!isCorrect ? `
                <div class="review-answer">
                    <div class="review-label">To'g'ri javob:</div>
                    <div style="color: #10b981; font-weight: 600;">
                        ${question.options[question.answer]}
                    </div>
                </div>
            ` : ''}
        `;
        
        reviewContent.appendChild(itemDiv);
    });
    
    reviewSection.style.display = 'block';
    reviewSection.scrollIntoView({ behavior: 'smooth' });
}

// Qidiruv
document.addEventListener('DOMContentLoaded', function() {
    loadTests();
    
    const searchInput = document.getElementById('searchTests');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const testCards = document.querySelectorAll('.test-card');
            
            testCards.forEach(card => {
                const testName = card.querySelector('h3').textContent.toLowerCase();
                const testDesc = card.querySelector('p').textContent.toLowerCase();
                
                if (testName.includes(searchTerm) || testDesc.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
    
    // Enter tugmasi
    const userNameInput = document.getElementById('userName');
    if (userNameInput) {
        userNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                startTest();
            }
        });
    }
});
