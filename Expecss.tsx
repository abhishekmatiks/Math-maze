import { StyleSheet } from 'react-native';

export const COLORS = {
  background: '#1e1e1e',
  default1:  'white',               //  '#f49402'       ,
  default2:  'white',                 //      '#ee531a',
  selected:  'white',                  //     '#f59304', outline
  selectedTileBackground: 'white',
  startTile: '#66ff66',
  endTile: '#ff69b4',
  line: '#ee382d',
  selectedText: '#000000',
  normalText: 'black',

};

export const TEXT_CONFIG = {
fontsize :15 ,
tilecolordefault : 'white',
 };

export const LINE_CONFIG = {
  STROKE_WIDTH_MULTIPLIER: 0.8,
  CIRCLE_RADIUS_MULTIPLIER: 0.1,
  OPACITY: 0.7,
};

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  container: {
    backgroundColor: COLORS.background,
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
  },
  tile: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: TEXT_CONFIG.tilecolordefault,
    borderWidth: 3  ,
  },
  text: {
    fontSize:TEXT_CONFIG.fontsize,
    fontWeight: 'bold',
    userSelect: 'none',
  },
  buttonContainer: {
    marginTop: 20,
    width: '80%',
  },
  undoRedoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  infoColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 20,
  },
  targetBlock: {
    borderColor: '#a6a5f2',
    borderWidth: 2,
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  timerBlock: {
    borderColor: '#a6a5f2',
    borderWidth: 2,
    padding: 8,
    borderRadius: 8,
  },
  infoText: {
    color: '#a6a5f2',
    fontSize: 16,
    fontWeight: 'bold',
  },
  customButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#a6a5f2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
  },
  customButtonDisabled: {
    borderColor: '#545473',
  },
  customButtonText: {
    color: '#a6a5f2',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  customButtonTextDisabled: {
    color: '#545473',
  },
  sizeSelector: {
    marginTop: 20,
    alignItems: 'center',
  },
  sizeSelectorLabel: {
    color: '#a6a5f2',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sizeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  sizeButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#545473',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  sizeButtonSelected: {
    borderColor: '#a6a5f2',
    backgroundColor: 'rgba(166, 165, 242, 0.1)',
  },
  sizeButtonText: {
    color: '#545473',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sizeButtonTextSelected: {
    color: '#a6a5f2',
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  buttonSpacer: {
    width: 10,
  },
  buttonRowSpacer: {
    height: 10,
  },
});