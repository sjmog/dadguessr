# 🌍 DadGuessr

A festive GeoGuessr-style party game where players guess locations from photos of Dad traveling the world.

## 🎮 How to Play

1. **Select players** (1-6) on the title screen
2. **Enter names** and pick Christmas-themed avatars
3. **View the postcard** showing Dad at a mystery location
4. **Place your pin** on the world map where you think the photo was taken
5. **Lock in your guess** and pass to the next player
6. **See the reveal** - the actual location is shown with distances and scores
7. **Play 12 rounds** - highest total score wins!

### Scoring

- **1000 points** for a perfect guess
- **Lose 1 point** for every mile you're off
- Minimum score per round: 0

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
cd dadguessr
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` folder.

## 📁 Project Structure

```
dadguessr/
├── public/
│   ├── images/          # Location photos (12 PNGs)
│   ├── sounds/          # Sound effects (WAV files)
│   └── favicon.svg
├── src/
│   ├── components/      # React components
│   ├── hooks/           # Custom hooks (useGameState, useSound)
│   ├── utils/           # Utilities (scoring, shuffle, constants)
│   ├── data/            # Location data
│   └── types.ts         # TypeScript interfaces
└── netlify.toml         # Deployment config
```

## 🖼️ Adding Custom Images

Replace the images in `public/images/` with your own photos:

| Filename | Location |
|----------|----------|
| `hallstatt.png` | Hallstatt Village, Austria |
| `blue-lagoon.png` | Blue Lagoon, Iceland |
| `chefchaouen.png` | Chefchaouen Blue City, Morocco |
| `zhangjiajie.png` | Zhangjiajie National Forest, China |
| `trolltunga.png` | Trolltunga Rock, Norway |
| `cappadocia.png` | Cappadocia, Turkey |
| `moraine-lake.png` | Moraine Lake, Canada |
| `santorini.png` | Santorini, Greece |
| `antelope-canyon.png` | Antelope Canyon, Arizona |
| `ha-long-bay.png` | Ha Long Bay, Vietnam |
| `plitvice.png` | Plitvice Lakes, Croatia |
| `uyuni.png` | Salar de Uyuni, Bolivia |

## 🔊 Sound Effects

Sound files in `public/sounds/`:

- `pin-place.wav` - When placing a pin on the map
- `lock-guess.wav` - When locking in your guess
- `reveal.wav` - When the answer is revealed
- `round-complete.wav` - When moving to the next round
- `victory.wav` - Final leaderboard celebration

## 🚢 Deployment

### Netlify (Recommended)

1. Push to GitHub
2. Connect repo to Netlify
3. Build settings are in `netlify.toml`

Or drag the `dist/` folder to [Netlify Drop](https://app.netlify.com/drop).

## 🛠️ Tech Stack

- **React 18** + **TypeScript**
- **Vite** for builds
- **React Leaflet** for maps
- **CSS** for styling (no UI framework)

## 📝 License

Made with ❤️ for Christmas 2024
