'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameData, GameScreen, PaceType, RationsType, DifficultyMode } from '../game/types';
import { ROUTE } from '../game/locations';
import { STORE_PRICES, MAX_OXEN, MIN_OXEN } from '../game/constants';
import {
  createGame,
  startGame,
  beginTravel,
  advanceTurn,
  applyTurnResult,
  handleEvent,
  handleRiver,
  handleHunting,
  rest,
  useMedicineOnMember as applyMedicine,
  repairWagonAction,
  setPace,
  setRations,
  setScreen,
  isGameOver,
  isVictory,
  clearMessages,
} from '../game/Game';
import { buy, sell, applyPurchase, applySale } from '../game/Store';
import { Sound } from '../game/Sound';

import TitleScreen from './TitleScreen';
import NameParty from './NameParty';
import Store from './Store';
import TravelView from './TravelView';
import EventDialog from './EventDialog';
import RiverCrossing from './RiverCrossing';
import HuntingMini from './HuntingMini';
import LandmarkView from './LandmarkView';
import GameOver from './GameOver';

export default function GameCanvas() {
  const [game, setGame] = useState<GameData>(createGame());
  const prevDeadCountRef = useRef(0);

  // Check for game over conditions
  useEffect(() => {
    if (game.screen === GameScreen.Traveling) {
      if (isGameOver(game)) {
        Sound.play('gameOver');
        setGame(prev => setScreen(prev, GameScreen.GameOver));
      } else if (isVictory(game)) {
        Sound.play('victory');
        setGame(prev => setScreen(prev, GameScreen.Victory));
      }
    }
  }, [game]);

  // Track party deaths for sound effect
  useEffect(() => {
    const currentDeadCount = game.party.filter(m => m.status === 'dead').length;
    if (currentDeadCount > prevDeadCountRef.current && prevDeadCountRef.current > 0) {
      Sound.play('death');
    }
    prevDeadCountRef.current = currentDeadCount;
  }, [game.party]);

  // Handlers
  const handleStart = useCallback((difficulty: DifficultyMode) => {
    setGame(setScreen(createGame(difficulty), GameScreen.NameParty));
  }, []);

  const handleNameConfirm = useCallback((names: string[], startMonth: number) => {
    setGame(prev => startGame(prev, names, startMonth));
  }, []);

  const handleBuy = useCallback((item: keyof typeof STORE_PRICES, quantity: number) => {
    setGame(prev => {
      // Handle oxen separately - they go to wagon, not supplies
      if (item === 'oxen') {
        if (prev.wagon.oxen >= MAX_OXEN) return prev;
        const result = buy('oxen', quantity, prev.supplies.money);
        if (result.success) {
          const newOxenCount = Math.min(MAX_OXEN, prev.wagon.oxen + quantity);
          const actualQuantity = newOxenCount - prev.wagon.oxen;
          const actualCost = actualQuantity * STORE_PRICES.oxen;
          Sound.play('buy');
          return {
            ...prev,
            supplies: { ...prev.supplies, money: prev.supplies.money - actualCost },
            wagon: { ...prev.wagon, oxen: newOxenCount },
          };
        }
        return prev;
      }

      const result = buy(item as 'food' | 'ammunition' | 'medicine' | 'spareParts', quantity, prev.supplies.money);
      if (result.success) {
        Sound.play('buy');
        const newSupplies = applyPurchase(prev.supplies, item as 'food' | 'ammunition' | 'medicine' | 'spareParts', quantity);
        return { ...prev, supplies: newSupplies };
      }
      return prev;
    });
  }, []);

  const handleSell = useCallback((item: keyof typeof STORE_PRICES, quantity: number) => {
    setGame(prev => {
      // Handle oxen separately - they come from wagon, not supplies
      if (item === 'oxen') {
        if (prev.wagon.oxen <= MIN_OXEN) return prev; // Can't sell last ox
        const actualQuantity = Math.min(quantity, prev.wagon.oxen - MIN_OXEN);
        if (actualQuantity <= 0) return prev;
        const revenue = actualQuantity * STORE_PRICES.oxen * 0.5; // 50% sell price
        Sound.play('sell');
        return {
          ...prev,
          supplies: { ...prev.supplies, money: prev.supplies.money + revenue },
          wagon: { ...prev.wagon, oxen: prev.wagon.oxen - actualQuantity },
        };
      }

      const currentQty = item === 'food' ? prev.supplies.food :
                        item === 'ammunition' ? prev.supplies.ammunition :
                        item === 'medicine' ? prev.supplies.medicine :
                        item === 'spareParts' ? prev.supplies.spareParts : 0;
      const result = sell(item as 'food' | 'ammunition' | 'medicine' | 'spareParts', quantity, currentQty);
      if (result.success) {
        Sound.play('sell');
        const newSupplies = applySale(prev.supplies, item as 'food' | 'ammunition' | 'medicine' | 'spareParts', quantity);
        return { ...prev, supplies: newSupplies };
      }
      return prev;
    });
  }, []);

  const handleLeaveStore = useCallback(() => {
    setGame(prev => beginTravel(prev));
  }, []);

  const handleContinue = useCallback(() => {
    Sound.play('travel');
    setGame(prev => {
      const cleared = clearMessages(prev);
      const result = advanceTurn(cleared);
      // Play event sound if an event occurred
      if (result.event) {
        Sound.play('event');
      }
      return applyTurnResult(cleared, result);
    });
  }, []);

  const handleRest = useCallback(() => {
    setGame(prev => rest(prev));
  }, []);

  const handleHunt = useCallback(() => {
    setGame(prev => setScreen(prev, GameScreen.Hunting));
  }, []);

  const handleHuntConfirm = useCallback((ammoUsed: number) => {
    Sound.play('hunt');
    setGame(prev => {
      const result = handleHunting(prev, ammoUsed);
      // Check if hunt was successful (more food than before minus consumption)
      const foodGained = result.supplies.food > prev.supplies.food - 10; // rough check
      if (foodGained) {
        setTimeout(() => Sound.play('huntSuccess'), 200);
      }
      return result;
    });
  }, []);

  const handleHuntCancel = useCallback(() => {
    setGame(prev => setScreen(prev, GameScreen.Traveling));
  }, []);

  const handleChangePace = useCallback((pace: PaceType) => {
    setGame(prev => setPace(prev, pace));
  }, []);

  const handleChangeRations = useCallback((rations: RationsType) => {
    setGame(prev => setRations(prev, rations));
  }, []);

  const handleUseMedicine = useCallback((memberId: number) => {
    setGame(prev => applyMedicine(prev, memberId));
  }, []);

  const handleRepairWagon = useCallback(() => {
    setGame(prev => repairWagonAction(prev));
  }, []);

  const handleEventChoice = useCallback((choiceId: number) => {
    setGame(prev => handleEvent(prev, choiceId));
  }, []);

  const handleRiverFord = useCallback(() => {
    Sound.play('river');
    setGame(prev => handleRiver(prev, 'ford'));
  }, []);

  const handleRiverCaulk = useCallback(() => {
    Sound.play('river');
    setGame(prev => handleRiver(prev, 'caulk'));
  }, []);

  const handleRiverFerry = useCallback(() => {
    Sound.play('river');
    setGame(prev => handleRiver(prev, 'ferry'));
  }, []);

  const handleRiverWait = useCallback(() => {
    setGame(prev => handleRiver(prev, 'wait'));
  }, []);

  const handleLandmarkContinue = useCallback(() => {
    setGame(prev => beginTravel(prev));
  }, []);

  const handleLandmarkRest = useCallback(() => {
    setGame(prev => rest(prev));
  }, []);

  const handleLandmarkStore = useCallback(() => {
    setGame(prev => setScreen(prev, GameScreen.Store));
  }, []);

  const handleRestart = useCallback(() => {
    setGame(createGame(DifficultyMode.Normal));
  }, []);

  // Keyboard shortcut for ENTER on title (starts with Normal difficulty)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && game.screen === GameScreen.Title) {
        handleStart(DifficultyMode.Normal);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game.screen, handleStart]);

  // Render current screen
  const currentLocation = ROUTE[game.currentLocationIndex];

  switch (game.screen) {
    case GameScreen.Title:
      return <TitleScreen onStart={handleStart} />;

    case GameScreen.NameParty:
      return <NameParty onConfirm={handleNameConfirm} />;

    case GameScreen.Store:
      return (
        <Store
          supplies={game.supplies}
          wagon={game.wagon}
          onBuy={handleBuy}
          onSell={handleSell}
          onLeave={handleLeaveStore}
          locationName={currentLocation?.name || 'General Store'}
        />
      );

    case GameScreen.Traveling:
      return (
        <TravelView
          game={game}
          onContinue={handleContinue}
          onRest={handleRest}
          onHunt={handleHunt}
          onChangePace={handleChangePace}
          onChangeRations={handleChangeRations}
          onUseMedicine={handleUseMedicine}
          onRepairWagon={handleRepairWagon}
        />
      );

    case GameScreen.Event:
      if (game.currentEvent) {
        return (
          <>
            <TravelView
              game={game}
              onContinue={handleContinue}
              onRest={handleRest}
              onHunt={handleHunt}
              onChangePace={handleChangePace}
              onChangeRations={handleChangeRations}
              onUseMedicine={handleUseMedicine}
              onRepairWagon={handleRepairWagon}
            />
            <EventDialog event={game.currentEvent} onChoice={handleEventChoice} />
          </>
        );
      }
      return null;

    case GameScreen.River:
      if (currentLocation && currentLocation.type === 'river') {
        return (
          <RiverCrossing
            river={currentLocation}
            money={game.supplies.money}
            spareParts={game.supplies.spareParts}
            onFord={handleRiverFord}
            onCaulk={handleRiverCaulk}
            onFerry={handleRiverFerry}
            onWait={handleRiverWait}
          />
        );
      }
      return null;

    case GameScreen.Hunting:
      return (
        <HuntingMini
          ammunition={game.supplies.ammunition}
          onHunt={handleHuntConfirm}
          onCancel={handleHuntCancel}
        />
      );

    case GameScreen.Landmark:
      if (currentLocation) {
        return (
          <LandmarkView
            location={currentLocation}
            supplies={game.supplies}
            wagon={game.wagon}
            onContinue={handleLandmarkContinue}
            onRest={handleLandmarkRest}
            onStore={handleLandmarkStore}
          />
        );
      }
      return null;

    case GameScreen.GameOver:
      return (
        <GameOver
          game={game}
          isVictory={false}
          onRestart={handleRestart}
        />
      );

    case GameScreen.Victory:
      return (
        <GameOver
          game={game}
          isVictory={true}
          onRestart={handleRestart}
        />
      );

    default:
      return null;
  }
}
