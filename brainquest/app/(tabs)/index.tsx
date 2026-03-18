import { View, Text } from 'react-native';

export default function App() {
  return (
    <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#6C63FF'}}>
      <Text style={{fontSize:40}}>🎓</Text>
      <Text style={{fontSize:24, color:'white', fontWeight:'bold'}}>BrainQuest!</Text>
      <Text style={{color:'white'}}>App is working! ✅</Text>
    </View>
  );
}
