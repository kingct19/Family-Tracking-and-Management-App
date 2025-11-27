# Quick Wins Implementation Guide

These are high-impact features that can be implemented quickly to improve competitiveness with Life360.

## 1. Address Lookup (3-5 days) ⚡ HIGH PRIORITY

### Implementation Steps

#### Step 1: Create Geocoding Service
```typescript
// src/lib/services/geocoding-service.ts
import { db } from '@/config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface Address {
  formatted: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

class GeocodingService {
  private cache = new Map<string, Address>();

  async reverseGeocode(lat: number, lng: number): Promise<Address | null> {
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const address: Address = {
          formatted: result.formatted_address,
          street: this.extractComponent(result, 'street_number') + ' ' + this.extractComponent(result, 'route'),
          city: this.extractComponent(result, 'locality'),
          state: this.extractComponent(result, 'administrative_area_level_1'),
          zipCode: this.extractComponent(result, 'postal_code'),
          country: this.extractComponent(result, 'country'),
        };

        this.cache.set(cacheKey, address);
        return address;
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }

    return null;
  }

  private extractComponent(result: any, type: string): string {
    const component = result.address_components?.find(
      (c: any) => c.types.includes(type)
    );
    return component?.long_name || '';
  }
}

export const geocodingService = new GeocodingService();
```

#### Step 2: Update Location API to Store Addresses
```typescript
// Add to src/features/location/api/location-api.ts
import { geocodingService } from '@/lib/services/geocoding-service';

export const updateUserLocation = async (
  hubId: string,
  userId: string,
  coordinates: LocationCoordinates,
  isSharing: boolean
): Promise<ApiResponse<void>> => {
  try {
    // Get address
    const address = await geocodingService.reverseGeocode(
      coordinates.latitude,
      coordinates.longitude
    );

    await updateDoc(doc(db, 'hubs', hubId, 'locations', userId), {
      // ... existing fields
      address: address?.formatted || null,
      addressDetails: address || null,
      // ...
    });
  } catch (error) {
    // Handle error
  }
};
```

#### Step 3: Update UI Components
```typescript
// Update MemberLocationCard to show address
{location.address && (
  <p className="text-body-sm text-on-variant">
    {location.address}
  </p>
)}
```

**Files to Create**:
- `src/lib/services/geocoding-service.ts`

**Files to Update**:
- `src/features/location/api/location-api.ts`
- `src/features/location/components/MemberLocationCard.tsx`
- `src/types/index.ts` (add address fields)

---

## 2. Location History Visualization (1 week) ⚡ HIGH PRIORITY

### Implementation Steps

#### Step 1: Create Location History Hook
```typescript
// src/features/location/hooks/useLocationHistory.ts
import { useQuery } from '@tanstack/react-query';
import { getUserLocationHistory } from '../api/location-api';

export const useLocationHistory = (userId: string, hours: number = 24) => {
  const { currentHub } = useHubStore();

  return useQuery({
    queryKey: ['location-history', currentHub?.id, userId, hours],
    queryFn: async () => {
      if (!currentHub) throw new Error('No hub selected');
      const response = await getUserLocationHistory(currentHub.id, userId, hours);
      if (!response.success) throw new Error(response.error);
      return response.data || [];
    },
    enabled: !!currentHub && !!userId,
  });
};
```

#### Step 2: Create History Visualization Component
```typescript
// src/features/location/components/LocationHistoryView.tsx
import { useEffect, useRef } from 'react';
import { useLocationHistory } from '../hooks/useLocationHistory';

interface LocationHistoryViewProps {
  userId: string;
  map: google.maps.Map;
  hours?: number;
}

export const LocationHistoryView = ({ userId, map, hours = 24 }: LocationHistoryViewProps) => {
  const { data: history } = useLocationHistory(userId, hours);
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!history || history.length < 2 || !map) return;

    const path = history.map(loc => ({
      lat: loc.latitude,
      lng: loc.longitude,
    }));

    // Remove existing polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    // Create new polyline
    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#7A3BFF',
      strokeOpacity: 0.6,
      strokeWeight: 4,
    });

    polyline.setMap(map);
    polylineRef.current = polyline;

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, [history, map]);

  return null;
};
```

#### Step 3: Add to MapView
```typescript
// In MapView.tsx
{showHistory && selectedUserId && (
  <LocationHistoryView
    userId={selectedUserId}
    map={map}
    hours={historyHours}
  />
)}
```

**Files to Create**:
- `src/features/location/hooks/useLocationHistory.ts`
- `src/features/location/components/LocationHistoryView.tsx`

**Files to Update**:
- `src/features/location/components/MapView.tsx`
- `src/features/location/api/location-api.ts` (ensure history query exists)

---

## 3. Emergency Button (1 week) ⚡ HIGH PRIORITY

