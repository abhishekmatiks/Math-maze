import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Dimensions,
  Pressable,
  ScrollView,
  Alert,
  Platform,
  PanResponder,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Svg, { Line, Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  interpolateColor,
} from 'react-native-reanimated';
import { styles, COLORS, LINE_CONFIG, TEXT_CONFIG } from './Expecss';

    const TILE_CONFIG = {
    SPACING_DIVISOR: 6,
    MAX_SIZE: 40,
    LINE_WIDTH_MULTIPLIER: 0.6,
    CIRCLE_RADIUS_MULTIPLIER: 0.1,
    MARGIN: 5,
    };

const screenWidth = Dimensions.get('window').width;
const operators = ['+', '-', '*', '/'];
const GRID_SIZES = [4, 5,6, 7];

// regex to find out if that is a number or operator
const isNumber = (val: string): boolean => /^[0-9]$/.test(val);
const isAdjacent = (r1: number, c1: number, r2: number, c2: number): boolean =>
  (Math.abs(r1 - r2) === 1 && c1 === c2) || (Math.abs(c1 - c2) === 1 && r1 === r2);

function generatePuzzle(size: number): { grid: string[][], result: number, solutionPath: [number, number][] } {
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
  const solutionPath: [number, number][] = [];

  let r = 0, c = 0;
  while (r < size - 1 || c < size - 1) {
    solutionPath.push([r, c]);
    if (r === size - 1) c++;
    else if (c === size - 1) r++;
    else Math.random() < 0.5 ? r++ : c++;
  }
  solutionPath.push([r, c]);

  let expr = '';
  let current = Math.floor(Math.random() * 9) + 1;
  grid[solutionPath[0][0]][solutionPath[0][1]] = String(current);
  expr += current;

  for (let i = 1; i < solutionPath.length; i++) {
    const [row, col] = solutionPath[i];

    let value = '';
    if (i % 2 === 1) {
      value = operators[Math.floor(Math.random() * operators.length)];
    } else {
      let num = Math.floor(Math.random() * 9) + 1;
      const op = grid[solutionPath[i - 1][0]][solutionPath[i - 1][1]];

      switch (op) {
        case '+':
          if (current + num > 100) num = Math.max(1, 100 - current);
          current += num;
          break;
        case '-':
          if (current - num < 0) num = Math.min(current, 9);
          current -= num;
          break;
        case '*':
          while (current * num > 100) num = Math.floor(Math.random() * 9) + 1;
          current *= num;
          break;
        case '/':
          const divisors = Array.from({ length: 9 }, (_, i) => i + 1).filter(n => current % n === 0);
          num = divisors.length > 0 ? divisors[Math.floor(Math.random() * divisors.length)] : 1;
          current = Math.floor(current / num);
          break;
      }
      value = String(num);
    }

    grid[row][col] = value;
    expr += value;
  }

  const result = current;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!grid[row][col]) {
        const isEven = (row + col) % 2 === 0;
        grid[row][col] = isEven
          ? String(Math.floor(Math.random() * 9) + 1)
          : operators[Math.floor(Math.random() * operators.length)];
      }
    }
  }

  return { grid, result, solutionPath };
}

function evaluateLeftToRight(expr: string): number {
  const tokens = expr.split(/([+\-*/])/).filter(token => token !== '');
  if (tokens.length === 0) return 0;

  let result = parseFloat(tokens[0]);

  for (let i = 1; i < tokens.length; i += 2) {
    if (i + 1 >= tokens.length) break;
    const operator = tokens[i];
    const nextNum = parseFloat(tokens[i + 1]);
    switch (operator) {
      case '+': result += nextNum; break;
      case '-': result -= nextNum; break;
      case '*': result *= nextNum; break;
      case '/': result = Math.floor(result / nextNum); break;
    }
  }

  return result;
}

