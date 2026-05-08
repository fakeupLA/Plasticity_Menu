import { useEffect, useState } from 'react';
import { getFlag, subscribeFlag, type FeatureFlagKey } from './featureFlags';

export function useFeatureFlag(key: FeatureFlagKey): boolean {
  const [value, setValue] = useState<boolean>(() => getFlag(key));
  useEffect(() => subscribeFlag(key, setValue), [key]);
  return value;
}
