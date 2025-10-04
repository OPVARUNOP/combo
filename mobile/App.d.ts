import { FC } from 'react';
import { ViewStyle } from 'react-native';

// Define the App component type
declare const App: FC<{}>;

// Export the App component as default
export default App;

// Export style types
export interface Styles {
  container: ViewStyle;
  loadingContainer: ViewStyle;
}

// Global type augmentation for the App module
declare global {
  namespace React {
    interface FunctionComponent<P = {}> {
      navigationOptions?: any;
    }
  }
}
