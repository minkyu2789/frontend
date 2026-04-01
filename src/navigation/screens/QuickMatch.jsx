import { StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import GoBack from '../../icons/goback.svg';
import { useNavigation } from "@react-navigation/native";

export function QuickMatch() {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
                    <GoBack style={{position: 'absolute', left: 30}} />
                </TouchableWithoutFeedback>
                <Text style={styles.headerText}>빠른 매칭</Text>
            </View>
            <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
                <Text style={{fontSize: 20, fontWeight: 'bold', margin: 10}}>주변의 여행자를 찾는 중...</Text>
                <Text style={{fontSize: 16, color: '#818181'}}>자유롭게 여행하세요. 매칭이 완료되면 알려드릴게요.</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
        position: 'absolute',
        flexDirection: 'row',
        top: 20,
        width: '100%',
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
    }
})