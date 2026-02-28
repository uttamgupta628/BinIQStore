import { ImageBackground, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import ImageUploadSuccess from '../../../assets/img_upload_success.svg';

const UploadSuccess = () => {
    const navigation = useNavigation();

    return (
        <ScrollView style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" />
            <ImageBackground source={require('../../../assets/vector_1.png')} style={styles.vector}>

                <View style={{ height: hp(10) }} />

                <View style={{ width: wp(100), paddingHorizontal: '5%' }}>
                    <Text style={styles.title}>
                        Your content has been successfully uploaded!
                    </Text>
                </View>

                <View style={styles.imageContainer}>
                    <ImageUploadSuccess width="100%" height="100%" />
                </View>

                <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => navigation.navigate('MyLibrary')}
                >
                    <Text style={styles.primaryBtnText}>View My Library</Text>
                </TouchableOpacity>

                {/* ✅ Navigates back to UploadScreen */}
                <TouchableOpacity onPress={() => navigation.navigate('UploadScreen')}>
                    <Text style={styles.uploadMoreText}>Upload More Content</Text>
                </TouchableOpacity>

            </ImageBackground>
        </ScrollView>
    );
};

export default UploadSuccess;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    vector: { flex: 1, width: wp(100), height: hp(100) },
    title: {
        fontFamily: 'Nunito-Bold',
        fontSize: hp(3),
        color: '#14BA9C',
        textAlign: 'center',
    },
    imageContainer: {
        width: '50%',
        height: wp(50),
        alignSelf: 'center',
        marginVertical: '25%',
    },
    primaryBtn: {
        backgroundColor: '#130160',
        width: '90%',
        height: hp(6.7),
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    primaryBtnText: {
        fontFamily: 'Nunito-SemiBold',
        color: '#fff',
        fontSize: hp(2),
    },
    uploadMoreText: {
        fontFamily: 'Nunito-SemiBold',
        color: '#000',
        fontSize: hp(2),
        textDecorationLine: 'underline',
        textAlign: 'center',
        marginVertical: '7%',
    },
});