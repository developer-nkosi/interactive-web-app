// Mobile Navigation
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navOverlay = document.querySelector('.nav-overlay');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    navOverlay.classList.toggle('active');
});

navOverlay.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
    navOverlay.classList.remove('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        navOverlay.classList.remove('active');
    });
});

// ==================== TO-DO LIST ====================
let todoInput, addTodoBtn, todoList, todoCount, clearCompleted, filterBtns;
let todos = [];
let currentFilter = 'all';

function initTodoApp() {
    todoInput = document.getElementById('todoInput');
    addTodoBtn = document.getElementById('addTodoBtn');
    todoList = document.getElementById('todoList');
    todoCount = document.getElementById('todoCount');
    clearCompleted = document.getElementById('clearCompleted');
    filterBtns = document.querySelectorAll('.filter-btn');

    try {
        const savedTodos = localStorage.getItem('todos');
        todos = savedTodos ? JSON.parse(savedTodos) : [];
    } catch (e) {
        console.error("Error parsing todos from localStorage:", e);
        todos = [];
    }

    if (addTodoBtn) {
        addTodoBtn.addEventListener('click', () => {
            if (todoInput) addTodo(todoInput.value);
        });
    }

    if (todoInput) {
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTodo(todoInput.value);
        });
    }

    if (todoList) {
        todoList.addEventListener('click', (e) => {
            const checkbox = e.target.closest('.todo-checkbox');
            const deleteBtn = e.target.closest('.todo-delete');
            
            if (checkbox) {
                toggleTodo(parseInt(checkbox.dataset.id));
            }
            
            if (deleteBtn) {
                deleteTodo(parseInt(deleteBtn.dataset.id));
            }
        });
    }

    if (filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                renderTodos();
            });
        });
    }

    if (clearCompleted) {
        clearCompleted.addEventListener('click', clearCompletedTodos);
    }

    renderTodos();
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
    if (!todoList || !todoCount) return;
    
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'pending') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });

    todoList.innerHTML = '';

    if (filteredTodos.length === 0) {
        let message = 'No tasks yet. Add one above!';
        if (currentFilter === 'pending') message = 'No pending tasks!';
        if (currentFilter === 'completed') message = 'No completed tasks!';
        
        todoList.innerHTML = `
            <div class="todo-empty">
                <i class="fas fa-clipboard-list"></i>
                <p>${message}</p>
            </div>
        `;
    } else {
        filteredTodos.forEach((todo) => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            li.innerHTML = `
                <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" data-id="${todo.id}"></div>
                <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
                <button class="todo-delete" data-id="${todo.id}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            todoList.appendChild(li);
        });
    }

    const pendingCount = todos.filter(t => !t.completed).length;
    const completedCount = todos.filter(t => t.completed).length;
    const totalCountVal = todos.length;
    todoCount.textContent = `${totalCountVal} added, ${pendingCount} pending, ${completedCount} completed`;
}

function addTodo(text) {
    if (text.trim() === '') return;
    
    todos.push({
        id: Date.now(),
        text: text.trim(),
        completed: false
    });
    
    saveTodos();
    renderTodos();
    if (todoInput) {
        todoInput.value = '';
        todoInput.focus();
    }
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
}

function clearCompletedTodos() {
    todos = todos.filter(t => !t.completed);
    saveTodos();
    renderTodos();
}

// Call initialization
initTodoApp();

// ==================== BACKGROUND PARTICLES (Three.js) ====================
function initParticles() {
    const canvas = document.getElementById('bg-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8;

    // Create a star texture
    const createStarTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        ctx.beginPath();
        const centerX = 16;
        const centerY = 16;
        const points = 5;
        const outerRadius = 14;
        const innerRadius = 6;
        
        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (Math.PI * i) / points - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        
        ctx.closePath();
        ctx.fillStyle = 'white';
        ctx.fill();
        
        return new THREE.CanvasTexture(canvas);
    };

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1600;
    const posArray = new Float32Array(particlesCount * 3);
    const initialPositions = new Float32Array(particlesCount * 3);
    const velocities = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        const pos = (Math.random() - 0.5) * 20;
        posArray[i] = pos;
        initialPositions[i] = pos;
        velocities[i] = (Math.random() - 0.5) * 0.008;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Get color from CSS variable or default to black/white
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const particleColor = isDarkMode ? 0xffffff : 0x000000;

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.06,
        color: particleColor,
        transparent: true,
        opacity: 0.35,
        map: createStarTexture(),
        alphaTest: 0.001
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Update particle color when theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        particlesMaterial.color.setHex(e.matches ? 0xffffff : 0x000000);
    });

    // Mouse interaction
    const mouse = new THREE.Vector2(-100, -100);
    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    const raycaster = new THREE.Raycaster();

    function animate() {
        requestAnimationFrame(animate);
        
        particlesMesh.rotation.y += 0.001;
        particlesMesh.rotation.x += 0.0005;

        // Interaction logic
        const positions = particlesGeometry.attributes.position.array;
        raycaster.setFromCamera(mouse, camera);

        for (let i = 0; i < particlesCount; i++) {
            const ix = i * 3;
            const iy = i * 3 + 1;
            const iz = i * 3 + 2;

            // Simple movement
            positions[ix] += velocities[ix];
            positions[iy] += velocities[iy];
            positions[iz] += velocities[iz];

            // Boundary check
            if (Math.abs(positions[ix]) > 10) velocities[ix] *= -1;
            if (Math.abs(positions[iy]) > 10) velocities[iy] *= -1;
            if (Math.abs(positions[iz]) > 10) velocities[iz] *= -1;

            // Cursor interaction - repel + swirl
            const dx = mouse.x * 5 - positions[ix];
            const dy = mouse.y * 5 - positions[iy];
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 2.0) {
                const force = (2.0 - distance) / 2.0;
                positions[ix] -= dx * force * 0.08;
                positions[iy] -= dy * force * 0.08;
                // Add swirl perpendicular to mouse direction
                positions[ix] -= dy * force * 0.03;
                positions[iy] += dx * force * 0.03;
            }

            // Gentle drift back toward initial position
            positions[ix] += (initialPositions[ix] - positions[ix]) * 0.001;
            positions[iy] += (initialPositions[iy] - positions[iy]) * 0.001;
            positions[iz] += (initialPositions[iz] - positions[iz]) * 0.001;
        }
        particlesGeometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
}

initParticles();

// ==================== QUIZ APP ====================
const quizCategories = {
    javascript: [
        {
            question: "Which keyword is used to declare a variable that can be reassigned in JavaScript?",
            options: ["var", "let", "const", "define"],
            correct: 1
        },
        {
            question: "What does DOM stand for?",
            options: ["Data Object Model", "Document Object Model", "Digital Output Mode", "Document Oriented Mapping"],
            correct: 1
        },
        {
            question: "Which method is used to select an element by its ID?",
            options: ["querySelector()", "getElement()", "getElementById()", "findElement()"],
            correct: 2
        },
        {
            question: "What is the output of typeof null?",
            options: ["null", "undefined", "object", "boolean"],
            correct: 2
        },
        {
            question: "Which symbol is used for single-line comments in JavaScript?",
            options: ["/*", "//", "#", "--"],
            correct: 1
        },
        {
            question: "What method is used to add an element at the end of an array?",
            options: ["append()", "push()", "add()", "insert()"],
            correct: 1
        },
        {
            question: "Which operator is used to compare both value and type?",
            options: ["==", "===", "=", "!="],
            correct: 1
        },
        {
            question: "What does JSON stand for?",
            options: ["Java Source Object Notation", "JavaScript Object Notation", "Java Standard Output Network", "JSON Text Object Notation"],
            correct: 1
        },
        {
            question: "Which built-in method converts a JSON string to a JavaScript object?",
            options: ["JSON.parse()", "JSON.stringify()", "JSON.convert()", "JSON.object()"],
            correct: 0
        },
        {
            question: "What is the correct way to write an arrow function?",
            options: ["function => {}", "() => {}", "=> function {}", "func => ()"],
            correct: 1
        }
    ],
    computerScience: [
        {
            question: "What is the primary function of an Operating System?",
            options: ["Resource Management", "Web Browsing", "Word Processing", "Compiling Code"],
            correct: 0
        },
        {
            question: "Which of the following is a non-volatile memory?",
            options: ["RAM", "Cache", "Register", "ROM"],
            correct: 3
        },
        {
            question: "What does CPU stand for?",
            options: ["Central Process Unit", "Computer Processing Unit", "Central Processing Unit", "Core Processing Unit"],
            correct: 2
        },
        {
            question: "In binary, what is the value of 1011?",
            options: ["9", "11", "13", "15"],
            correct: 1
        },
        {
            question: "Which layer of the OSI model is responsible for routing?",
            options: ["Physical", "Data Link", "Network", "Transport"],
            correct: 2
        }
    ],
    algorithms: [
        {
            question: "What is the time complexity of Binary Search?",
            options: ["O(n)", "O(n log n)", "O(log n)", "O(1)"],
            correct: 2
        },
        {
            question: "Which algorithm is used to find the shortest path in a weighted graph?",
            options: ["BFS", "DFS", "Dijkstra's", "Bubble Sort"],
            correct: 2
        },
        {
            question: "What is a 'Stable' sorting algorithm?",
            options: ["One that uses O(1) space", "One that preserves relative order of equal elements", "One that always takes O(n log n)", "One that works only on integers"],
            correct: 1
        },
        {
            question: "Which data structure is typically used to implement BFS?",
            options: ["Stack", "Queue", "Priority Queue", "Tree"],
            correct: 1
        },
        {
            question: "What is the worst-case complexity of Quick Sort?",
            options: ["O(n log n)", "O(n)", "O(n^2)", "O(log n)"],
            correct: 2
        }
    ],
    oop: [
        {
            question: "Which principle of OOP allows one class to acquire the properties of another?",
            options: ["Encapsulation", "Polymorphism", "Inheritance", "Abstraction"],
            correct: 2
        },
        {
            question: "What is 'Polymorphism'?",
            options: ["Hiding internal details", "Multiple forms of a method", "Restricting access to data", "Creating multiple objects"],
            correct: 1
        },
        {
            question: "What is an 'Abstract Class'?",
            options: ["A class that cannot be instantiated", "A class with no methods", "A class that is private", "A class with only static methods"],
            correct: 0
        },
        {
            question: "Which OOP concept uses 'Private' and 'Public' keywords?",
            options: ["Inheritance", "Abstraction", "Encapsulation", "Polymorphism"],
            correct: 2
        },
        {
            question: "What is a 'Constructor'?",
            options: ["A method to delete an object", "A method to initialize an object", "A tool to build the UI", "A static class"],
            correct: 1
        }
    ],
    dataStructures: [
        {
            question: "Which data structure works on the LIFO principle?",
            options: ["Queue", "Linked List", "Stack", "Heap"],
            correct: 2
        },
        {
            question: "What is the main advantage of a Linked List over an Array?",
            options: ["Faster access time", "Dynamic size", "Less memory usage", "Cache friendliness"],
            correct: 1
        },
        {
            question: "In a Binary Search Tree, where is the smaller value located relative to the root?",
            options: ["Right child", "Left child", "Both sides", "Nowhere"],
            correct: 1
        },
        {
            question: "Which data structure is used for a 'Last-In, First-Out' access pattern?",
            options: ["Queue", "Stack", "Array", "Graph"],
            correct: 1
        },
        {
            question: "What is the complexity of searching for an element in a Hash Table (average case)?",
            options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
            correct: 0
        }
    ],
    computerNetworks: [
        {
            question: "What is the purpose of an IP address?",
            options: ["To identify a hardware manufacturer", "To uniquely identify a device on a network", "To store web pages", "To encrypt data"],
            correct: 1
        },
        {
            question: "Which protocol is used for secure web browsing?",
            options: ["HTTP", "FTP", "HTTPS", "SMTP"],
            correct: 2
        },
        {
            question: "What does DNS stand for?",
            options: ["Data Network System", "Digital Name Service", "Domain Name System", "Distributed Node Server"],
            correct: 2
        },
        {
            question: "Which device connects different networks?",
            options: ["Switch", "Hub", "Router", "Repeater"],
            correct: 2
        },
        {
            question: "What is the port number for HTTP by default?",
            options: ["443", "21", "25", "80"],
            correct: 3
        }
    ]
};

// Combine all questions for the main pool
let allQuestionsPool = [].concat(...Object.values(quizCategories));
let remainingQuestions = [...allQuestionsPool];

let currentQuestion = 0;
let score = 0;
let answered = false;
let shuffledQuiz = [];

const quizStart = document.getElementById('quizStart');
const quizGame = document.getElementById('quizGame');
const quizResult = document.getElementById('quizResult');
const startQuizBtn = document.getElementById('startQuizBtn');
const nextBtn = document.getElementById('nextBtn');
const restartQuizBtn = document.getElementById('restartQuizBtn');

const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const currentQ = document.getElementById('currentQ');
const totalQ = document.getElementById('totalQ');
const progressFill = document.getElementById('progressFill');
const currentScore = document.getElementById('currentScore');

const finalScore = document.getElementById('finalScore');
const correctCount = document.getElementById('correctCount');
const wrongCount = document.getElementById('wrongCount');
const percentage = document.getElementById('percentage');
const resultIcon = document.getElementById('resultIcon');
const resultTitle = document.getElementById('resultTitle');
const resultMessage = document.getElementById('resultMessage');

// Initialize question counts
const QUIZ_LENGTH = 10;
const totalQuestionsSpan = document.getElementById('totalQuestions');
if (totalQuestionsSpan) totalQuestionsSpan.textContent = QUIZ_LENGTH;
totalQ.textContent = QUIZ_LENGTH;

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startQuiz() {
    quizStart.classList.add('hidden');
    quizGame.classList.remove('hidden');
    
    // If we don't have enough questions left for a full quiz, reset the pool
    if (remainingQuestions.length < QUIZ_LENGTH) {
        remainingQuestions = [...allQuestionsPool];
    }
    
    // Pick QUIZ_LENGTH questions from remaining
    shuffleArray(remainingQuestions);
    const selectedQuestions = remainingQuestions.splice(0, QUIZ_LENGTH);
    
    // Shuffle options for each selected question
    shuffledQuiz = selectedQuestions.map(q => {
        const options = [...q.options];
        const correctText = options[q.correct];
        shuffleArray(options);
        return {
            ...q,
            options: options,
            correct: options.indexOf(correctText)
        };
    });
    
    currentQuestion = 0;
    score = 0;
    currentScore.textContent = score;
    loadQuestion();
}

function loadQuestion() {
    answered = false;
    const question = shuffledQuiz[currentQuestion];
    
    currentQ.textContent = currentQuestion + 1;
    progressFill.style.width = ((currentQuestion + 1) / shuffledQuiz.length * 100) + '%';
    
    questionText.textContent = question.question;
    
    optionsContainer.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    
    question.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = `
            <span class="option-letter">${letters[index]}</span>
            <span>${option}</span>
        `;
        btn.addEventListener('click', () => selectOption(index));
        optionsContainer.appendChild(btn);
    });
    
    nextBtn.classList.add('hidden');
    // Ensure Next Button text is reset if we restarted
    if (currentQuestion < shuffledQuiz.length - 1) {
        nextBtn.innerHTML = 'Next Question <i class="fas fa-arrow-right"></i>';
    }
}

function selectOption(selectedIndex) {
    if (answered) return;
    answered = true;
    
    const question = shuffledQuiz[currentQuestion];
    const options = optionsContainer.querySelectorAll('.option-btn');
    
    options.forEach((option, index) => {
        option.classList.add('disabled');
        if (index === question.correct) {
            option.classList.add('correct');
        }
        if (index === selectedIndex && index !== question.correct) {
            option.classList.add('wrong');
        }
    });
    
    if (selectedIndex === question.correct) {
        score += 10;
        currentScore.textContent = score;
    }
    
    // Smooth scroll to next button on mobile
    if (window.innerWidth < 768) {
        nextBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    nextBtn.classList.remove('hidden');
    
    if (currentQuestion === shuffledQuiz.length - 1) {
        nextBtn.textContent = 'See Results';
    }
}

function nextQuestion() {
    currentQuestion++;
    
    if (currentQuestion < shuffledQuiz.length) {
        loadQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    quizGame.classList.add('hidden');
    quizResult.classList.remove('hidden');
    
    const total = shuffledQuiz.length * 10;
    const percent = Math.round((score / total) * 100);
    const correct = score / 10;
    const wrong = shuffledQuiz.length - correct;
    
    finalScore.textContent = score;
    correctCount.textContent = correct;
    wrongCount.textContent = wrong;
    percentage.textContent = percent + '%';
    
    resultIcon.className = 'result-icon';
    
    if (percent >= 80) {
        resultIcon.classList.add('great');
        resultIcon.innerHTML = '<i class="fas fa-trophy"></i>';
        resultTitle.textContent = 'Excellent!';
        resultMessage.textContent = 'You have a strong understanding of JavaScript!';
    } else if (percent >= 60) {
        resultIcon.classList.add('good');
        resultIcon.innerHTML = '<i class="fas fa-medal"></i>';
        resultTitle.textContent = 'Good Job!';
        resultMessage.textContent = 'You know quite a bit about JavaScript!';
    } else if (percent >= 40) {
        resultIcon.classList.add('average');
        resultIcon.innerHTML = '<i class="fas fa-book"></i>';
        resultTitle.textContent = 'Keep Learning!';
        resultMessage.textContent = 'Practice more to improve your skills.';
    } else {
        resultIcon.classList.add('poor');
        resultIcon.innerHTML = '<i class="fas fa-graduation-cap"></i>';
        resultTitle.textContent = 'Don\'t Give Up!';
        resultMessage.textContent = 'Review the basics and try again.';
    }
    
    nextBtn.textContent = 'Next Question <i class="fas fa-arrow-right"></i>';
}

function restartQuiz() {
    quizResult.classList.add('hidden');
    quizStart.classList.remove('hidden');
}

startQuizBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', nextQuestion);
restartQuizBtn.addEventListener('click', restartQuiz);