### Implementation Steps

#### Step 1: Create Emergency API
```typescript
// src/features/safety/api/emergency-api.ts
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { ApiResponse } from '@/types';

export interface EmergencyAlert {
  id: string;
  hubId: string;
  userId: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  timestamp: Date;
  type: 'sos' | 'crash' | 'medical';
  status: 'active' | 'resolved';
}

export const createEmergencyAlert = async (
  hubId: string,
  userId: string,
  location: { latitude: number; longitude: number; address?: string },
  type: 'sos' | 'crash' | 'medical' = 'sos'
): Promise<ApiResponse<EmergencyAlert>> => {
  try {
    const alertRef = await addDoc(collection(db, 'hubs', hubId, 'emergencyAlerts'), {
      userId,
      hubId,
      location,
      type,
      status: 'active',
      timestamp: serverTimestamp(),
    });

    // Send push notifications to all hub members
    // (implement via Cloud Function)

    return {
      success: true,
      data: {
        id: alertRef.id,
        hubId,
        userId,
        location,
        type,
        status: 'active',
        timestamp: new Date(),
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};
```

#### Step 2: Create Emergency Button Component
```typescript
// src/features/safety/components/EmergencyButton.tsx
import { useState } from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import { useMutation } from '@tanstack/react-query';
import { createEmergencyAlert } from '../api/emergency-api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';
import { useUserLocation } from '@/features/location/hooks/useLocation';
import toast from 'react-hot-toast';

export const EmergencyButton = () => {
  const { user } = useAuth();
  const { currentHub } = useHubStore();
  const { currentLocation } = useUserLocation();
  const [isPressed, setIsPressed] = useState(false);

  const emergencyMutation = useMutation({
    mutationFn: async () => {
      if (!currentHub || !user || !currentLocation) {
        throw new Error('Missing required data');
      }

      return createEmergencyAlert(
        currentHub.id,
        user.id,
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        },
        'sos'
      );
    },
    onSuccess: () => {
      toast.success('Emergency alert sent to your family!');
      // Also trigger phone call/SMS if configured
    },
    onError: (error: any) => {
      toast.error('Failed to send emergency alert: ' + error.message);
    },
  });

  const handleEmergency = () => {
    if (confirm('Send emergency alert to your family?')) {
      emergencyMutation.mutate();
    }
  };

  return (
    <button
      onClick={handleEmergency}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      disabled={emergencyMutation.isPending || !currentLocation}
      className={`
        fixed bottom-24 right-6 z-50
        w-16 h-16 rounded-full
        bg-red-600 text-white
        shadow-2xl
        flex items-center justify-center
        transition-all duration-200
        ${isPressed ? 'scale-90' : 'scale-100'}
        ${emergencyMutation.isPending ? 'opacity-50' : 'hover:bg-red-700'}
        focus:outline-none focus:ring-4 focus:ring-red-300
      `}
      aria-label="Emergency SOS"
    >
      <FiAlertCircle size={28} />
    </button>
  );
};
```

#### Step 3: Add to Location Page
```typescript
// In LocationPage.tsx
import { EmergencyButton } from '@/features/safety/components/EmergencyButton';

// Add to JSX
<EmergencyButton />
```

**Files to Create**:
- `src/features/safety/api/emergency-api.ts`
- `src/features/safety/components/EmergencyButton.tsx`
- `src/features/safety/hooks/useEmergency.ts` (optional)

**Files to Update**:
- `src/features/location/pages/LocationPage.tsx`
- `firestore.rules` (add emergencyAlerts collection rules)
- Cloud Functions (add push notification trigger)

---

## 4. ETA Calculation (1 week) ⚡ MEDIUM PRIORITY

### Implementation Steps

#### Step 1: Create ETA Service
```typescript
// src/features/location/services/eta-service.ts
export interface ETAResult {
  duration: number; // seconds
  distance: number; // meters
  durationText: string; // "15 mins"
  distanceText: string; // "5.2 km"
}

class ETAService {
  async calculateETA(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<ETAResult | null> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?` +
        `origin=${origin.lat},${origin.lng}&` +
        `destination=${destination.lat},${destination.lng}&` +
        `key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];
        
        return {
          duration: leg.duration.value,
          distance: leg.distance.value,
          durationText: leg.duration.text,
          distanceText: leg.distance.text,
        };
      }
    } catch (error) {
      console.error('ETA calculation error:', error);
    }

    return null;
  }
}

export const etaService = new ETAService();
```

