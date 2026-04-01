import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createStaticNavigation } from "@react-navigation/native";
import { MainScreen } from "../screens/MainScreen";
import { Chats } from "../screens/Chats";
import { MyPage } from "../screens/MyPage";
import { BookMark } from "../screens/BookMark";
import { Nearby } from "../screens/Nearby";
import { QuickMatch } from "../screens/QuickMatch";
import { NotFound } from "../screens/NotFound";

import HomeIcon from "../icons/home.svg";
import ChatIcon from "../icons/chat.svg";
import MyPageIcon from "../icons/mypage.svg";
import BookMarkIcon from "../icons/bookmark.svg";

const Tabs = createBottomTabNavigator({
    screenOptions: {
        headerShown: false,
        tabBarStyle: { backgroundColor: '#fff', paddingTop: 4 },
    },
    screens: {
        MainScreen: {
            screen: MainScreen,
            options: {
                title: '홈',
                tabBarIcon: ({ color }) => <HomeIcon color={color} />,
            },
        },
        Chats: {
            screen: Chats,
            options: {
                title: '채팅',
                tabBarIcon: ({ color }) => <ChatIcon color={color} />,
            },
        },
        MyPage: {
            screen: MyPage,
            options: {
                title: '나의 여행',
                tabBarIcon: ({ color }) => <MyPageIcon color={color} />,
            },
        },
        BookMark: {
            screen: BookMark,
            options: {
                title: '저장',
                tabBarIcon: ({ color }) => <BookMarkIcon color={color} />,
            },
        },
    },
});

const RootStack = createNativeStackNavigator({
    screenOptions: {
        headerShown: false,
    },
    screens: {
        Tabs: {
            screen: Tabs,
        },
        Nearby: {
            screen: Nearby,
        },
        QuickMatch: {
            screen: QuickMatch,
        },
        NotFound: {
            screen: NotFound,
            options: {
                title: '404',
            },
        }
    },
});

export const Navigation = createStaticNavigation(RootStack);
