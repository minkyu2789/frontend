import { StyleSheet, Text, View } from "react-native";

export function Nearby() {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>여행자 밍글러</Text>
            <View style={styles.box}>
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
        position: 'static'
    },
    box: {
        width: 318,
        height: 464,
    }
})