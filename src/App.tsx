import { useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { useSound } from './hooks/useSound';
import { TitleScreen } from './components/TitleScreen';
import { PlayerSetup } from './components/PlayerSetup';
import { GameRound } from './components/GameRound';
import { FinalLeaderboard } from './components/FinalLeaderboard';
import './App.css';

function App() {
  const { state, actions } = useGameState();
  const { play: playSound } = useSound();

  useEffect(() => {
    const isGameInProgress = state.phase === 'playing' || state.phase === 'reveal';
    
    if (!isGameInProgress) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.phase]);

  // Route to the appropriate screen based on game phase
  switch (state.phase) {
    case 'title':
      return <TitleScreen onStart={(count) => actions.startSetup(count)} />;

    case 'setup':
      return (
        <PlayerSetup
          players={state.players}
          onSetPlayerInfo={actions.setPlayerInfo}
          onBeginJourney={actions.beginJourney}
          onBack={actions.goToTitle}
        />
      );

    case 'playing':
    case 'reveal':
      return (
        <GameRound
          state={state}
          onPlacePin={actions.placePin}
          onLockGuess={actions.lockGuess}
          onStartReveal={actions.startReveal}
          onNextRound={actions.nextRound}
          playSound={playSound}
        />
      );

    case 'final':
      return (
        <FinalLeaderboard
          players={state.players}
          onPlayAgain={actions.playAgain}
          playSound={playSound}
        />
      );

    default:
      return <TitleScreen onStart={() => actions.startSetup(2)} />;
  }
}

export default App;
