import './environment/validate';
import './environment/logging';

// load expo-asset immediately to set a custom `source` transformer in React Native
import 'expo-asset';

import Constants from 'expo-constants';

import { installWebGeolocationPolyfill } from 'expo-location';

if (typeof Constants.manifest.env === 'object') {
  Object.assign(process.env, Constants.manifest.env);
}
// polyfill navigator.geolocation
installWebGeolocationPolyfill();
