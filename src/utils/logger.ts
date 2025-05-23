/**
 * Logger utility for better debugging
 */

// Set this to false in production
const DEBUG_MODE = true;

// Log levels
export enum LogLevel {
  INFO = 'INFO',
  DEBUG = 'DEBUG',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// Helper function for style application
const getLogStyle = (level: LogLevel): string => {
  switch(level) {
    case LogLevel.INFO:
      return 'color: #2196F3; font-weight: bold';
    case LogLevel.DEBUG:
      return 'color: #4CAF50; font-weight: bold';
    case LogLevel.WARN:
      return 'color: #FF9800; font-weight: bold';
    case LogLevel.ERROR:
      return 'color: #F44336; font-weight: bold';
    default:
      return 'color: #000000';
  }
};

// Main logger functions
export const logger = {
  info: (message: string, data?: any) => {
    if (DEBUG_MODE) {
      console.log(`%c[${LogLevel.INFO}] ${message}`, getLogStyle(LogLevel.INFO), data ? data : '');
    }
  },
  
  debug: (message: string, data?: any) => {
    if (DEBUG_MODE) {
      console.log(`%c[${LogLevel.DEBUG}] ${message}`, getLogStyle(LogLevel.DEBUG), data ? data : '');
    }
  },
  
  warn: (message: string, data?: any) => {
    if (DEBUG_MODE) {
      console.warn(`%c[${LogLevel.WARN}] ${message}`, getLogStyle(LogLevel.WARN), data ? data : '');
    }
  },
  
  error: (message: string, data?: any) => {
    // Always log errors regardless of debug mode
    console.error(`%c[${LogLevel.ERROR}] ${message}`, getLogStyle(LogLevel.ERROR), data ? data : '');
  },
  
  // Group related logs for better organization
  group: (name: string, fn: () => void) => {
    if (DEBUG_MODE) {
      console.group(`%c[GROUP] ${name}`, 'color: #9C27B0; font-weight: bold');
      fn();
      console.groupEnd();
    }
  },
  
  // Timer for performance monitoring
  time: (label: string) => {
    if (DEBUG_MODE) {
      console.time(`⏱️ ${label}`);
    }
  },
  
  timeEnd: (label: string) => {
    if (DEBUG_MODE) {
      console.timeEnd(`⏱️ ${label}`);
    }
  }
};

export default logger;
