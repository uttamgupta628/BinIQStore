import { ImageBackground, StatusBar, StyleSheet, Text, View, Dimensions, TextInput } from 'react-native'
import React, { useState } from 'react'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import StarRating from 'react-native-star-rating-widget';

const { width, height } = Dimensions.get('window')
const FeedbackText = () => {
    const navigation = useNavigation();
    const [rating, setRating] = useState(0);
    return (
        <View style={styles.container}>
            <StatusBar translucent={true} backgroundColor={'transparent'}/>
            <ImageBackground
                source={require('../../../assets/vector_1.png')}
                style={styles.vector}
                resizeMode="stretch"
            >
                <View style={styles.reviewContainer}>
                    <View style={styles.cancelMark}>
                        <TouchableOpacity style={{backgroundColor: '#74748014', height: hp(3.5), width: wp(7), borderRadius: 20, justifyContent: 'center', alignItems: 'center'}}>
                        <AntDesign name='close' color='#3C3C4399' size={hp(2.3)}/>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.main}>
                        <View style={styles.textContainer}>
                            <Text style={{ fontFamily: 'Nunito-Bold', color: '#000', textAlign: 'center', fontSize: hp(2.6) }}>What could we do better?</Text>
                            <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#52525B', fontSize: hp(2.2) }}>We’re sorry to hear you didn’t like BinIQ’s this service! Please share what we can do to improve.</Text>
                            <View style={styles.inputsContainer}> 
                                <TextInput
                                    placeholder='User name'
                                    placeholderTextColor={'#A1A1AA'}
                                    style={{fontFamily: 'Nunito-SemiBold', fontSize: hp(2)}}
                                />
                            </View>
                            <View style={styles.inputsContainer}> 
                                <TextInput
                                    placeholder='User email'
                                    placeholderTextColor={'#A1A1AA'}
                                    style={{fontFamily: 'Nunito-SemiBold', fontSize: hp(2)}}
                                />
                            </View>
                            <View style={{...styles.inputsContainer, height: hp(17)}}> 
                                <TextInput
                                    placeholder='Suggest anything, How can we improve?'
                                    placeholderTextColor={'#A1A1AA'}
                                    style={{fontFamily: 'Nunito-SemiBold', fontSize: hp(2)}}
                                />
                            </View>
                        </View>
                        <TouchableOpacity style={styles.gettingStarted}>
                    <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#fff', fontSize: hp(2.5) }}>Submit Feedback</Text>
                </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </View>
    )
}

export default FeedbackText

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E6F3F5',
    },
    vector: {
        flex: 1,
        width: wp(100),
        height: height,
    },
    reviewContainer: {
        position: 'absolute',
        width: wp(100),
        height: hp(70),
        backgroundColor: '#fff',
        bottom: '0%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 10,
        padding: '5%',
        justifyContent: 'space-evenly'
    },
    main: {
        height: '90%',
    },
    textContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cancelMark : {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    inputsContainer: {
        borderWidth: 0.4,
        width: '100%',
        paddingHorizontal: '5%',
        borderRadius: 10,
        borderColor: '#99ABC6',
    },
    gettingStarted: {
        backgroundColor: '#130160',
        height: hp(6.5),
        width: '100%',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginVertical: '4%'
    },
})