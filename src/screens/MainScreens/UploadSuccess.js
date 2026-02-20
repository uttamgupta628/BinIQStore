import { Image, ImageBackground, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import React from 'react'
import { useNavigation } from '@react-navigation/native';
import CameraIcon from '../../../assets/CameraIcon.svg';
import SearchIcon from '../../../assets/SearchIcon.svg';
import GalleryIcon from '../../../assets/gallery_icon.svg';
import ImageUploadSuccess from '../../../assets/img_upload_success.svg';


const UploadSuccess = () => {
    const navigation = useNavigation();
    return (
        <ScrollView style={styles.container}>
            <StatusBar translucent={true} backgroundColor={'transparent'} />
            <ImageBackground source={require('../../../assets/vector_1.png')} style={styles.vector}>
                <View style={{ height: hp(10) }} />
                <View style={{ width: wp(100), paddingHorizontal: '5%' }}>
                    <Text style={{ fontFamily: 'Nunito-Bold', fontSize: hp(3), color: '#14BA9C', textAlign: 'center' }}>Your content has been successfully uploaded!</Text>
                </View>
                <View style={{ paddingHorizontal: '5%', justifyContent: 'center', alignItems: 'center', marginVertical: '25%' }}>
                    <View style={{ width: '50%', height: wp(50) }}>
                        <ImageUploadSuccess width={'100%'} height={'100%'} />
                    </View>
                </View>
                <TouchableOpacity style={styles.gettingStarted} onPress={() => navigation.navigate('MyLibrary')}>
                    <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#fff', fontSize: hp(2) }}>View My Library</Text>
                </TouchableOpacity>
                <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#000', fontSize: hp(2), textDecorationLine: 'underline', textAlign: 'center', marginVertical: '7%' }}>Upload More Content</Text>
            </ImageBackground>
        </ScrollView>
    )
}

export default UploadSuccess

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    uploadContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // marginHorizontal: '3%',
        marginVertical: '2%',
        width: '100%'
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: 'trasparent',
        borderWidth: 1,
        borderRadius: 12,
        // marginRight: 10,
        borderColor: '#99ABC678',
        alignSelf: 'center',
        height: hp(7),
        backgroundColor: '#fff'
    },
    cameraButton: {
        padding: 10,
    },
    input: {
        flex: 1,
        fontSize: hp(2),
        fontFamily: 'Nunito-Regular',
        paddingVertical: 8,
        color: '#000',
        textAlign: 'left'
    },
    searchButton: {
        padding: 10,
    },
    logoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: wp(40),
        height: hp(10.5),
    },
    vector: {
        flex: 1,
        width: wp(100),
        height: hp(100),
    },
    logoText: {
        fontFamily: 'Nunito-SemiBold',
        color: '#000',
        fontSize: hp(2.5)
    },
    cityVector: {
        position: 'absolute',
        width: wp(100),
        bottom: 0
    },
    label: {
        color: 'black',
        fontFamily: 'Nunito-SemiBold',
        fontSize: hp(2.2),
        marginTop: '3%'
    },
    gettingStarted: {
        backgroundColor: '#130160',
        width: '90%',
        height: hp(6.7),
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    }
})