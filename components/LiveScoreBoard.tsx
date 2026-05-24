import { View, Text, ScrollView, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import expoconfig from '../expoconfig';

const LiveScoreBoard = ({ gameCode }) => {
    const [liveScores, setLiveScores] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchScores = async () => {
            try {
                const response = await fetch(`${expoconfig.API_URL}/api/scores/live/${gameCode}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch scores');
                }
                const scores = await response.json();
                setLiveScores(scores);
                setError(null);
            } catch (err) {
                setError('Error loading scores');
                console.error('Error fetching live scores:', err);
            }
        };

        // Initial fetch
        fetchScores();

        // Set up polling interval
        const pollInterval = setInterval(fetchScores, 3000); // Poll every 3 seconds

        // Cleanup
        return () => clearInterval(pollInterval);
    }, [gameCode]);

    return (
        <ScrollView style={styles.scoresContainer}>
            <Text style={styles.scoresTitle}>Live Scores</Text>
            {error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : (
                <>
                    {liveScores.map(([player, score], index) => (
                        <View key={index} style={styles.scoreRow}>
                            <Text style={styles.playerText}>
                                {index + 1}. {player}
                            </Text>
                            <Text style={styles.scoreText}>{score}</Text>
                        </View>
                    ))}
                    {liveScores.length === 0 && (
                        <Text style={styles.noScoresText}>No scores yet</Text>
                    )}
                </>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scoresContainer: {
        marginTop: 10,
        marginHorizontal: 20,
        maxHeight: 200,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        padding: 10,
    },
    scoresTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#FFFFFF',
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 12,
        marginVertical: 4,
        borderRadius: 8,
    },
    playerText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    scoreText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2563eb',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 10,
        borderRadius: 8,
    },
    noScoresText: {
        textAlign: 'center',
        color: '#FFFFFF',
        fontStyle: 'italic',
        marginTop: 10,
        padding: 10,
    }
});

export default LiveScoreBoard;