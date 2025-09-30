import React from 'react';
import {SafeAreaView, Text, View} from 'react-native';

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Test App</Text>
      </View>
    </SafeAreaView>
  );
}

export default App;
