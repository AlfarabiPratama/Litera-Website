# Litera - Student Productivity Platform

A comprehensive web-based productivity platform designed specifically for students to manage their academic and personal life efficiently.

## Features

### 📊 Dashboard Overview
- Real-time productivity metrics
- Quick overview of all modules
- Recent activity feed
- Progress visualization

### 💰 Financial Management
- Expense tracking with categories
- Budget monitoring and alerts
- Monthly spending overview
- Visual expense categorization
- Remaining budget calculations

### 📚 Assignment Management
- Assignment deadline tracking
- Priority-based organization
- Progress monitoring
- Subject categorization
- Overdue assignment alerts

### ✅ Smart To-Do List
- Priority-based task management
- Category organization (Personal, Academic, Work, Health)
- Due date tracking
- Task completion tracking
- Filter and search functionality

### 🍅 Pomodoro Timer
- Customizable work/break durations
- Visual circular progress indicator
- Session tracking and statistics
- Daily focus time monitoring
- Audio notifications (browser dependent)

### 🎨 User Experience
- **Dark/Light Mode Toggle**: Seamless theme switching with persistent preference
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Clean Interface**: Modern, intuitive design with smooth animations
- **Local Storage**: All data persists locally in the browser

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS Grid, Flexbox, CSS Variables for theming
- **Icons**: Font Awesome 6.0
- **Storage**: Browser LocalStorage API
- **Responsive**: Mobile-first design approach

## Screenshots

### Light Mode Dashboard
![Dashboard Light Mode](https://github.com/user-attachments/assets/be8edfe8-f372-47e7-95e2-5db9a18fa794)

### Dark Mode Dashboard  
![Dashboard Dark Mode](https://github.com/user-attachments/assets/d782a459-346b-45ba-8ef9-33eeeba786ec)

### Pomodoro Timer
![Pomodoro Timer](https://github.com/user-attachments/assets/89b9966e-7408-407d-87d3-84fcefb5c3f8)

### Mobile Responsive Design
![Mobile View](https://github.com/user-attachments/assets/c535d8ce-b29a-4ac7-8c7f-776ff9c740fb)

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software installation required

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/AlfarabiPratama/Litera-Website.git
   ```

2. Navigate to the project directory:
   ```bash
   cd Litera-Website
   ```

3. Open `index.html` in your web browser, or serve it using a local web server:
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

4. Open your browser and navigate to `http://localhost:8000`

## Usage

### Adding Expenses
1. Navigate to the "Finances" section
2. Click "Add Expense"
3. Fill in the amount, description, category, and date
4. Submit to track your spending

### Managing Assignments
1. Go to the "Assignments" section
2. Click "Add Assignment"
3. Enter title, subject, description, due date, and priority
4. Use filters to view pending, completed, or overdue assignments

### Creating Tasks
1. Visit the "To-Do List" section
2. Click "Add Task"
3. Set title, description, priority, category, and optional due date
4. Filter tasks by priority level

### Using Pomodoro Timer
1. Access the "Pomodoro" section
2. Adjust work and break durations if needed
3. Click "Start" to begin a session
4. The timer will automatically switch between work and break periods

## Data Persistence

All data is stored locally in your browser using LocalStorage. This means:
- ✅ Your data persists between browser sessions
- ✅ No internet connection required after initial load
- ✅ Complete privacy - data never leaves your device
- ⚠️ Data is tied to the specific browser and device
- ⚠️ Clearing browser data will remove all stored information

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Future Enhancements

- [ ] Data export/import functionality
- [ ] Calendar integration
- [ ] Study schedule planning
- [ ] Grade tracking
- [ ] Cloud synchronization
- [ ] Mobile app version
- [ ] Collaboration features
- [ ] Advanced analytics and reporting

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Font Awesome for the beautiful icons
- Modern CSS techniques for responsive design
- JavaScript LocalStorage API for data persistence

---

**Built with ❤️ for students, by students**