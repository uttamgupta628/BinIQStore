import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ImageBackground,
  StatusBar,
  Pressable,
  Image,
  TextInput
} from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SearchIcon from '../../../assets/SearchIcon.svg';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import CameraIcon from '../../../assets/CameraIcon.svg';
import FilterIcon from '../../../assets/FilterIcon.svg';
const { width } = Dimensions.get('window');

// Component for individual list item


// Component for the My Items tab
const topBins = [
  {
    id: 1,
    image: require('../../../assets/flip_find.png'),
    title: 'FLIP $ FIND',
    location: 'Florida US',
    distance: '3.4KM',
    review: '4.2'
  },
  {
    id: 2,
    image: require('../../../assets/hidden_finds.png'),
    title: 'HIDDED FINDS',
    location: 'Florida US',
    distance: '3.4KM',
    review: '4.2'
  },
  {
    id: 3,
    image: require('../../../assets/flip_find.png'),
    title: 'FLIP $ FIND',
    location: 'Florida US',
    distance: '3.4KM',
    review: '4.2'
  },
  {
    id: 4,
    image: require('../../../assets/hidden_finds.png'),
    title: 'HIDDED FINDS',
    location: 'Florida US',
    distance: '3.4KM',
    review: '4.2'
  },
]


const renderMyFavourites = ({ item }) => (
  <View style={{ width: wp(47), height: hp(26) }}>
    <View style={{ width: wp(45), height: hp(26), borderRadius: 5, borderWidth: 0.5, borderColor: '#e6e6e6' }}>
      <Image source={item.image} style={{ width: wp(45), height: hp(13), borderRadius: 5 }} />
      <Ionicons name='heart' size={hp(3)} color={'#EE2525'} style={{ position: 'absolute', right: '2%', top: '2%' }} />
      <View style={{ paddingHorizontal: '1%' }}>
        <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#000', fontSize: hp(1.7), margin: '0.5%' }}>{item.description}</Text>
      </View>
      <View style={{ position: 'absolute', bottom: '2%', paddingHorizontal: '3%' }}>
        <View>
          <Text style={{ fontFamily: 'Nunito-Bold', color: '#000', fontSize: hp(1.8) }}>{item.discountPrice}</Text>
          <Text style={{ color: 'red' }}><Text style={{ fontFamily: 'Nunito-Bold', color: '#808488', fontSize: hp(1.8), textDecorationLine: 'line-through' }}>{item.originalPrice}</Text>{'  '}{item.totalDiscount}</Text>
        </View>
      </View>
    </View>
  </View>
);
const NearByBins = () => {
  const [activeTab, setActiveTab] = useState('scan'); // State to track which tab is active
  const navigation = useNavigation();

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity style={{ width: wp(43.6), height: hp(23), borderRadius: 10, borderWidth: 0.5, borderColor: '#e6e6e6', backgroundColor: '#fff', marginHorizontal: '1%', marginVertical: '3%' }} onPress={() => navigation.navigate('BinStore')}>
        <Image source={item.image} style={{ width: wp(43.6), height: hp(13), borderRadius: 10 }} />
        <Ionicons name='heart' size={hp(3)} color={'#EE2525'} style={{ position: 'absolute', right: '2%', top: '2%' }} />
        <View style={{ margin: '6%', flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#0049AF', fontSize: hp(1.8) }}>{item.title}</Text>
            <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#000', fontSize: hp(1.3) }}>{item.location}</Text>
            <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#14BA9C', fontSize: hp(1.5) }}>{item.distance}</Text>
          </View>
          <View style={{ backgroundColor: '#FFBB36', height: hp(2), width: wp(8), flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: '1.5%', borderRadius: 4 }}>
            <FontAwesome name='star' size={8} color={'#fff'} />
            <Text style={{ color: '#fff', fontFamily: 'Nunito-Regular', fontSize: hp(1) }}>{item.review}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent={true} backgroundColor={'transparent'} />
      <ImageBackground
        source={require('../../../assets/vector_1.png')}
        style={styles.vector}
        resizeMode="stretch"
      >
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name='arrow-back-ios' color={'#0D0D26'} size={25} />
            </Pressable>
            <Text style={styles.headerText}>Top Bins Near Me</Text>
          </View>
        </View>
        <View style={styles.searchParent}>
          <Pressable style={styles.searchContainer}>
            <View style={styles.cameraButton}>
              <SearchIcon />
            </View>
            <TextInput style={styles.input} placeholder='search for anything' placeholderTextColor={'#C4C4C4'} />
            <View style={styles.searchButton}>
              <CameraIcon />
            </View>
          </Pressable>
          <TouchableOpacity style={styles.menuButton}>
            <FilterIcon size={10} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, width: '100%' }}>
          <View style={{ width: '100%', marginHorizontal: '4%' }}>
            <FlatList
              data={topBins}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};
export default NearByBins;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F3F5',
  },
  backgroundTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  backgroundBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  header: {
    width: wp(100),
    height: hp(7),
    marginTop: '10%',
    paddingHorizontal: '5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerChild: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(3),
    textAlign: 'left',
    color: '#0D0140'
  },
  backButton: {
    fontSize: 24,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'gray',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: '5%'
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#2CCCA6',
  },
  tabText: {
    fontSize: hp(2.2),
    fontFamily: 'Nunito-SemiBold',
    color: '#000',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: 'gray',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: hp(2.2),
    fontFamily: 'Nunito-Bold',
    color: '#1E1E1E',
  },
  itemSubtitle: {
    fontSize: hp(1.9),
    fontFamily: 'Nunito-SemiBold',
    color: '#666',
  },
  heartIcon: {
    padding: 8,
  },
  list: {
    marginBottom: 100, // Adjust the margin if necessary
  },
  vector: {
    flex: 1,
    width: wp(100),
    height: hp(50),
  },
  enrollNowContainer: {
    position: 'absolute',
    elevation: 5,
    width: wp(90),
    height: hp(18),
    backgroundColor: '#fff',
    bottom: hp(6),
    alignSelf: 'center',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: '10%'
  },
  button: {
    backgroundColor: '#1a237e', // Dark purple color
    width: '80%',
    height: hp(5.6),
    borderRadius: 10,
    justifyContent: 'center',
    elevation: 3, // This creates the shadow for the button
  },
  buttonText: {
    color: 'white',
    fontSize: hp(1.9),
    fontFamily: 'Nunito-Bold',
    textAlign: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: 'trasparent',
    borderWidth: 1,
    borderRadius: 12,
    marginRight: 10,
    borderColor: '#99ABC678',
    height: hp(6),
    marginVertical: '2.5%',
    paddingHorizontal: '3%'
  },
  input: {
    flex: 1,
    fontSize: hp(2.2),
    fontFamily: 'Nunito-Regular',
    paddingVertical: 8,
    color: '#999'
  },
  searchParent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: '3%',
    marginVertical: '5%',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    marginRight: 10,
    borderColor: '#99ABC678',
    height: hp(6.5),
    backgroundColor: '#F2F2F2'
  },
  cameraButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    fontSize: hp(2.2),
    fontFamily: 'Nunito-Regular',
    paddingVertical: 8,
    color: '#999'
  },
  searchButton: {
    padding: 10,
  },
  menuButton: {
    backgroundColor: '#130160',
    padding: 10,
    borderRadius: 12,
    height: hp(6.5),
    width: wp(14),
    justifyContent: 'center',
    alignItems: 'center'
  },
});