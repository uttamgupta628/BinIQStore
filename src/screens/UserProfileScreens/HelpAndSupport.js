import { ImageBackground, Pressable, StatusBar, StyleSheet, Text, View, Image, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HelpAndSupport = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const navigation = useNavigation();

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
      };
    const faqData = [
        {
          question: 'How can i setup my account?',
          answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'
        },
        {
            question: 'How can i setup my account?',
            answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'
          },
          {
            question: 'How can i setup my account?',
            answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'
          },
        // Add more FAQ items here
      ];
      
      const AccordionItem = ({ item, isOpen, onToggle }) => {
        return (
          <View style={styles.itemContainer}>
            <TouchableOpacity onPress={onToggle} style={styles.questionContainer}>
              <Text style={styles.questionText}>{item.question}</Text>
              <Ionicons 
                name={isOpen ? 'chevron-down' : 'chevron-forward'} 
                size={24} 
                color="#000"
              />
            </TouchableOpacity>
            {isOpen && (
              <View style={styles.answerContainer}>
                <Text style={styles.answerText}>{item.answer}</Text>
              </View>
            )}
          </View>
        );
      };
    return (
        <ScrollView style={styles.container}>
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
                        <Text style={styles.headerText}>FAQs</Text>
                    </View>
                </View>
                <View style={{marginVertical: '2%'}}>
                {faqData.map((item, index) => (
          <AccordionItem
            key={index}
            item={item}
            isOpen={openIndex === index}
            onToggle={() => toggleAccordion(index)}
          />
        ))}
                </View>
            </ImageBackground>
        </ScrollView>
    )
}

export default HelpAndSupport

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E6F3F5',
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
    searchParent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: '3%',
        marginVertical: '3%',
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
        height: hp(6),
        width: wp(14),
        justifyContent: 'center',
        alignItems: 'center'
    },
    notificationList: {
        flex: 1,
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: wp(5),
        marginVertical: hp(1),
        borderRadius: 10,
        padding: '4%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E5E5EA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000000',
        marginBottom: 4,
    },
    notificationTime: {
        fontSize: 14,
        color: '#8E8E93',
    },
    notificationDescription: {
        fontSize: 14,
        color: '#8E8E93',
    },
    deleteButton: {
        paddingHorizontal: wp(1),
        paddingVertical: hp(1),
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    deleteText: {
        fontSize: 14,
        color: '#FF3B30',
    },
    itemContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginHorizontal: '5%',
        paddingVertical: '5%'
      },
      questionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // padding: 16,
      },
      questionText: {
        fontSize: hp(2.3),
        color: '#000000',
        fontFamily: 'Nunito-Bold',
        flex: 1,
      },
      answerContainer: {
        marginVertical: '2.5%',
        // backgroundColor: '#F5F5F5',
      },
      answerText: {
        fontSize: hp(1.9),
        color: '#566261',
        fontFamily: 'Nunito-Regular',
      },
})