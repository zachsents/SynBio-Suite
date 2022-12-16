import { useMantineColorScheme, ActionIcon, Group } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { IconSun, IconMoonStars } from '@tabler/icons';

export default function ColorSchemeToggle() {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();

    useHotkeys([
        ["ctrl+J", toggleColorScheme]
    ])

    return (
        <ActionIcon
            variant="subtle"
            onClick={() => toggleColorScheme()}
            size="xl"
            sx={(theme) => ({
                // backgroundColor:
                //     theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
                color: theme.colorScheme === 'dark' ? theme.colors.yellow[4] : theme.colors.blue[6],
            })}
        >
            {colorScheme === 'dark' ? <IconSun size={24} /> : <IconMoonStars size={24} />}
        </ActionIcon>
    );
}