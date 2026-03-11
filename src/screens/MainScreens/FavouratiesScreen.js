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
  Image
} from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import SearchIcon from '../../../assets/SearchIcon.svg';
import CameraIcon from '../../../assets/CameraIcon.svg';
import FilterIcon from '../../../assets/FilterIcon.svg';

const { width } = Dimensions.get('window');

// Component for individual list items
const ListItem = ({ item }) => (
  <View style={styles.itemContainer}>
    <View style={styles.itemImage} />
    <View style={styles.itemDetails}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
    </View>
    <TouchableOpacity style={styles.heartIcon}>
      <Ionicons name={item.isFavorite ? "heart" : "heart-outline"} size={24} color={item.isFavorite ? "red" : "gray"} />
    </TouchableOpacity>
  </View>
);

// Component for the Scan History tab
const TopBinItemsList = () => {
  const myFavourites = [{
    id: 1,
    image: require('../../../assets/gray_img.png'),
    description: `IWC Schaffhausen 2021 Pilot's Watch "SIHH 2019" 44mm`,
    discountPrice: '$65',
    originalPrice: '$151',
    totalDiscount: '60% off'
  },
  {
    id: 2,
    image: require('../../../assets/gray_img.png'),
    description: `IWC Schaffhausen 2021 Pilot's Watch "SIHH 2019" 44mm`,
    discountPrice: '$65',
    originalPrice: '$151',
    totalDiscount: '60% off'
  },
  {
    id: 3,
    image: require('../../../assets/gray_img.png'),
    description: `IWC Schaffhausen 2021 Pilot's Watch "SIHH 2019" 44mm`,
    discountPrice: '$65',
    originalPrice: '$151',
    totalDiscount: '60% off'
  },
  {
    id: 4,
    image: require('../../../assets/gray_img.png'),
    description: `IWC Schaffhausen 2021 Pilot's Watch "SIHH 2019" 44mm`,
    discountPrice: '$65',
    originalPrice: '$151',
    totalDiscount: '60% off'
  },
  ]

  return (
    <>
      <View style={styles.searchParent}>
        <Pressable style={styles.searchContainer}>
          <View style={styles.cameraButton}>
            <SearchIcon />
          </View>
          <Text style={styles.input}>search for anything</Text>
          <View style={styles.searchButton}>
            <CameraIcon />
          </View>
        </Pressable>
        <TouchableOpacity style={styles.menuButton}>
          <FilterIcon size={10} />
        </TouchableOpacity>
      </View>
      <Text style={{ fontFamily: 'Nunito-Bold', fontSize: hp(2.3), color: '#000000', marginVertical: '2%', marginHorizontal: '5.5%' }}>FAV. ITEMS</Text>
      <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
        <FlatList
          data={myFavourites}
          renderItem={renderMyFavourites}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
        />
      </View>
    </>
  );
};

// Component for the My Items tab
const MyItemsScreen = () => {
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
  const renderItem = ({ item }) => (
    <View style={{ width: wp(43.6), height: hp(23), borderRadius: 10, borderWidth: 0.5, borderColor: '#e6e6e6', backgroundColor: '#fff', marginHorizontal: '1%', marginVertical: '3%' }}>
      <Image source={item.image} style={{ width: wp(43.6), height: hp(13), borderRadius: 10 }} />
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
    </View>
  );
  return (
    <View style={{ flex: 1, width: '100%' }}>
      <View style={styles.searchParent}>
        <Pressable style={styles.searchContainer}>
          <View style={styles.cameraButton}>
            <SearchIcon />
          </View>
          <Text style={styles.input}>search for anything</Text>
          <View style={styles.searchButton}>
            <CameraIcon />
          </View>
        </Pressable>
        <TouchableOpacity style={styles.menuButton}>
          <FilterIcon size={10} />
        </TouchableOpacity>
      </View>
      <Text style={{ fontFamily: 'Nunito-Bold', fontSize: hp(2.3), color: '#000000', marginVertical: '2%', marginHorizontal: '5.5%' }}>FAV. BINS</Text>
      <View style={{ width: '100%', alignItems: 'center' }}>
        <FlatList
          data={topBins}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
        />
      </View>
    </View>
  );
};
const renderMyFavourites = ({ item }) => (
  <View style={{ width: wp(47), height: hp(26), alignItems: 'center', marginVertical: '1%' }}>
    <View style={{ width: wp(45), height: hp(26), borderRadius: 5, borderWidth: 1, borderColor: '#e6e6e6', backgroundColor: '#fff' }}>
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
const FavouratiesScreen = () => {
  const [activeTab, setActiveTab] = useState('scan'); // State to track which tab is active
  const navigation = useNavigation();

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
            <Text style={styles.headerText}>My Favourites</Text>
          </View>
        </View>

        {/* Tab navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'scan' && styles.activeTab]}
            onPress={() => setActiveTab('scan')}
          >
            <Text style={[styles.tabText, activeTab === 'scan' && styles.activeTabText]}>Fav Items</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'items' && styles.activeTab]}
            onPress={() => setActiveTab('items')}
          >
            <Text style={[styles.tabText, activeTab === 'items' && styles.activeTabText]}>Location</Text>
          </TouchableOpacity>
        </View>

        {/* Content for the active tab */}
        <ScrollView style={styles.content}>
          {/* <Text style={styles.sectionTitle}>TODAY</Text> */}
          {activeTab === 'scan' ? <ScrollView style={{ flex: 1 }}>
            <TopBinItemsList />
          </ScrollView> :
            <ScrollView style={{ flex: 1 }}>
              <MyItemsScreen />
            </ScrollView>
          }
          <View style={styles.enrollNowContainer}>
            <Pressable style={styles.button} onPress={() => navigation.navigate('HomeNavigataor')}>
              <Text style={styles.buttonText}>ADD TO LIBRARY</Text>
            </Pressable>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};
export default FavouratiesScreen;


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
    marginVertical: '5%',
    width: wp(100),
    height: hp(6),
    paddingHorizontal: '5%'
  },
  tab: {
    width: wp(40),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: '#99ABC62E'
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
    // backgroundColor: 'red'
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
    width: wp(85),
    height: hp(13),
    bottom: 0,
    alignSelf: 'center',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: '8%'
  },
  button: {
    backgroundColor: '#1a237e', // Dark purple color
    width: '77%',
    height: hp(5),
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
  searchParent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: '3%',
    marginBottom: '4%',
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