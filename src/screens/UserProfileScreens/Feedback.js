import { ImageBackground, StatusBar, StyleSheet, Text, View, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import StarRating from 'react-native-star-rating-widget';

const { width, height } = Dimensions.get('window')
const Feedback = () => {
    const navigation = useNavigation();
    const [rating, setRating] = useState(0);
    useEffect(() => {
        if(rating > 0)
        {
            navigation.navigate('FeedbackText')
        }
    }, [rating])
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
                            <Text style={{ fontFamily: 'Nunito-Bold', color: '#000', textAlign: 'center', fontSize: hp(2.6) }}>How are you finding the app?</Text>
                            <Text style={{ fontFamily: 'Nunito-SemiBold', color: '#52525B', fontSize: hp(2.2) }}>We’ve been working hard on this feature, so your feedback is super helpful to us.</Text>
                            <StarRating
                            rating={rating}
                            onChange={setRating}
                            starSize={hp(5.3)}
                            enableHalfStar = {false}
                            enableSwiping = {false}
                        />
                        </View>
                    </View>
                </View>
            </ImageBackground>
        </View>
    )
}

export default Feedback

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
        height: hp(35),
        backgroundColor: '#fff',
        bottom: '0%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 10,
        padding: '5%',
        justifyContent: 'space-evenly'
    },
    main: {
        height: '60%',
    },
    textContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cancelMark : {
        alignItems: 'flex-end',
        justifyContent: 'center',
    }
})