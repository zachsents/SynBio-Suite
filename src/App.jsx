import Activities from './components/activities/Activities'
// import Panels from './components/panels/Panels'
import { NotificationsProvider } from "@mantine/notifications"
import BrowserCompatiblityCatch from './components/BrowserCompatiblityCatch'
import { AppShell, ColorSchemeProvider, DEFAULT_THEME, MantineProvider } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'



export default function App() {

    const [darkTheme, { toggle: toggleColorScheme }] = useDisclosure(true)
    const colorScheme = darkTheme ? "dark" : "light"

    const theme = {
        colorScheme,
        primaryColor: "indigo",
        other: {
            inactiveColor: DEFAULT_THEME.colors.dark[2], 
            activeColor: DEFAULT_THEME.colors.gray[3], 
        }
    }

    return (
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
            <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
                <NotificationsProvider autoClose={5000} limit={8}>
                    <AppShell
                        navbar={<Activities />}
                    >

                    </AppShell>

                    {/* <Panels /> */}
                
                    <BrowserCompatiblityCatch />
                </NotificationsProvider>
            </MantineProvider>
        </ColorSchemeProvider>
    )
}