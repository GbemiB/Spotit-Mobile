import { View, ScrollView } from 'react-native';

export default function Carousel({ children, style }) {
  return (
    <View style={style}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} decelerationRate="fast" scrollEventThrottle={16}>
        {children}
      </ScrollView>
    </View>
  );
}
