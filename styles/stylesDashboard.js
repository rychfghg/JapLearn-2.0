import { StyleSheet } from 'react-native';

export const stylesDashboard = StyleSheet.create({
  input: {
    backgroundColor: '#EFECEC',
    color: '#333',
    borderRadius: 10,
    padding: 10,
    width: 200,
    marginBottom: 10,
    height: 70,
    fontFamily: 'Jua',
  },

  header: {
    backgroundColor: '#8423D9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 40,
    marginBottom: 10,
    borderBottomWidth: 10,
    borderBottomColor: '#6C3A99',
    height: 130,
  },

  hText: {
    fontFamily: 'Jua',
    color: 'white',
    fontSize: 15,
  },

  leftContainer: {
    flex: 1,
  },

  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },

  menuContainer: {
    justifyContent: 'center',
    padding: 10,
    borderBottomWidth: 5,
    borderBottomColor: '#D9D9D9',
  },

  buttonContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  button: {
    backgroundColor: '#8ED94D',
    padding: 5,
    height: 60,
    width: 100,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'Jua',
  },

  pictureCircle: {
    backgroundColor: 'white',
    width: 65,
    height: 65,
    borderRadius: 50,
  },

  scrollContent: {
    paddingBottom: 40,
  },

  teacherModuleContainer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 6,
  },

  teacherModuleTitle: {
    fontFamily: 'Jua',
    fontSize: 24,
    color: '#462A5E',
    marginBottom: 12,
    textAlign: 'center',
  },

  teacherFeatureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#D6B4FC',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },

  teacherFeatureCode: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#8423D9',
    color: '#FFFFFF',
    fontFamily: 'Jua',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 54,
    marginRight: 12,
  },

  teacherFeatureInfo: {
    flex: 1,
  },

  teacherFeatureTitle: {
    fontFamily: 'Jua',
    fontSize: 17,
    color: '#2A1C10',
  },

  teacherFeatureDesc: {
    fontFamily: 'Jua',
    fontSize: 12,
    color: '#6C5A72',
    marginTop: 4,
    lineHeight: 17,
  },

  classContainer: {
    alignItems: 'center',
    flexGrow: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },

  titleText: {
    fontFamily: 'Jua',
    fontSize: 35,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },

  classContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'lightgray',
    marginTop: 12,
    padding: 20,
    height: 80,
    borderRadius: 30,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    width: 300,
    alignSelf: 'center',
  },

  classContentText: {
    color: '#333',
    fontFamily: 'Jua',
    fontSize: 18,
    textAlign: 'center',
  },

  pendingUserContent: {
    flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: 'lightgray',
    marginVertical: 10,
    padding: 15,
    borderRadius: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignSelf: 'center',
  },

  userInfoContainer: {
    marginBottom: 5,
  },

  pendingUserText: {
    color: '#333',
    fontFamily: 'Jua',
    fontSize: 18,
    textAlign: 'left',
    flex: 1,
    marginBottom: 2,
  },

  pendingUserEmail: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'left',
  },

  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    width: '100%',
  },

  buttonApprove: {
    backgroundColor: '#8ED94D',
    padding: 10,
    height: 40,
    flex: 1,
    marginRight: 5,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  rejectButton: {
    backgroundColor: 'red',
    padding: 10,
    height: 40,
    flex: 1,
    marginLeft: 5,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  titleContainer: {
    padding: 10,
    backgroundColor: '#f1f1f1',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },

  backButtonContainer: {
    height: 50,
    width: 50,
    borderRadius: 50,
    backgroundColor: '#462A5E',
    alignItems: 'center',
    justifyContent: 'center',
  },
});