#### Step 2: Create ETA Display Component
```typescript
// src/features/location/components/ETADisplay.tsx
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { etaService } from '../services/eta-service';
import { FiClock, FiNavigation } from 'react-icons/fi';

interface ETADisplayProps {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  memberName: string;
}

export const ETADisplay = ({ origin, destination, memberName }: ETADisplayProps) => {
  const { data: eta, isLoading } = useQuery({
    queryKey: ['eta', origin, destination],
    queryFn: () => etaService.calculateETA(origin, destination),
    enabled: !!origin && !!destination,
    refetchInterval: 60000, // Update every minute
  });

  if (isLoading) {
    return <div className="text-body-sm text-on-variant">Calculating...</div>;
  }

  if (!eta) {
    return null;
  }

  return (
    <div className="bg-surface rounded-card p-4 space-y-2">
      <div className="flex items-center gap-2">
        <FiNavigation size={16} className="text-primary" />
        <span className="text-title-sm text-on-surface">ETA to {memberName}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <FiClock size={14} className="text-on-variant" />
          <span className="text-body-md text-on-surface font-semibold">
            {eta.durationText}
          </span>
        </div>
        <span className="text-body-sm text-on-variant">
          {eta.distanceText} away
        </span>
      </div>
    </div>
  );
};
```

**Files to Create**:
- `src/features/location/services/eta-service.ts`
- `src/features/location/components/ETADisplay.tsx`

**Files to Update**:
- `src/features/location/components/MemberLocationCard.tsx`
- `src/features/location/components/MapView.tsx`

---

## 5. Speed Alerts (1-2 weeks) ⚡ MEDIUM PRIORITY

### Implementation Steps

#### Step 1: Create Speed Monitor Service
```typescript
// src/features/safety/services/speed-monitor.ts
import { getSpeedLimit } from './speed-limit-api';

interface SpeedAlert {
  userId: string;
  speed: number; // km/h
  speedLimit: number; // km/h
  location: { lat: number; lng: number };
  timestamp: Date;
}

class SpeedMonitorService {
  private speedThreshold = 10; // km/h over limit
  private lastAlerts = new Map<string, number>(); // userId -> lastAlertTime

  async checkSpeed(
    userId: string,
    speed: number,
    location: { lat: number; lng: number }
  ): Promise<SpeedAlert | null> {
    // Get speed limit for location
    const speedLimit = await getSpeedLimit(location);

    if (!speedLimit) return null;

    // Check if over threshold
    if (speed > speedLimit + this.speedThreshold) {
      // Throttle alerts (max 1 per 5 minutes)
      const lastAlert = this.lastAlerts.get(userId) || 0;
      if (Date.now() - lastAlert < 5 * 60 * 1000) {
        return null;
      }

      this.lastAlerts.set(userId, Date.now());

      return {
        userId,
        speed,
        speedLimit,
        location,
        timestamp: new Date(),
      };
    }

    return null;
  }
}

export const speedMonitorService = new SpeedMonitorService();
```

#### Step 2: Integrate with Location Updates
```typescript
// In useLocation.ts, add speed monitoring
useEffect(() => {
  if (currentLocation && isSharing && currentLocation.speed) {
    speedMonitorService.checkSpeed(
      user.id,
      currentLocation.speed * 3.6, // Convert m/s to km/h
      {
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
      }
    ).then(alert => {
      if (alert) {
        // Send alert to parents
        createSpeedAlert(currentHub.id, alert);
      }
    });
  }
}, [currentLocation]);
```

**Files to Create**:
- `src/features/safety/services/speed-monitor.ts`
- `src/features/safety/services/speed-limit-api.ts`
- `src/features/safety/api/speed-alert-api.ts`

**Files to Update**:
- `src/features/location/hooks/useLocation.ts`

---

## Implementation Checklist

### Address Lookup
- [ ] Create `geocoding-service.ts`
- [ ] Update location API to store addresses
- [ ] Update UI components to display addresses
- [ ] Add address caching
- [ ] Test with various locations

### Location History Visualization
- [ ] Create `useLocationHistory` hook
- [ ] Create `LocationHistoryView` component
- [ ] Add polyline rendering to map
- [ ] Add time filter controls
- [ ] Test with real location data

### Emergency Button
- [ ] Create emergency API
- [ ] Create EmergencyButton component
- [ ] Add to LocationPage
- [ ] Set up Cloud Function for notifications
- [ ] Test emergency flow

### ETA Calculation
- [ ] Create ETA service
- [ ] Create ETA display component
- [ ] Integrate with member cards
- [ ] Add auto-refresh
- [ ] Test with various routes

### Speed Alerts
- [ ] Create speed monitor service
- [ ] Integrate speed limit API
- [ ] Add alert creation
- [ ] Set up notifications
- [ ] Test speed detection

## Next Steps After Quick Wins

1. **Start Mobile App Development** (Capacitor)
2. **Implement Background Location Tracking**
3. **Build Crash Detection System**
4. **Create Subscription System**

See `LIFE360_COMPETITIVE_ROADMAP.md` for full roadmap.


