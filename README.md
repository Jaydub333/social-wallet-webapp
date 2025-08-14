# Social Wallet WebApp

A modern social media webapp that integrates with the Social Wallet API, allowing users to manage their universal profiles, upload media, and send cross-platform gifts.

## Features

- **Universal Profile Management**: Edit profile information synced across platforms
- **Media Library**: Upload and manage photos/videos with captions and tags
- **Cross-Platform Gifts**: Send and receive digital gifts that work across all platforms
- **Dashboard**: View statistics and recent activity
- **Real-time API Integration**: Connects to live Social Wallet API

## Live Demo

- **WebApp**: [Coming Soon]
- **API**: https://squid-app-mky7a.ondigitalocean.app

## Screenshots

### Authentication Screen
- Clean, modern login interface
- "Continue with Social Wallet" OAuth integration
- Guest mode for testing

### Dashboard
- Statistics overview (connected platforms, media count, gifts, wallet balance)
- Recent activity feed
- Quick access navigation

### Profile Management
- Edit display name, username, bio
- Location and website settings
- Real-time profile updates

### Media Library
- Drag & drop file uploads
- Grid view of all media
- Caption and tagging system

### Gift Center
- Browse available gifts (hearts, roses, diamonds, etc.)
- Send gifts to other users
- View gift transaction history
- Wallet balance management

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Styling**: Modern CSS Grid/Flexbox, CSS animations
- **Icons**: Font Awesome 6
- **API Integration**: Fetch API for REST calls
- **Storage**: LocalStorage for session management

## Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Jaydub333/social-wallet-webapp.git
   cd social-wallet-webapp
   ```

2. **Start local server**:
   ```bash
   # Using Python (recommended)
   python -m http.server 8000
   
   # Or using Node.js
   npx serve .
   
   # Or using PHP
   php -S localhost:8000
   ```

3. **Open in browser**:
   ```
   http://localhost:8000
   ```

## API Integration

The webapp connects to the Social Wallet API:

```javascript
const API_BASE = 'https://squid-app-mky7a.ondigitalocean.app';

// Test API connection
async function testAPI() {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    console.log('API Status:', data);
}
```

### Available API Endpoints:
- `GET /` - API information
- `GET /health` - Health check and uptime

## Features Overview

### Authentication
- OAuth integration with Social Wallet API
- Guest mode for demo purposes
- Session persistence with localStorage

### Profile Management
- Update display name, username, bio
- Location and website information
- Real-time form validation

### Media Upload
- Drag & drop interface
- Multiple file selection
- Support for images and videos
- Caption and tagging system

### Gift System
- Browse gift catalog (hearts, roses, diamonds, etc.)
- Send gifts to other users
- Transaction history
- Wallet balance tracking

## Responsive Design

The webapp is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Security Features

- HTTPS-only API communication
- Input validation and sanitization
- CORS headers for cross-origin requests
- Secure authentication flow

## Performance

- Lazy loading for images
- CSS animations with GPU acceleration
- Efficient DOM manipulation
- Optimized asset loading

## Deployment

### Netlify (Recommended)
1. Connect GitHub repository
2. Build command: (none - static site)
3. Publish directory: `.`
4. Deploy automatically

### Vercel
1. Import from GitHub
2. Framework preset: Other
3. Deploy with default settings

### GitHub Pages
1. Push to GitHub
2. Enable GitHub Pages
3. Source: main branch

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Future Enhancements

- [ ] Real OAuth 2.0 implementation
- [ ] Database integration for persistent storage
- [ ] Real-time notifications
- [ ] Advanced media editing
- [ ] Social features (comments, likes)
- [ ] Mobile app version
- [ ] Advanced analytics dashboard

## License

MIT License - see LICENSE file for details

## Contact

- **API**: https://squid-app-mky7a.ondigitalocean.app
- **GitHub**: https://github.com/Jaydub333
- **Documentation**: See API documentation in main repo

---

**Built with ❤️ for the Social Wallet ecosystem**