# RiseRoll - Morning Activity Picker

A Progressive Web App (PWA) for randomly selecting daily morning activities with re-roll limits and activity management.

![RiseRoll Logo](public/pwa-192x192.png)

## Features

- 🎯 **Daily Activity Picking**: Randomly select from your activity list
- 🔄 **Re-roll System**: 2 re-rolls per day with automatic reset
- 📝 **Activity Management**: Add, edit, delete, and undo activities
- 📊 **CSV Import**: Bulk import activities from CSV files
- 📱 **PWA Support**: Installable on mobile and desktop
- 🌙 **Dark/Light Mode**: Toggle between themes
- 💾 **Persistent Storage**: Data saved with IndexedDB (Dexie.js)
- 📱 **Responsive Design**: Works on mobile, tablet, and desktop

## Tech Stack

- **Frontend**: Vue 3 (Composition API)
- **State Management**: Pinia
- **Routing**: Vue Router
- **Styling**: Tailwind CSS
- **Database**: Dexie.js (IndexedDB)
- **Build Tool**: Vite
- **PWA**: Vite PWA Plugin
- **Icons**: Heroicons

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd morning-picker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage

### Picker Screen
- **Pick Activity**: Click to randomly select an activity
- **Re-roll**: Use your 2 daily re-rolls if you don't like the selection
- **History**: View your last 10 activity picks
- **Theme Toggle**: Switch between light and dark modes

### Activities Screen
- **Add Activity**: Type and add new activities
- **Edit Activity**: Click the edit button to modify existing activities
- **Delete Activity**: Remove activities (with undo option)
- **CSV Import**: Upload a CSV file to bulk import activities
- **Reset Rolls**: Reset your daily re-roll count (requires confirmation)

### CSV Import Format

Create a CSV file with one activity per line:

```csv
Morning meditation
Read for 30 minutes
Go for a walk
Write in journal
Practice yoga
```

## PWA Installation

### Mobile (iOS/Android)
1. Open the app in your mobile browser
2. Look for "Add to Home Screen" or "Install" prompt
3. Follow the installation instructions

### Desktop (Chrome/Edge)
1. Look for the install icon in the address bar
2. Click "Install RiseRoll"
3. The app will open in its own window

## Development

### Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── LoadingSpinner.vue
│   └── NotificationContainer.vue
├── composables/         # Vue composables
│   └── useLiveData.js   # Reactive database queries
├── stores/              # Pinia stores
│   ├── activityStore.js # Main app state
│   ├── themeStore.js    # Theme management
│   └── notificationStore.js # Toast notifications
├── views/               # Page components
│   ├── Picker.vue       # Activity picking screen
│   └── Activities.vue   # Activity management screen
├── App.vue              # Root component
├── main.js              # App entry point
├── router/              # Vue Router configuration
│   └── index.js
├── db.js                # Dexie.js database schema
└── style.css            # Global styles
```

### Key Features Implementation

- **State Persistence**: Uses Dexie.js for client-side data storage
- **Reactive Data**: Live queries update UI automatically
- **Error Handling**: Comprehensive error handling with user feedback
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: ARIA labels and keyboard navigation support

## Configuration

### Environment Variables

No environment variables are required for basic functionality.

### Database

The app uses IndexedDB through Dexie.js. Data is stored locally and persists across browser sessions.

### PWA Configuration

PWA settings are configured in `vite.config.js`:
- App name: "RiseRoll"
- Theme color: "#1A2B4D"
- Background color: "#1A2B4D"

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**RiseRoll** - Start your mornings with intention! 🌅
