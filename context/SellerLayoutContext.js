import { useCallback, useSyncExternalStore } from 'react';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';

let drawerNavigation = null;
const listeners = new Set();

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return drawerNavigation;
}

export function registerDrawerNavigation(navigation) {
  drawerNavigation = navigation;
  listeners.forEach((listener) => listener());
}

export function useSellerDrawer() {
  const screenNavigation = useNavigation();
  const registeredNavigation = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const navigation = registeredNavigation ?? screenNavigation;

  const openDrawer = useCallback(
    () => navigation.dispatch(DrawerActions.openDrawer()),
    [navigation],
  );
  const closeDrawer = useCallback(
    () => navigation.dispatch(DrawerActions.closeDrawer()),
    [navigation],
  );
  const toggleDrawer = useCallback(
    () => navigation.dispatch(DrawerActions.toggleDrawer()),
    [navigation],
  );

  return { openDrawer, closeDrawer, toggleDrawer };
}
