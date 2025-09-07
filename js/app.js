// Student Productivity Platform - Main Application
class StudentProductivityApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.theme = localStorage.getItem('theme') || 'light';
        this.data = this.loadData();
        this.pomodoroTimer = null;
        this.pomodoroState = {
            isRunning: false,
            isPaused: false,
            currentSession: 'work',
            timeLeft: 25 * 60, // 25 minutes in seconds
            workDuration: 25,
            breakDuration: 5,
            sessionsCompleted: 0,
            totalFocusTime: 0
        };
        
        this.init();
    }

    init() {
        this.initTheme();
        this.initNavigation();
        this.initModals();
        this.initForms();
        this.initPomodoro();
        this.loadDashboard();
        this.loadFinances();
        this.loadAssignments();
        this.loadTodos();
        this.loadPomodoroStats();
    }

    // Theme Management
    initTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }

        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('theme', this.theme);
        
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = this.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Navigation
    initNavigation() {
        // Desktop navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
            });
        });

        // Mobile navigation
        const mobileToggle = document.getElementById('mobileToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }

        // Close sidebar on mobile when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                !sidebar.contains(e.target) && 
                !mobileToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');

        this.currentSection = sectionName;

        // Close mobile sidebar
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('open');
        }
    }

    // Data Management
    loadData() {
        const defaultData = {
            expenses: [],
            assignments: [],
            todos: [],
            budget: 1000,
            pomodoroStats: {
                totalSessions: 0,
                totalFocusTime: 0,
                todaySessions: 0,
                todayFocusTime: 0,
                lastSessionDate: null
            }
        };

        const saved = localStorage.getItem('studentProductivityData');
        return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;
    }

    saveData() {
        localStorage.setItem('studentProductivityData', JSON.stringify(this.data));
    }

    // Modal Management
    initModals() {
        const modals = ['expenseModal', 'assignmentModal', 'todoModal'];
        
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            const closeBtn = modal.querySelector('.close');
            
            closeBtn.addEventListener('click', () => {
                this.closeModal(modalId);
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modalId);
                }
            });
        });

        // Open modal buttons
        document.getElementById('addExpenseBtn').addEventListener('click', () => {
            this.openModal('expenseModal');
        });

        document.getElementById('addAssignmentBtn').addEventListener('click', () => {
            this.openModal('assignmentModal');
        });

        document.getElementById('addTodoBtn').addEventListener('click', () => {
            this.openModal('todoModal');
        });
    }

    openModal(modalId) {
        document.getElementById(modalId).classList.add('show');
        // Set default date for forms
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.querySelector(`#${modalId} input[type="date"]`);
        if (dateInput && !dateInput.value) {
            dateInput.value = today;
        }
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
        // Reset form
        const form = document.querySelector(`#${modalId} form`);
        if (form) form.reset();
    }

    // Form Management
    initForms() {
        document.getElementById('expenseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense();
        });

        document.getElementById('assignmentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addAssignment();
        });

        document.getElementById('todoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });
    }

    // Financial Management
    addExpense() {
        const form = document.getElementById('expenseForm');
        const formData = new FormData(form);
        
        const expense = {
            id: Date.now(),
            amount: parseFloat(document.getElementById('expenseAmount').value),
            description: document.getElementById('expenseDescription').value,
            category: document.getElementById('expenseCategory').value,
            date: document.getElementById('expenseDate').value,
            timestamp: new Date().toISOString()
        };

        this.data.expenses.push(expense);
        this.saveData();
        this.closeModal('expenseModal');
        this.loadFinances();
        this.loadDashboard();
        this.addActivity('expense', `Added expense: ${expense.description} - $${expense.amount}`);
    }

    loadFinances() {
        this.updateBudgetOverview();
        this.updateExpenseCategories();
        this.updateExpensesList();
    }

    updateBudgetOverview() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyExpenses = this.data.expenses
            .filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getMonth() === currentMonth && 
                       expenseDate.getFullYear() === currentYear;
            })
            .reduce((total, expense) => total + expense.amount, 0);

        const remaining = this.data.budget - monthlyExpenses;
        const percentage = (monthlyExpenses / this.data.budget) * 100;

        document.getElementById('monthlyBudget').textContent = `$${this.data.budget.toFixed(2)}`;
        document.getElementById('monthlySpent').textContent = `$${monthlyExpenses.toFixed(2)}`;
        document.getElementById('remainingBudget').textContent = `$${remaining.toFixed(2)}`;
        document.getElementById('budgetProgress').style.width = `${Math.min(percentage, 100)}%`;

        // Update dashboard
        document.getElementById('monthlyExpenses').textContent = `$${monthlyExpenses.toFixed(2)}`;
        document.getElementById('totalBalance').textContent = `$${remaining.toFixed(2)}`;
    }

    updateExpenseCategories() {
        const categoryTotals = {};
        const categoryColors = {
            food: '#ef4444',
            transport: '#3b82f6',
            education: '#10b981',
            entertainment: '#f59e0b',
            utilities: '#8b5cf6',
            other: '#64748b'
        };

        this.data.expenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        });

        const chartContainer = document.getElementById('categoryChart');
        chartContainer.innerHTML = '';

        Object.entries(categoryTotals).forEach(([category, amount]) => {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.innerHTML = `
                <div style="display: flex; align-items: center;">
                    <div class="category-color" style="background-color: ${categoryColors[category]}"></div>
                    <span class="category-name">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                </div>
                <span class="category-amount">$${amount.toFixed(2)}</span>
            `;
            chartContainer.appendChild(categoryItem);
        });

        if (Object.keys(categoryTotals).length === 0) {
            chartContainer.innerHTML = '<p class="no-expenses">No expense categories yet</p>';
        }
    }

    updateExpensesList() {
        const expensesList = document.getElementById('expensesList');
        const sortedExpenses = this.data.expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (sortedExpenses.length === 0) {
            expensesList.innerHTML = '<p class="no-expenses">No expenses recorded yet</p>';
            return;
        }

        expensesList.innerHTML = sortedExpenses.slice(0, 10).map(expense => `
            <div class="expense-item">
                <div class="expense-info">
                    <div class="expense-description">${expense.description}</div>
                    <div class="expense-details">${expense.category} • ${new Date(expense.date).toLocaleDateString()}</div>
                </div>
                <div class="expense-amount">-$${expense.amount.toFixed(2)}</div>
            </div>
        `).join('');
    }

    // Assignment Management
    addAssignment() {
        const assignment = {
            id: Date.now(),
            title: document.getElementById('assignmentTitle').value,
            subject: document.getElementById('assignmentSubject').value,
            description: document.getElementById('assignmentDescription').value,
            dueDate: document.getElementById('assignmentDueDate').value,
            priority: document.getElementById('assignmentPriority').value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.data.assignments.push(assignment);
        this.saveData();
        this.closeModal('assignmentModal');
        this.loadAssignments();
        this.loadDashboard();
        this.addActivity('assignment', `Added assignment: ${assignment.title}`);
    }

    loadAssignments() {
        this.updateAssignmentFilters();
        this.updateAssignmentsList();
    }

    updateAssignmentFilters() {
        document.querySelectorAll('#assignments .filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#assignments .filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateAssignmentsList(btn.getAttribute('data-filter'));
            });
        });
    }

    updateAssignmentsList(filter = 'all') {
        const assignmentsList = document.getElementById('assignmentsList');
        let filteredAssignments = this.data.assignments;

        // Apply filters
        if (filter === 'pending') {
            filteredAssignments = filteredAssignments.filter(a => !a.completed && new Date(a.dueDate) >= new Date());
        } else if (filter === 'completed') {
            filteredAssignments = filteredAssignments.filter(a => a.completed);
        } else if (filter === 'overdue') {
            filteredAssignments = filteredAssignments.filter(a => !a.completed && new Date(a.dueDate) < new Date());
        }

        // Sort by due date
        filteredAssignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        if (filteredAssignments.length === 0) {
            assignmentsList.innerHTML = '<p class="no-assignments">No assignments found</p>';
            return;
        }

        assignmentsList.innerHTML = filteredAssignments.map(assignment => {
            const dueDate = new Date(assignment.dueDate);
            const now = new Date();
            const isOverdue = dueDate < now && !assignment.completed;
            const isDueSoon = dueDate - now < 24 * 60 * 60 * 1000 && dueDate > now;

            let cssClass = 'assignment-item';
            if (assignment.completed) cssClass += ' completed';
            if (isOverdue) cssClass += ' overdue';
            if (isDueSoon) cssClass += ' due-soon';

            return `
                <div class="${cssClass}">
                    <div class="assignment-header">
                        <h4 class="assignment-title">${assignment.title}</h4>
                        <span class="assignment-subject">${assignment.subject}</span>
                    </div>
                    <div class="assignment-due">Due: ${dueDate.toLocaleString()}</div>
                    ${assignment.description ? `<div class="assignment-description">${assignment.description}</div>` : ''}
                    <div class="assignment-footer">
                        <span class="priority-badge priority-${assignment.priority}">${assignment.priority.toUpperCase()}</span>
                        <div class="assignment-actions">
                            ${!assignment.completed ? `<button class="btn-small btn-complete" onclick="app.completeAssignment(${assignment.id})">Complete</button>` : ''}
                            <button class="btn-small btn-delete" onclick="app.deleteAssignment(${assignment.id})">Delete</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Update dashboard stats
        const pending = this.data.assignments.filter(a => !a.completed).length;
        const overdue = this.data.assignments.filter(a => !a.completed && new Date(a.dueDate) < new Date()).length;
        document.getElementById('pendingAssignments').textContent = pending;
        document.getElementById('overdueAssignments').textContent = overdue;
    }

    completeAssignment(id) {
        const assignment = this.data.assignments.find(a => a.id === id);
        if (assignment) {
            assignment.completed = true;
            this.saveData();
            this.loadAssignments();
            this.loadDashboard();
            this.addActivity('assignment', `Completed assignment: ${assignment.title}`);
        }
    }

    deleteAssignment(id) {
        if (confirm('Are you sure you want to delete this assignment?')) {
            this.data.assignments = this.data.assignments.filter(a => a.id !== id);
            this.saveData();
            this.loadAssignments();
            this.loadDashboard();
        }
    }

    // Todo Management
    addTodo() {
        const todo = {
            id: Date.now(),
            title: document.getElementById('todoTitle').value,
            description: document.getElementById('todoDescription').value,
            priority: document.getElementById('todoPriority').value,
            category: document.getElementById('todoCategory').value,
            dueDate: document.getElementById('todoDueDate').value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.data.todos.push(todo);
        this.saveData();
        this.closeModal('todoModal');
        this.loadTodos();
        this.loadDashboard();
        this.addActivity('todo', `Added task: ${todo.title}`);
    }

    loadTodos() {
        this.updateTodoFilters();
        this.updateTodosList();
    }

    updateTodoFilters() {
        document.querySelectorAll('#todos .filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#todos .filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateTodosList(btn.getAttribute('data-filter'));
            });
        });
    }

    updateTodosList(filter = 'all') {
        const todosList = document.getElementById('todosList');
        let filteredTodos = this.data.todos;

        // Apply filters
        if (filter !== 'all') {
            filteredTodos = filteredTodos.filter(t => t.priority === filter);
        }

        // Sort by priority and creation date
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        filteredTodos.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed - b.completed;
            }
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        if (filteredTodos.length === 0) {
            todosList.innerHTML = '<p class="no-todos">No tasks found</p>';
            return;
        }

        todosList.innerHTML = filteredTodos.map(todo => {
            let cssClass = 'todo-item';
            if (todo.completed) cssClass += ' completed';

            return `
                <div class="${cssClass}">
                    <div class="todo-header">
                        <h4 class="todo-title">${todo.title}</h4>
                    </div>
                    ${todo.dueDate ? `<div class="todo-due">Due: ${new Date(todo.dueDate).toLocaleDateString()}</div>` : ''}
                    ${todo.description ? `<div class="todo-description">${todo.description}</div>` : ''}
                    <div class="todo-footer">
                        <div>
                            <span class="priority-badge priority-${todo.priority}">${todo.priority.toUpperCase()}</span>
                            <span class="priority-badge" style="margin-left: 0.5rem; background-color: var(--secondary-color); color: var(--text-primary);">${todo.category}</span>
                        </div>
                        <div class="todo-actions">
                            ${!todo.completed ? `<button class="btn-small btn-complete" onclick="app.completeTodo(${todo.id})">Complete</button>` : ''}
                            <button class="btn-small btn-delete" onclick="app.deleteTodo(${todo.id})">Delete</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Update dashboard stats
        const total = this.data.todos.length;
        const completed = this.data.todos.filter(t => t.completed).length;
        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
    }

    completeTodo(id) {
        const todo = this.data.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = true;
            this.saveData();
            this.loadTodos();
            this.loadDashboard();
            this.addActivity('todo', `Completed task: ${todo.title}`);
        }
    }

    deleteTodo(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.data.todos = this.data.todos.filter(t => t.id !== id);
            this.saveData();
            this.loadTodos();
            this.loadDashboard();
        }
    }

    // Pomodoro Timer
    initPomodoro() {
        document.getElementById('startTimer').addEventListener('click', () => this.startPomodoro());
        document.getElementById('pauseTimer').addEventListener('click', () => this.pausePomodoro());
        document.getElementById('resetTimer').addEventListener('click', () => this.resetPomodoro());
        
        document.getElementById('workDuration').addEventListener('change', (e) => {
            this.pomodoroState.workDuration = parseInt(e.target.value);
            if (this.pomodoroState.currentSession === 'work' && !this.pomodoroState.isRunning) {
                this.pomodoroState.timeLeft = this.pomodoroState.workDuration * 60;
                this.updateTimerDisplay();
            }
        });

        document.getElementById('breakDuration').addEventListener('change', (e) => {
            this.pomodoroState.breakDuration = parseInt(e.target.value);
            if (this.pomodoroState.currentSession === 'break' && !this.pomodoroState.isRunning) {
                this.pomodoroState.timeLeft = this.pomodoroState.breakDuration * 60;
                this.updateTimerDisplay();
            }
        });

        this.updateTimerDisplay();
    }

    startPomodoro() {
        if (!this.pomodoroState.isRunning) {
            this.pomodoroState.isRunning = true;
            this.pomodoroState.isPaused = false;
            
            this.pomodoroTimer = setInterval(() => {
                this.pomodoroState.timeLeft--;
                this.updateTimerDisplay();
                
                if (this.pomodoroState.timeLeft <= 0) {
                    this.finishPomodoroSession();
                }
            }, 1000);
        }
    }

    pausePomodoro() {
        if (this.pomodoroState.isRunning) {
            this.pomodoroState.isRunning = false;
            this.pomodoroState.isPaused = true;
            clearInterval(this.pomodoroTimer);
        }
    }

    resetPomodoro() {
        this.pomodoroState.isRunning = false;
        this.pomodoroState.isPaused = false;
        clearInterval(this.pomodoroTimer);
        
        if (this.pomodoroState.currentSession === 'work') {
            this.pomodoroState.timeLeft = this.pomodoroState.workDuration * 60;
        } else {
            this.pomodoroState.timeLeft = this.pomodoroState.breakDuration * 60;
        }
        
        this.updateTimerDisplay();
    }

    finishPomodoroSession() {
        clearInterval(this.pomodoroTimer);
        this.pomodoroState.isRunning = false;
        
        if (this.pomodoroState.currentSession === 'work') {
            // Work session completed
            this.pomodoroState.sessionsCompleted++;
            this.pomodoroState.totalFocusTime += this.pomodoroState.workDuration;
            this.updatePomodoroStats();
            
            // Switch to break
            this.pomodoroState.currentSession = 'break';
            this.pomodoroState.timeLeft = this.pomodoroState.breakDuration * 60;
            
            this.addActivity('pomodoro', `Completed work session (${this.pomodoroState.workDuration} minutes)`);
        } else {
            // Break session completed
            this.pomodoroState.currentSession = 'work';
            this.pomodoroState.timeLeft = this.pomodoroState.workDuration * 60;
            
            this.addActivity('pomodoro', `Completed break session (${this.pomodoroState.breakDuration} minutes)`);
        }
        
        this.updateTimerDisplay();
        this.showNotification(`${this.pomodoroState.currentSession === 'work' ? 'Break' : 'Work session'} completed!`);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.pomodoroState.timeLeft / 60);
        const seconds = this.pomodoroState.timeLeft % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('timerTime').textContent = timeString;
        document.getElementById('timerPhase').textContent = this.pomodoroState.currentSession === 'work' ? 'Work' : 'Break';
        
        // Update progress circle
        const totalTime = this.pomodoroState.currentSession === 'work' ? 
            this.pomodoroState.workDuration * 60 : 
            this.pomodoroState.breakDuration * 60;
        const progress = ((totalTime - this.pomodoroState.timeLeft) / totalTime) * 283;
        document.getElementById('timerProgress').style.strokeDashoffset = 283 - progress;
    }

    updatePomodoroStats() {
        const today = new Date().toDateString();
        
        // Update today's stats
        if (this.data.pomodoroStats.lastSessionDate !== today) {
            this.data.pomodoroStats.todaySessions = 0;
            this.data.pomodoroStats.todayFocusTime = 0;
        }
        
        this.data.pomodoroStats.todaySessions++;
        this.data.pomodoroStats.todayFocusTime += this.pomodoroState.workDuration;
        this.data.pomodoroStats.totalSessions++;
        this.data.pomodoroStats.totalFocusTime += this.pomodoroState.workDuration;
        this.data.pomodoroStats.lastSessionDate = today;
        
        this.saveData();
        this.loadPomodoroStats();
        this.loadDashboard();
    }

    loadPomodoroStats() {
        const today = new Date().toDateString();
        let todaySessions = 0;
        let todayFocusTime = 0;
        
        if (this.data.pomodoroStats.lastSessionDate === today) {
            todaySessions = this.data.pomodoroStats.todaySessions;
            todayFocusTime = this.data.pomodoroStats.todayFocusTime;
        }
        
        document.getElementById('sessionsToday').textContent = todaySessions;
        document.getElementById('focusTimeToday').textContent = `${todayFocusTime}m`;
        
        // Update dashboard
        document.getElementById('pomodoroSessions').textContent = todaySessions;
        const hours = Math.floor(todayFocusTime / 60);
        const minutes = todayFocusTime % 60;
        document.getElementById('studyTime').textContent = `${hours}h ${minutes}m`;
    }

    // Dashboard
    loadDashboard() {
        this.updateBudgetOverview();
        this.updateAssignmentsList();
        this.updateTodosList();
        this.loadPomodoroStats();
    }

    // Activity Feed
    addActivity(type, message) {
        const activityList = document.getElementById('activityList');
        const activity = document.createElement('div');
        activity.className = 'activity-item';
        
        const icons = {
            expense: 'fas fa-wallet',
            assignment: 'fas fa-graduation-cap',
            todo: 'fas fa-list-check',
            pomodoro: 'fas fa-clock'
        };
        
        activity.innerHTML = `
            <div class="activity-icon">
                <i class="${icons[type]}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${message}</div>
                <div class="activity-time">${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        
        // Remove "no activities" message
        const noActivities = activityList.querySelector('.no-activities');
        if (noActivities) {
            noActivities.remove();
        }
        
        activityList.insertBefore(activity, activityList.firstChild);
        
        // Keep only the last 10 activities
        const activities = activityList.querySelectorAll('.activity-item');
        if (activities.length > 10) {
            activities[activities.length - 1].remove();
        }
    }

    // Utility Methods
    showNotification(message) {
        // Simple notification - in a real app, you might use a more sophisticated notification system
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Litera - Student Productivity', {
                body: message,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📚</text></svg>'
            });
        } else {
            alert(message);
        }
    }
}

// Initialize the application
const app = new StudentProductivityApp();

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}