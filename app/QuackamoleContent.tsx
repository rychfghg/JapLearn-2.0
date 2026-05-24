import React, { useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { stylesEdit } from '../styles/stylesEdit'; // Ensure this file exists with appropriate styles
import expoconfig from '../expoconfig';

const QuackamoleContent = () => {
    const screenWidth = Dimensions.get('window').width;
    const buttonWidth = (screenWidth - (10 * 6)) / 5; // Adjust to fit your UI spacing

    // Basic Hiragana and Katakana characters
    const hiraganaCharacters = [
        { kana: 'あ', romaji: 'a' }, { kana: 'い', romaji: 'i' }, { kana: 'う', romaji: 'u' },
        { kana: 'え', romaji: 'e' }, { kana: 'お', romaji: 'o' }, { kana: 'か', romaji: 'ka' },
        { kana: 'き', romaji: 'ki' }, { kana: 'く', romaji: 'ku' }, { kana: 'け', romaji: 'ke' },
        { kana: 'こ', romaji: 'ko' }, { kana: 'さ', romaji: 'sa' }, { kana: 'し', romaji: 'shi' },
        { kana: 'す', romaji: 'su' }, { kana: 'せ', romaji: 'se' }, { kana: 'そ', romaji: 'so' },
        { kana: 'た', romaji: 'ta' }, { kana: 'ち', romaji: 'chi' }, { kana: 'つ', romaji: 'tsu' },
        { kana: 'て', romaji: 'te' }, { kana: 'と', romaji: 'to' }, { kana: 'な', romaji: 'na' },
        { kana: 'に', romaji: 'ni' }, { kana: 'ぬ', romaji: 'nu' }, { kana: 'ね', romaji: 'ne' },
        { kana: 'の', romaji: 'no' }, { kana: 'は', romaji: 'ha' }, { kana: 'ひ', romaji: 'hi' },
        { kana: 'ふ', romaji: 'fu' }, { kana: 'へ', romaji: 'he' }, { kana: 'ほ', romaji: 'ho' },
        { kana: 'ま', romaji: 'ma' }, { kana: 'み', romaji: 'mi' }, { kana: 'む', romaji: 'mu' },
        { kana: 'め', romaji: 'me' }, { kana: 'も', romaji: 'mo' }, { kana: 'や', romaji: 'ya' },
        { kana: 'ゆ', romaji: 'yu' }, { kana: 'よ', romaji: 'yo' }, { kana: 'ら', romaji: 'ra' },
        { kana: 'り', romaji: 'ri' }, { kana: 'る', romaji: 'ru' }, { kana: 'れ', romaji: 're' },
        { kana: 'ろ', romaji: 'ro' }, { kana: 'わ', romaji: 'wa' }, { kana: 'を', romaji: 'wo' },
        { kana: 'ん', romaji: 'n' }
    ];

    const katakanaCharacters = [
        { kana: 'ア', romaji: 'a' }, { kana: 'イ', romaji: 'i' }, { kana: 'ウ', romaji: 'u' },
        { kana: 'エ', romaji: 'e' }, { kana: 'オ', romaji: 'o' }, { kana: 'カ', romaji: 'ka' },
        { kana: 'キ', romaji: 'ki' }, { kana: 'ク', romaji: 'ku' }, { kana: 'ケ', romaji: 'ke' },
        { kana: 'コ', romaji: 'ko' }, { kana: 'サ', romaji: 'sa' }, { kana: 'シ', romaji: 'shi' },
        { kana: 'ス', romaji: 'su' }, { kana: 'セ', romaji: 'se' }, { kana: 'ソ', romaji: 'so' },
        { kana: 'タ', romaji: 'ta' }, { kana: 'チ', romaji: 'chi' }, { kana: 'ツ', romaji: 'tsu' },
        { kana: 'テ', romaji: 'te' }, { kana: 'ト', romaji: 'to' }, { kana: 'ナ', romaji: 'na' },
        { kana: 'ニ', romaji: 'ni' }, { kana: 'ヌ', romaji: 'nu' }, { kana: 'ネ', romaji: 'ne' },
        { kana: 'ノ', romaji: 'no' }, { kana: 'ハ', romaji: 'ha' }, { kana: 'ヒ', romaji: 'hi' },
        { kana: 'フ', romaji: 'fu' }, { kana: 'ヘ', romaji: 'he' }, { kana: 'ホ', romaji: 'ho' },
        { kana: 'マ', romaji: 'ma' }, { kana: 'ミ', romaji: 'mi' }, { kana: 'ム', romaji: 'mu' },
        { kana: 'メ', romaji: 'me' }, { kana: 'モ', romaji: 'mo' }, { kana: 'ヤ', romaji: 'ya' },
        { kana: 'ユ', romaji: 'yu' }, { kana: 'ヨ', romaji: 'yo' }, { kana: 'ラ', romaji: 'ra' },
        { kana: 'リ', romaji: 'ri' }, { kana: 'ル', romaji: 'ru' }, { kana: 'レ', romaji: 're' },
        { kana: 'ロ', romaji: 'ro' }, { kana: 'ワ', romaji: 'wa' }, { kana: 'ヲ', romaji: 'wo' },
        { kana: 'ン', romaji: 'n' }
    ];

    // Local state to track selected characters
    const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);

    const addCharacter = async (character) => {
        try {
            const response = await fetch(`${expoconfig.API_URL}/api/quackamolecontent/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ kana: character.kana, romaji: character.romaji }),
            });
            if (!response.ok) throw new Error(`Failed to add character: ${response.statusText}`);
            console.log(`Character ${character.kana} added successfully`);
        } catch (error) {
            console.error('Error adding character:', error.message);
            Alert.alert('Error', `Failed to add character: ${error.message}`);
        }
    };
    
    const removeCharacter = async (character) => {
        try {
            const response = await fetch(`${expoconfig.API_URL}/api/quackamolecontent/remove`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ kana: character.kana, romaji: character.romaji }),
            });
            if (!response.ok) throw new Error(`Failed to remove character: ${response.statusText}`);
            console.log(`Character ${character.kana} removed successfully`);
        } catch (error) {
            console.error('Error removing character:', error.message);
            Alert.alert('Error', `Failed to remove character: ${error.message}`);
        }
    };

    const handleCharacterPress = (character: { kana: string; romaji: string }) => {
        if (selectedCharacters.includes(character.kana)) {
            setSelectedCharacters((prev) => prev.filter((kana) => kana !== character.kana));
            removeCharacter(character);
        } else {
            setSelectedCharacters((prev) => [...prev, character.kana]);
            addCharacter(character);
        }
    };

    const renderCharacters = () => {
        const allCharacters = [...hiraganaCharacters, ...katakanaCharacters];
        return allCharacters.map((character, index) => (
            <TouchableOpacity
                key={index}
                onPress={() => handleCharacterPress(character)}
                style={[
                    stylesEdit.characterButton,
                    selectedCharacters.includes(character.kana) && stylesEdit.selectedCharacter,
                    { width: buttonWidth, height: buttonWidth, justifyContent: 'center', alignItems: 'center' },
                ]}
            >
                <Text style={stylesEdit.characterText}>{character.kana}</Text>
            </TouchableOpacity>
        ));
    };

    return (
        <View style={{ flex: 1, padding: 10 }}>
            <Text style={stylesEdit.titleText}>Quackamole Content Editor</Text>
            <ScrollView style={{ flex: 1 }}>
                <View style={stylesEdit.charContainer}>{renderCharacters()}</View>
            </ScrollView>
        </View>
    );
};

export default QuackamoleContent;
