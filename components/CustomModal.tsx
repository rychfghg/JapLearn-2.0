import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const uiFont = Platform.select({ android: 'sans-serif', ios: 'System', web: 'Inter, system-ui, sans-serif' });

const CustomModal = ({ visible, message, onClose, variant = 'default', title = 'Notice' }) => {
    const auth = variant === 'auth';
    return (
        <Modal
            animationType='fade'
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={[styles.modalOverlay, auth && styles.authOverlay]}>
                <View style={[styles.modalContainer, auth && styles.authContainer]}>
                    {auth && <>
                        <View style={styles.authIcon}><Ionicons name="information-circle-outline" size={25} color="#7B2CBF" /></View>
                        <Text style={styles.authTitle}>{title}</Text>
                    </>}
                    <Text style={[styles.modalMessage, auth && styles.authMessage]}>{message}</Text>
                    <Pressable onPress={onClose} style={[styles.button, auth && styles.authButton]}>
                        <Text style={[styles.buttonText, auth && styles.authButtonText]}>{auth ? 'Okay' : 'Close'}</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalMessage: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
    },
    authOverlay:{backgroundColor:'rgba(31,23,36,.52)',paddingHorizontal:22},
    authContainer:{width:'100%',maxWidth:380,paddingHorizontal:24,paddingTop:26,paddingBottom:22,borderRadius:22,alignItems:'flex-start'},
    authIcon:{width:48,height:48,borderRadius:16,backgroundColor:'#F2E8F9',alignItems:'center',justifyContent:'center',marginBottom:16},
    authTitle:{fontFamily:uiFont,fontSize:21,lineHeight:27,fontWeight:'400',color:'#2F2933',marginBottom:7},
    authMessage:{fontFamily:uiFont,fontSize:14,lineHeight:21,textAlign:'left',color:'#746C78',marginBottom:20},
    authButton:{width:'100%',height:50,borderRadius:12,backgroundColor:'#7B2CBF',alignItems:'center',justifyContent:'center',padding:0},
    authButtonText:{fontFamily:uiFont,fontSize:15,fontWeight:'500'},
    button: {
        padding: 10,
        width: 60,
        backgroundColor: '#8ED94D',
        borderRadius: 5,
    },
    buttonText: {
        fontSize: 16,
        fontFamily: 'Jua',
        color: 'white',
        textAlign: 'center',
    },
});

export default CustomModal;
