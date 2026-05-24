import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Image, ScrollView} from 'react-native';
import {stylesScore} from '../styles/stylesScore';
import BackIcon from '../assets/svg/back-icon.svg';
import CustomButton from '../components/CustomButton';
import Background from '../assets/svg/scoreBackground.svg'

const Score = ({navigation}) => {
    const [activeCategory, setActiveCategory] = useState(1);
    
    const handleBackPress = () => {
        navigation.navigate('Profile');
    }
    const handleCategoryPress = (category) => {
        setActiveCategory(category);
    }

    return(
        <View style={stylesScore.container}>
            <Background style={[stylesScore.background]} />
            <View style={stylesScore.header}>
                <TouchableOpacity onPress={handleBackPress}>
                    <View style={stylesScore.backButtonContainer}>
                        <BackIcon width={20} height={20} fill={'white'}/>
                    </View>
                </TouchableOpacity>
            </View>

            
            <View style={stylesScore.categoryContainer}>
                <CustomButton title="QUACKMAN" onPress={() => handleCategoryPress(1)} style={stylesScore.categoryButton} textStyle={stylesScore.categoryButtonText} />
                <CustomButton title="QUACKAMOLE" onPress={() => handleCategoryPress(2)} style={stylesScore.categoryButton} textStyle={stylesScore.categoryButtonText} />
                <CustomButton title="QUACKSLATE" onPress={() => handleCategoryPress(3)} style={stylesScore.categoryButton} textStyle={stylesScore.categoryButtonText} />
            </View>
            <ScrollView>
                <View style={stylesScore.scoreContainer}>
                    {activeCategory == 1 && (
                        <>
                            <View style={stylesScore.scoreField}>
                                <Text style={stylesScore.scoreTitleText}>てんすえ: Hiragana 1</Text>
                                <View style={stylesScore.scoreTextContainer}>
                                    <View><Text style={stylesScore.scoreText}>Best: </Text></View>
                                    <View><Text style={stylesScore.scoreText}>Curent: </Text></View>
                                </View>

                            </View>
                            <View style={stylesScore.scoreField}>
                                <Text style={stylesScore.scoreTitleText}>てんすえ: Hiragana 2</Text>
                                <View style={stylesScore.scoreTextContainer}>
                                    <View><Text style={stylesScore.scoreText}>Best: </Text></View>
                                    <View><Text style={stylesScore.scoreText}>Curent: </Text></View>
                                </View>
                            </View>
                        </>
                    )}
                    {activeCategory == 2 && (
                            <>
                                <View style={stylesScore.scoreField}>
                                    <Text style={stylesScore.scoreTitleText}>てんすえ: Intro</Text>
                                    <View style={stylesScore.scoreTextContainer}>
                                        <View><Text style={stylesScore.scoreText}>Best: </Text></View>
                                        <View><Text style={stylesScore.scoreText}>Current: </Text></View>
                                    </View>
                                </View>
                                <View style={stylesScore.scoreField}>
                                    <Text style={stylesScore.scoreTitleText}>てんすえ: Basics I</Text>
                                    <View style={stylesScore.scoreTextContainer}>
                                        <View><Text style={stylesScore.scoreText}>Best: </Text></View>
                                        <View><Text style={stylesScore.scoreText}>Current: </Text></View>
                                    </View>
                                </View>
                                <View style={stylesScore.scoreField}>
                                    <Text style={stylesScore.scoreTitleText}>てんすえ: Basics II</Text>
                                    <View style={stylesScore.scoreTextContainer}>
                                        <View><Text style={stylesScore.scoreText}>Best: </Text></View>
                                        <View><Text style={stylesScore.scoreText}>Current: </Text></View>
                                    </View>
                                </View>
                            </>
                        )}
                        {activeCategory == 3 && (
                            <>
                                <View style={stylesScore.scoreField}>
                                    <Text style={stylesScore.scoreTitleText}>てんすえ: Intro</Text>
                                    <View style={stylesScore.scoreTextContainer}>
                                        <View><Text style={stylesScore.scoreText}>Best: </Text></View>
                                        <View><Text style={stylesScore.scoreText}>Current: </Text></View>
                                    </View>
                                </View>
                                <View style={stylesScore.scoreField}>
                                    <Text style={stylesScore.scoreTitleText}>てんすえ: Basics I</Text>
                                    <View style={stylesScore.scoreTextContainer}>
                                        <View><Text style={stylesScore.scoreText}>Best: </Text></View>
                                        <View><Text style={stylesScore.scoreText}>Current: </Text></View>
                                    </View>
                                </View>
                                <View style={stylesScore.scoreField}>
                                    <Text style={stylesScore.scoreTitleText}>てんすえ: Basics II</Text>
                                    <View style={stylesScore.scoreTextContainer}>
                                        <View><Text style={stylesScore.scoreText}>Best: </Text></View>
                                        <View><Text style={stylesScore.scoreText}>Current: </Text></View>
                                    </View>
                                </View>
                            </>
                        )}
                </View>
            </ScrollView>
        </View>
    );
}

export default Score;