import React, { createContext, useContext, useState, useEffect } from 'react';

export interface SecurityConfig {
  isEnabled: boolean;
  pin: string; // Default: '1234'
  useBiometrics: boolean;
  autoLockMinutes: number; // 0 = immediately, 1, 5, 15
  lastActiveTimestamp: number;
}

interface SecurityContextType {
  isLocked: boolean;
  securityConfig: SecurityConfig;
  unlockWithPin: (enteredPin: string) => boolean;
  unlockWithBiometrics: () => Promise<boolean>;
  lockApp: () => void;
  updateSecurityConfig: (updates: Partial<SecurityConfig>) => void;
  changePin: (currentPin: string, newPin: string) => boolean;
  hasWebAuthnSupport: boolean;
}

const STORAGE_KEY = 'gestor_financeiro_security_v1';

const DEFAULT_CONFIG: SecurityConfig = {
  isEnabled: true, // Enabled by default for immediate security experience
  pin: '1234',
  useBiometrics: true,
  autoLockMinutes: 0, // Locks on refresh/open
  lastActiveTimestamp: Date.now(),
};

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_CONFIG;
  });

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    // If security is enabled, start in locked state
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.isEnabled !== false;
      } catch (e) {
        return true;
      }
    }
    return true; // Default locked with PIN 1234
  });

  const [hasWebAuthnSupport, setHasWebAuthnSupport] = useState(false);

  // Detect WebAuthn biometric availability
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.PublicKeyCredential &&
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
    ) {
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(available => setHasWebAuthnSupport(available))
        .catch(() => setHasWebAuthnSupport(true));
    } else {
      setHasWebAuthnSupport(true); // Fallback simulated touch ID
    }
  }, []);

  // Save config changes
  const saveConfig = (newConfig: SecurityConfig) => {
    setSecurityConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  const updateSecurityConfig = (updates: Partial<SecurityConfig>) => {
    const updated = { ...securityConfig, ...updates };
    saveConfig(updated);
    if (updates.isEnabled === false) {
      setIsLocked(false);
    }
  };

  // PIN Unlock
  const unlockWithPin = (enteredPin: string): boolean => {
    if (!securityConfig.isEnabled) {
      setIsLocked(false);
      return true;
    }

    if (enteredPin === securityConfig.pin) {
      setIsLocked(false);
      updateSecurityConfig({ lastActiveTimestamp: Date.now() });
      return true;
    }
    return false;
  };

  // Biometrics Unlock (WebAuthn with seamless fallback)
  const unlockWithBiometrics = async (): Promise<boolean> => {
    if (!securityConfig.isEnabled) {
      setIsLocked(false);
      return true;
    }

    try {
      // If WebAuthn credentials available in browser
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        // Provide simulated instant biometric challenge
        await new Promise(resolve => setTimeout(resolve, 600));
        setIsLocked(false);
        updateSecurityConfig({ lastActiveTimestamp: Date.now() });
        return true;
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsLocked(false);
        return true;
      }
    } catch (err) {
      console.warn('Biometric error:', err);
      return false;
    }
  };

  const lockApp = () => {
    if (securityConfig.isEnabled) {
      setIsLocked(true);
    }
  };

  const changePin = (currentPin: string, newPin: string): boolean => {
    if (currentPin === securityConfig.pin && newPin.length >= 4) {
      updateSecurityConfig({ pin: newPin });
      return true;
    }
    return false;
  };

  return (
    <SecurityContext.Provider
      value={{
        isLocked,
        securityConfig,
        unlockWithPin,
        unlockWithBiometrics,
        lockApp,
        updateSecurityConfig,
        changePin,
        hasWebAuthnSupport,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
