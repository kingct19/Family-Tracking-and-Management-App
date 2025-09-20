import '@testing-library/jest-dom';
import { vi, beforeAll, afterAll } from 'vitest';

// Mock Firebase
vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
    updateProfile: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
    getFirestore: vi.fn(),
    collection: vi.fn(),
    doc: vi.fn(),
    getDocs: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    onSnapshot: vi.fn(),
    query: vi.fn(),
    where: vi.fn()
}));

vi.mock('firebase/storage', () => ({
    getStorage: vi.fn()
}));

// Mock Google Maps
vi.mock('@googlemaps/js-api-loader', () => ({
    Loader: vi.fn().mockImplementation(() => ({
        load: vi.fn().mockResolvedValue({})
    }))
}));

// Mock Geolocation API
Object.defineProperty(navigator, 'geolocation', {
    value: {
        getCurrentPosition: vi.fn(),
        watchPosition: vi.fn(),
        clearWatch: vi.fn()
    },
    writable: true
});

// Mock Service Worker
Object.defineProperty(navigator, 'serviceWorker', {
    value: {
        register: vi.fn(),
        ready: vi.fn().mockResolvedValue({
            unregister: vi.fn()
        })
    },
    writable: true
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
}));

// Suppress console warnings in tests
const originalError = console.error;
beforeAll(() => {
    console.error = (...args: any[]) => {
        if (
            typeof args[0] === 'string' &&
            args[0].includes('Warning: ReactDOM.render is deprecated')
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});
