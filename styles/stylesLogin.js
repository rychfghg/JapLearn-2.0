import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#8ED94D',
    padding: 12,
    width:  '100%',
    borderRadius: 16,
    borderColor: '#8AC25A',
    borderBottomWidth: 6,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  buttonPressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },

  buttonText: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Jua',
  },

  buttonContainer: {
    alignItems:'center',
    marginTop: 10,
  },

  container: {
    flex: 1,
    backgroundColor: '#FBF9FD',
    overflow: 'hidden',
  },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 46,
    paddingBottom: 28,
  },
  backgroundOrbTop: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130,
    backgroundColor: '#F0E4FA', top: -105, right: -85,
  },
  backgroundOrbBottom: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: '#EAF7DF', bottom: -115, left: -80,
  },

  input: {
    flex: 1,
    color: '#462A5E',
    paddingHorizontal: 10,
    height: 56,
    fontSize: 16,
    outlineStyle: 'none',
    outlineWidth: 0,
  },
  inputReset: {
    flex: 1, color: '#462A5E', paddingHorizontal: 10, height: 56,
    fontSize: 16, outlineStyle: 'none', outlineWidth: 0,
  },

  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mascotWrap: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center' },
  subtitleText: { fontSize: 14, color: '#777076', marginTop: 5, textAlign: 'center' },
  formCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20,
    shadowColor: '#462A5E', shadowOpacity: 0.12, shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 }, elevation: 6,
  },
  formTitle: { fontSize: 20, fontWeight: '700', color: '#462A5E', marginBottom: 14 },
  formSubtitle: { color: '#817586', fontSize: 13, marginTop: -8, marginBottom: 16 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6F3F8',
    borderWidth: 1, borderColor: '#E8E0ED', borderRadius: 15, paddingHorizontal: 15,
    marginBottom: 12,
  },
  inputIcon: { marginRight: 2 },
  
  linkContainer: {
    marginTop: 18,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },

  linkText: {
      color: '#8423D9',
      fontWeight: '600',
      fontSize: 14,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F3F8',
    borderWidth: 1,
    borderColor: '#E8E0ED',
    borderRadius: 15,
    paddingLeft: 15,
    marginBottom: 4,
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 46,
  },
  insideInputButton: {
    position: 'absolute',
    right: 8,
    height: '100%',
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    color: '#8ED94D',
    marginTop: 8,
    fontSize: 28,
    fontFamily: 'Jua'  
  },

  policyTextContainer: {
    flexDirection: 'row',  // Aligns the child elements horizontally (side by side)
    justifyContent: 'center', // Centers the content horizontally (optional)
    alignItems: 'center',  // Aligns vertically in the center (optional)
    marginTop: 20,
  },
  policyText: {
    fontSize: 12,
    color: '#777076',
    textAlign: 'center',
    marginLeft:10
  },
  linkText2: {
    fontSize: 12,
    color: '#8423D9',
    marginLeft: 5,  // Space between the two texts (optional)
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(38,22,50,0.55)',
    paddingHorizontal: 22,
  },
  
  modalContent: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20, // Add vertical spacing between elements
    padding: 26,
    backgroundColor: 'white',
    borderRadius: 24,
    width: '100%',
    maxWidth: 430,
    shadowColor: '#24152F', shadowOpacity: 0.25, shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 }, elevation: 12,
  },
  modalClose: { position: 'absolute', right: 18, top: 18, zIndex: 2, padding: 4 },
  modalIconWrap: {
    width: 58, height: 58, borderRadius: 18, backgroundColor: '#F0E4FA',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15, // Add spacing below the title
    textAlign: 'center',
    color: '#462A5E',
  },
  modalDescription: { color: '#817586', fontSize: 14, lineHeight: 21, textAlign: 'center', marginBottom: 20 },
  resetInputContainer: {
    width: '100%', flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F6F3F8', borderWidth: 1, borderColor: '#E8E0ED',
    borderRadius: 15, paddingHorizontal: 15, marginBottom: 16,
  },
  buttonReset: {
    backgroundColor: '#8ED94D',
    padding: 12,
    width:  '100%',
    borderRadius: 16,
    borderColor: '#8AC25A',
    borderBottomWidth: 6,
    height: 58,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
    
  },

  buttonTextReset: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default styles;
