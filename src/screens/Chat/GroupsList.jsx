import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, TouchableWithoutFeedback, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { globalStyles } from '../../utils/Constants'
import Topbar from '../../components/Topbar'
import { useAppState } from '../../context/AppContext'
import { useChatState } from '../../context/ChatContext'
import { getImageUrl, getTimeFromNow } from '../../utils/Functions'

const GroupsList = ({ navigation, route }) => {

  const props = { ...useAppState(), ...useChatState() };
  const [groups, setGroups] = useState(props.groups.sort((a, b) => {
    if (a.lastTime && b.lastTime) return a.lastTime > b.lastTime ? -1 : 1;
    return a.iso > b.iso ? -1 : 1;
  }));
  const [urls, setUrls] = useState({});

  useEffect(() => {
    (async () => {
      let newUrls = {};
      for (const g of groups) {
        if (!g.url) continue;
        newUrls[g.id] = getImageUrl('laijoig-bucket', g.url);
      }
      setUrls(newUrls);
    })();
  }, [groups]);

  return (
    <SafeAreaView style={[globalStyles.safeArea, globalStyles.flex1]}>
      <View style={styles.container}>
        <Topbar title={'聊天室'} buttons={[]}/>
        <ScrollView style={[globalStyles.flex1, styles.list]}>
          <Pressable>
            {groups.map((group, i) => {
              return (
                <TouchableWithoutFeedback key={group.id} onPress={() => navigation.navigate('ChatRoom', { room: group, url: urls[group.id] })}>
                  <View style={styles.group}>
                    <View style={styles.groupAvatar}>
                      {group.url && <Image source={{ uri: urls[group.id] }} style={styles.image}/>}
                    </View>
                    <View style={styles.groupInfo}>
                      <Text style={styles.groupName} numberOfLines={1}>{group.name}</Text>
                      {group.lastMessage && <Text style={styles.lastMessage} numberOfLines={1}>{group.lastSender}: {group.lastMessage}</Text>}
                    </View>
                    <Text style={group.time}>{getTimeFromNow(group.lastTime)}</Text>
                  </View>
                </TouchableWithoutFeedback>
              )
            })}
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  group: {
    ...globalStyles.flexRow,
    ...globalStyles.alignItems.center,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  groupAvatar: {
    width: '18%',
    maxWidth: 64,
    aspectRatio: '1/1',
    borderRadius: 50,
    backgroundColor: '#eee',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  groupInfo: {
    padding: 12,
    paddingHorizontal: 16,
    flex: 1,
  },
  groupName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  lastMessage: {
    marginTop: 6,
  },
  groupTime: {

  },
});

export default GroupsList