const AnimatedTile: React.FC<{
  row: number;
  col: number;
  cell: string;
  tileSize: number;
  borderColor: string;
  isSelected: boolean;
  onPress: () => void;
  onLayout: (event: any) => void;
  tileProps: any;
}> = ({ row, col, cell, tileSize, borderColor, isSelected, onPress, onLayout, tileProps }) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const textColorProgress = useSharedValue(0);

  useEffect(() => {
    if (isSelected) {
      scale.value = withSequence(
        withTiming(1.1, { duration: 200 }),
        withSpring(1.05, { damping: 8, stiffness: 100 })
      );
      rotation.value = withSequence(
        withTiming(5, { duration: 100 }),
        withTiming(-5, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
      textColorProgress.value = withTiming(1, { duration: 300 });
    } else {
      scale.value = withSpring(1, { damping: 8, stiffness: 100 });
      rotation.value = withTiming(0, { duration: 200 });
      textColorProgress.value = withTiming(0, { duration: 300 });
    }
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      textColorProgress.value,
      [0, 1],
      [COLORS.normalText, COLORS.selectedText]
    ),
  }));

  return (
    <Pressable
      onPress={onPress}
      onLayout={onLayout}
      {...tileProps}
    >
      <Animated.View style={[
        styles.tile,
        {
          width: tileSize,
          height: tileSize,
          borderColor,
          margin: TILE_CONFIG.MARGIN,
          borderRadius: tileSize / 2,
        },
        isSelected && { backgroundColor: COLORS.selectedTileBackground },
        animatedStyle
      ]}>
        <Animated.Text style={[styles.text, textAnimatedStyle]}>{cell}</Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

const CustomButton: React.FC<{
  title: string;
  onPress: () => void;
  disabled?: boolean;
}> = ({ title, onPress, disabled = false }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 8, stiffness: 200 });
  };

  useEffect(() => {
    opacity.value = disabled ? 0.5 : 1;
  }, [disabled]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={[
        styles.customButton,
        disabled && styles.customButtonDisabled,
        animatedStyle
      ]}>
        <Text style={[
          styles.customButtonText,
          disabled && styles.customButtonTextDisabled
        ]}>
          {title}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const SizeSelector: React.FC<{
  currentSize: number;
  onSizeChange: (size: number) => void;
}> = ({ currentSize, onSizeChange }) => (
  <View style={styles.sizeSelector}>
    <Text style={styles.sizeSelectorLabel}>Grid Size:</Text>
    <View style={styles.sizeButtons}>
      {GRID_SIZES.map(size => (
        <Pressable
          key={size}
          onPress={() => onSizeChange(size)}
          style={[
            styles.sizeButton,
            currentSize === size && styles.sizeButtonSelected
          ]}
        >
          <Text style={[
            styles.sizeButtonText,
            currentSize === size && styles.sizeButtonTextSelected
          ]}>
            {size}x{size}
          </Text>
        </Pressable>
      ))}
    </View>
  </View>
);

export default function App() {
  const [gridSize, setGridSize] = useState(7);
  const [puzzle, setPuzzle] = useState(() => generatePuzzle(7));
  const [path, setPath] = useState<string[]>([]);
  const [expression, setExpression] = useState<string>('');
  const [tileSize, setTileSize] = useState(() => {
    return Math.min(Math.floor(screenWidth / (7 + TILE_CONFIG.SPACING_DIVISOR)), TILE_CONFIG.MAX_SIZE);
  });
  const [target, setTarget] = useState(puzzle.result);
  const [seconds, setSeconds] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [pathConnections, setPathConnections] = useState<Array<{from: [number, number], to: [number, number]}>>([]);

  const history = useRef<{ path: string[], expression: string }[]>([{ path: [], expression: '' }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const tileRefs = useRef<{ [key: string]: { x: number, y: number, width: number, height: number } }>({});
  const containerRef = useRef<View>(null);

  const targetScale = useSharedValue(1);
  const timerPulse = useSharedValue(1);

  useEffect(() => {
    timerPulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    const width = Dimensions.get('window').width;
    setTileSize(Math.min(Math.floor(width / (gridSize + TILE_CONFIG.SPACING_DIVISOR)), TILE_CONFIG.MAX_SIZE));
  }, [gridSize]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleGlobalMouseUp = () => {
        handleMouseUp();
      };
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const resetPath = () => {
    setPath([]);
    setExpression('');
    setPathConnections([]);
    history.current = [{ path: [], expression: '' }];
    setHistoryIndex(0);
  };

  const generateNewPuzzle = () => {
    const newPuzzle = generatePuzzle(gridSize);
    setPuzzle(newPuzzle);
    setTarget(newPuzzle.result);
    setPath([]);
    setExpression('');
    setPathConnections([]);
    history.current = [{ path: [], expression: '' }];
    setHistoryIndex(0);
    setSeconds(0);
    
    targetScale.value = withSequence(
      withTiming(1.2, { duration: 200 }),
      withSpring(1, { damping: 8, stiffness: 100 })
    );
  };

  const handleSizeChange = (newSize: number) => {
    setGridSize(newSize);
    const newPuzzle = generatePuzzle(newSize);
    setPuzzle(newPuzzle);
    setTarget(newPuzzle.result);
    setPath([]);
    setExpression('');
    setPathConnections([]);
    history.current = [{ path: [], expression: '' }];
    setHistoryIndex(0);
    setSeconds(0);
  };

  const isSelected = (row: number, col: number): boolean => path.includes(`${row}-${col}`);

  const getTileFromPosition = (x: number, y: number): { row: number, col: number } | null => {
    for (const [key, bounds] of Object.entries(tileRefs.current)) {
      if (x >= bounds.x && x <= bounds.x + bounds.width &&
          y >= bounds.y && y <= bounds.y + bounds.height) {
        const [row, col] = key.split('-').map(Number);
        return { row, col };
      }
    }
    return null;
  };

  const handleMouseDown = (row: number, col: number) => {
    if (Platform.OS === 'web') {
      setIsMouseDown(true);
      setIsDragging(true);
      addToPath(row, col);
    }
  };

  const handleMouseUp = () => {
    if (Platform.OS === 'web') {
      setIsMouseDown(false);
      setIsDragging(false);
    }
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (Platform.OS === 'web' && isMouseDown) {
      addToPath(row, col);
    }
  };

  const handleTouchStart = (row: number, col: number) => {
    if (Platform.OS !== 'web') {
      setIsDragging(true);
      addToPath(row, col);
    }
  };

  const handleTouchEnd = () => {
    if (Platform.OS !== 'web') {
      setIsDragging(false);
    }
  };

  const addToPath = (row: number, col: number) => {
    const key = `${row}-${col}`;
    const val = puzzle.grid[row][col];

    if (path.length === 0) {
        if (row !== 0 || col !== 0) {
            return false;
        }
        if (!isNumber(val)) {
            return false;
        }

        const newPath = [key];
        const newExpr = val;

        setPath(newPath);
        setExpression(newExpr);
        setPathConnections([]);

        const newHistoryEntry = { path: newPath, expression: newExpr };
        const baseHistory = history.current.slice(0, historyIndex + 1);
        history.current = [...baseHistory, newHistoryEntry];
        setHistoryIndex(baseHistory.length);

        return true;

    } else {
        const [prevRow, prevCol] = path[path.length - 1].split('-').map(Number);
        
        if (prevRow === gridSize - 1 && prevCol === gridSize - 1) {
            return false;
        }

        if (path.includes(key)) {
            return false;
        }

        const prevVal = puzzle.grid[prevRow][prevCol];

        if (!isAdjacent(prevRow, prevCol, row, col)) {
            return false;
        }
        if (isNumber(prevVal) === isNumber(val)) {
            return false;
        }

        const newPath = [...path, key];
        const newExpr = expression + val;
        const newConnections: Array<{from: [number, number], to: [number, number]}> = [
            ...pathConnections,
            { from: [prevRow, prevCol] as [number, number], to: [row, col] as [number, number] }
        ];
        
        setPath(newPath);
        setExpression(newExpr);
        setPathConnections(newConnections);

        const newHistoryEntry = { path: newPath, expression: newExpr };
        const updatedHistory = history.current.slice(0, historyIndex + 1);
        updatedHistory.push(newHistoryEntry);
        history.current = updatedHistory;
        setHistoryIndex(updatedHistory.length - 1);

        if (row === gridSize - 1 && col === gridSize - 1) {
            const exprToEval = newExpr.replace(/−/g, '-');
            try {
                const result = evaluateLeftToRight(exprToEval);
                if (result === target) {
                    setTimeout(() => {
                        if (Platform.OS === 'web') {
                            alert('You won! \n\n' + `Time: ${formatTime(seconds)}`);
                        } else {
                            Alert.alert('Win', `Time: ${formatTime(seconds)}`);
                        }
                    }, 100);
                } else {
                    setTimeout(() => {
                        if (Platform.OS === 'web') {
                            alert('Game Over! Target not met. Try again!\n\n');
                        } else {
                            Alert.alert('Lose', 'Target not met. Try again!');
                        }
                    }, 100);
                }
            } catch {
                setTimeout(() => {
                    Alert.alert('Error', 'Invalid Expression');
                }, 100);
            }
        }
        return true;
    }
  };

  const handleTilePress = (row: number, col: number) => {
    if (!isDragging) {
      addToPath(row, col);
    }
  };
const panResponder = PanResponder.create({
  onStartShouldSetPanResponder: () => true, // Always try to handle on mobile
  onMoveShouldSetPanResponder: () => true,
  
  onPanResponderGrant: (evt) => {
    setIsDragging(true);
    const { pageX, pageY } = evt.nativeEvent; // Use pageX/pageY instead
    const tile = getTileFromPosition(pageX, pageY);
    if (tile) {
      addToPath(tile.row, tile.col);
    }
  },
  
  onPanResponderMove: (evt) => {
    // Remove isDragging check since we're already in a pan gesture
    const { pageX, pageY } = evt.nativeEvent;
    const currentTileInfo = getTileFromPosition(pageX, pageY);
    
    if (currentTileInfo) {
      const currentTileKey = `${currentTileInfo.row}-${currentTileInfo.col}`;
      const lastActualTileInPath = path.length > 0 ? path[path.length - 1] : null;
      
      if (currentTileKey !== lastActualTileInPath) {
        addToPath(currentTileInfo.row, currentTileInfo.col);
      }
    }
  },
  
  onPanResponderRelease: () => {
    setIsDragging(false);
  },
  
  onPanResponderTerminate: () => {
    setIsDragging(false);
  },
});
  const autoSolve = () => {
    const solutionPathKeys = puzzle.solutionPath.map(([r, c]) => `${r}-${c}`);
    let solutionExpr = '';
    for (let i = 0; i < puzzle.solutionPath.length; i++) {
      const [r, c] = puzzle.solutionPath[i];
      solutionExpr += puzzle.grid[r][c];
    }

    const solutionConnections: Array<{from: [number, number], to: [number, number]}> = [];
    for (let i = 1; i < puzzle.solutionPath.length; i++) {
      solutionConnections.push({
        from: puzzle.solutionPath[i - 1],
        to: puzzle.solutionPath[i]
      });
    }
    
    const newHistoryEntry = { path: solutionPathKeys, expression: solutionExpr };
    const baseHistory = history.current.slice(0, historyIndex + 1);
    history.current = [...baseHistory, newHistoryEntry];
    setHistoryIndex(baseHistory.length);

    setPath(solutionPathKeys);
    setExpression(solutionExpr);
    setPathConnections(solutionConnections);

    setTimeout(() => {
      Alert.alert('Solution', `Path: ${solutionPathKeys.join(' → ')}\nExpression: ${solutionExpr} = ${target}`);
    }, 300);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history.current[newIndex];
      setPath(state.path);
      setExpression(state.expression);
      setHistoryIndex(newIndex);
      
      const newConnections: Array<{from: [number, number], to: [number, number]}> = [];
      for (let i = 1; i < state.path.length; i++) {
        const [prevRow, prevCol] = state.path[i - 1].split('-').map(Number);
        const [currRow, currCol] = state.path[i].split('-').map(Number);
        newConnections.push({ 
          from: [prevRow, prevCol] as [number, number], 
          to: [currRow, currCol] as [number, number] 
        });
      }
      setPathConnections(newConnections);
    }
  };

  const redo = () => {
    if (historyIndex < history.current.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history.current[newIndex];
      setPath(state.path);
      setExpression(state.expression);
      setHistoryIndex(newIndex);
      
      const newConnections: Array<{from: [number, number], to: [number, number]}> = [];
      for (let i = 1; i < state.path.length; i++) {
        const [prevRow, prevCol] = state.path[i - 1].split('-').map(Number);
        const [currRow, currCol] = state.path[i].split('-').map(Number);
        newConnections.push({ 
          from: [prevRow, prevCol] as [number, number], 
          to: [currRow, currCol] as [number, number] 
        });
      }
      setPathConnections(newConnections);
    }
  };

  const timerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: timerPulse.value }],
  }));

  const targetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: targetScale.value }],
  }));

  return (
    <GestureHandlerRootView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.infoColumn}>
          <Animated.View style={[styles.timerBlock, timerAnimatedStyle]}>
            <Text style={styles.infoText}>{formatTime(seconds)}</Text>
          </Animated.View>
          <Animated.View style={[styles.targetBlock, targetAnimatedStyle]}>
            <Text style={styles.infoText}>Target: {target}</Text>
          </Animated.View>
        </View>

        <SizeSelector currentSize={gridSize} onSizeChange={handleSizeChange} />

        <View style={styles.container} {...(Platform.OS !== 'web' ? panResponder.panHandlers : {})} ref={containerRef}>
          <Svg 
            style={styles.svgOverlay}
            width="100%" 
            height="100%"
            pointerEvents="none"
          >
            {pathConnections.map((connection, index) => {
              const [fromRow, fromCol] = connection.from;
              const [toRow, toCol] = connection.to;
              
              const fromX = fromCol * (tileSize + TILE_CONFIG.MARGIN * 2) + tileSize / 2 + TILE_CONFIG.MARGIN;
              const fromY = fromRow * (tileSize + TILE_CONFIG.MARGIN * 2) + tileSize / 2 + TILE_CONFIG.MARGIN;
              const toX = toCol * (tileSize + TILE_CONFIG.MARGIN * 2) + tileSize / 2 + TILE_CONFIG.MARGIN;
              const toY = toRow * (tileSize + TILE_CONFIG.MARGIN * 2) + tileSize / 2 + TILE_CONFIG.MARGIN;
              
              return (
                <Line
                  key={index}
                  x1={fromX}
                  y1={fromY}
                  x2={toX}
                  y2={toY}
                  stroke={COLORS.line}
                  strokeWidth={tileSize * LINE_CONFIG.STROKE_WIDTH_MULTIPLIER}
                  strokeLinecap="round"
                  opacity={LINE_CONFIG.OPACITY}
                />
              );
            })}
            
            {path.map((pathKey, index) => {
              const [row, col] = pathKey.split('-').map(Number);
              const centerX = col * (tileSize + TILE_CONFIG.MARGIN * 2) + tileSize / 2 + TILE_CONFIG.MARGIN;
              const centerY = row * (tileSize + TILE_CONFIG.MARGIN * 2) + tileSize / 2 + TILE_CONFIG.MARGIN;
              
              return (
                <Circle
                  key={index}
                  cx={centerX}
                  cy={centerY}
                  r={tileSize * LINE_CONFIG.CIRCLE_RADIUS_MULTIPLIER}
                  fill={COLORS.line}
                />
              );
            })}
          </Svg>
          
          {puzzle.grid.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((cell, colIndex) => {
                const key = `${rowIndex}-${colIndex}`;
                const isEven = (rowIndex + colIndex) % 2 === 0;
                const isStart = rowIndex === 0 && colIndex === 0;
                const isEnd = rowIndex === gridSize - 1 && colIndex === gridSize - 1;
                const selected = isSelected(rowIndex, colIndex);

                let borderColor;
                if (selected) {
                    borderColor = COLORS.selected;
                } else if (isStart) {
                    borderColor = COLORS.startTile;
                } else if (isEnd) {
                    borderColor = COLORS.endTile;
                } else {
                    borderColor = isEven ? COLORS.default1 : COLORS.default2;
                }

                const tileProps = Platform.OS === 'web' ? {
                  onMouseDown: () => handleMouseDown(rowIndex, colIndex),
                  onMouseEnter: () => handleMouseEnter(rowIndex, colIndex),
                  onMouseUp: handleMouseUp,
                } : {
                  onTouchStart: () => handleTouchStart(rowIndex, colIndex),
                  onTouchEnd: handleTouchEnd,
                };

                return (
                  <AnimatedTile
                    key={key}
                    row={rowIndex}
                    col={colIndex}
                    cell={cell}
                    tileSize={tileSize}
                    borderColor={borderColor}
                    isSelected={selected}
                    onPress={() => handleTilePress(rowIndex, colIndex)}
                    onLayout={(event) => {
                      const { x, y, width, height } = event.nativeEvent.layout;
                      tileRefs.current[key] = { x, y, width, height };
                    }}
                    tileProps={tileProps}
                  />
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <View style={styles.undoRedoContainer}>
            <CustomButton title="Undo" onPress={undo} disabled={historyIndex === 0} />
            <View style={styles.buttonSpacer} />
            <CustomButton title="Redo" onPress={redo} disabled={historyIndex === history.current.length - 1} />
          </View>
          <View style={styles.buttonRowSpacer} />
          <CustomButton title="Reset" onPress={resetPath} />
          <View style={styles.buttonRowSpacer} />
          <CustomButton title="Solve" onPress={autoSolve} />
          <View style={styles.buttonRowSpacer} />
          <CustomButton title="Generate" onPress={generateNewPuzzle} />
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}