import React from 'react';
import { View, Text, Image, ScrollView, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import styles from '../styles/stylesLessons';
import CustomButton from '../components/CustomButton';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import lessonsData from '../assets/data/lessonsData';
import LessonKanaGame from './LessonKanaGame';

const Drawer = createDrawerNavigator();

function LessonPage({ route }) {
  const { pageData } = route.params;

  if (pageData.game === 'LessonKanaGame') {
    return <LessonKanaGame data={pageData.gameData} />;
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.lessonBlock}>
      <View style={styles.content}>
        {pageData.sections.map((section, index) => (
          <View key={index} style={styles.section}>
            {section.title && <Text style={styles.sectionTitle}>{section.title}</Text>}
            <Text style={styles.sectionContent}>{section.content}</Text>
            {section.imageUrl && <Image source={{ uri: section.imageUrl }} style={styles.sectionImage} />}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem label="Home" onPress={() => props.navigation.navigate('Home')} />
    </DrawerContentScrollView>
  );
}

function LessonsDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerStyle: {
          backgroundColor: '#8423D9',
          width: 240,
        },
        headerStyle: {
          backgroundColor: '#8423D9', 
          height: 105,
          borderBottomWidth: 10,
          borderBottomColor: '#6C3A99',
          
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontFamily: 'Jua',
        },
        drawerActiveTintColor: '#f5f5f5',
          drawerItemStyle: { marginVertical: 5,
        },
      }}
    >
      {lessonsData[0].pages.map((page, index) => (
        <Drawer.Screen
          key={index}
          name={`Page ${index + 1}: ${page.title}`}
          component={LessonPage}
          initialParams={{ pageData: page }}
        />
      ))}
    </Drawer.Navigator>
  );
}

const Lessons = () => {
  return (
    <View style={styles.container}>
      <NavigationContainer independent={true}>
        <LessonsDrawerNavigator />
      </NavigationContainer>
    </View>
  );
};

export default Lessons;
