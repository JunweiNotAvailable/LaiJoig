import { Platform } from 'react-native';

export const globalStyles = {
  safeArea: {
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  colors: {
    primary: "#f6a224",
    gray: "#ccc",
    green: '#70cd96',
    red: '#ec8265',
    blue: '#03a5fc',
    error: '#fa5448',
  },
  absolute: {
    position: 'absolute',
  },
  flex1: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
  },
  flexCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  alignItems: {
    center: { alignItems: 'center' },
    flexStart: { alignItems: 'flex-start' },
    flexEnd: { alignItems: 'flex-end' },
  },
  justifyContent: {
    center: { justifyContent: 'center' },
    flexStart: { justifyContent: 'flex-start' },
    flexEnd: { justifyContent: 'flex-end' },
    spaceBetween: { justifyContent: 'space-between' },
    spaceAround: { justifyContent: 'space-around' },
    spaceEvenly: { justifyContent: 'space-evenly' },
  },
  bold: { fontWeight: 'bold' }
}

export const urls = {
  logo: require('../../assets/images/logo.png'),
  user: require('../../assets/images/user.png'),
  userSelected: require('../../assets/images/user-selected.png'),
  chat: require('../../assets/images/chat.png'),
  chatSelected: require('../../assets/images/chat-selected.png'),
  bell: require('../../assets/images/bell.png'),
  bellSelected: require('../../assets/images/bell-selected.png'),
  settings: require('../../assets/images/settings.png'),
}

export const weekDays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
export const hours = Array.from({ length: 24 }, (_, i) => i);
export const minutes = Array.from({ length: 12 }, (_, i) => 5 * i);