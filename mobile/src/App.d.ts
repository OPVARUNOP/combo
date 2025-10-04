declare module '../App' {
  import { FC, ReactNode } from 'react';
  import { ViewStyle } from 'react-native';
  
  interface AppProps {
    children?: ReactNode;
  }
  
  const App: FC<AppProps>;
  
  export default App;
  
  // Export any other types that might be needed
  export interface Styles {
    container: ViewStyle;
    loadingContainer: ViewStyle;
  }
}
