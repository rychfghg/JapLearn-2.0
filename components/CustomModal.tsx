import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const uiFont = Platform.select({ android: 'sans-serif', ios: 'System', web: 'Inter, system-ui, sans-serif' });

// Colour sets for the auth variant. 'info' is the original look and stays the default.
const TONES = {
    info: { icon: 'information-circle-outline', color: '#7B2CBF', tint: '#F2E8F9', button: '#7B2CBF' },
    error: { icon: 'alert-circle-outline', color: '#C53D47', tint: '#FCEBED', button: '#7B2CBF' },
    warning: { icon: 'time-outline', color: '#C27A1A', tint: '#FDF1E1', button: '#7B2CBF' },
    success: { icon: 'checkmark-circle-outline', color: '#4E9A2E', tint: '#EAF6E2', button: '#7B2CBF' },
};

type Tone = keyof typeof TONES;

type CustomModalProps = {
    visible: boolean;
    message: string;
    onClose: () => void;
    variant?: 'default' | 'auth';
    title?: string;
    tone?: Tone;
    icon?: any;
    hint?: string;
    actionLabel?: string;
    onAction?: () => void;
    closeLabel?: string;
};

const CustomModal = ({
    visible,
    message,
    onClose,
    variant = 'default',
    title = 'Notice',
    tone = 'info',
    icon,
    hint,
    actionLabel,
    onAction,
    closeLabel,
}: CustomModalProps) => {
    const auth = variant === 'auth';
    const palette = TONES[tone] || TONES.info;
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
                        <View style={[styles.authIcon, { backgroundColor: palette.tint }]}>
                            <Ionicons name={icon || palette.icon} size={25} color={palette.color} />
                        </View>
                        <Text style={styles.authTitle}>{title}</Text>
                    </>}
                    <Text style={[styles.modalMessage, auth && styles.authMessage, auth && hint && styles.authMessageTight]}>{message}</Text>
                    {auth && hint ? (
                        <View style={[styles.authHint, { borderColor: palette.tint }]}>
                            <Ionicons name="bulb-outline" size={15} color={palette.color} />
                            <Text style={styles.authHintText}>{hint}</Text>
                        </View>
                    ) : null}
                    {auth && actionLabel && onAction ? (
                        <Pressable onPress={onAction} style={[styles.authButton, { backgroundColor: palette.button }]}>
                            <Text style={[styles.buttonText, styles.authButtonText]}>{actionLabel}</Text>
                        </Pressable>
                    ) : null}
                    <Pressable
                        onPress={onClose}
                        style={[styles.button, auth && styles.authButton, auth && actionLabel && onAction && styles.authSecondaryButton]}
                    >
                        <Text style={[styles.buttonText, auth && styles.authButtonText, auth && actionLabel && onAction && styles.authSecondaryText]}>
                            {closeLabel || (auth ? (actionLabel && onAction ? 'Try again' : 'Okay') : 'Close')}
                        </Text>
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
    authMessageTight:{marginBottom:12},
    authHint:{flexDirection:'row',alignItems:'flex-start',gap:8,width:'100%',padding:12,borderRadius:12,borderWidth:1,backgroundColor:'#FCFAFD',marginBottom:18},
    authHintText:{flex:1,fontFamily:uiFont,fontSize:12.5,lineHeight:18,color:'#6C6271'},
    authSecondaryButton:{marginTop:10,backgroundColor:'#F3EEF6'},
    authSecondaryText:{color:'#5F5166'},
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
