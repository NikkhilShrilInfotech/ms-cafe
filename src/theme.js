import { Platform } from 'react-native';
export const C = {
  bg: '#FBF8F2', card: '#FFFFFF', panel: '#F0ECE3', dark: '#33271F', ink: '#2B211B',
  mute: '#8A7F75', line: '#E6DFD3', brand: '#B0573D', brandSoft: '#F3E1DA', green: '#5F7A56', red: '#C0392B',
};
export const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });
export const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
export const timeStr = (ms) => new Date(ms).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
export const dateStr = (ms) => new Date(ms).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
