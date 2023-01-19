import { Accordion, Button, Group, Text } from '@mantine/core'
import { TbPlus } from 'react-icons/tb'

export default function ExplorerAccordion({ data, showCreateButton = false, topMargin = false, noBottomBorder = false, uppercase = true, ...props }) {

    const accordionStyles = theme => ({
        control: {
            padding: '4px 10px',
            borderRadius: 4
        },
        label: {
            fontWeight: 600,
            fontSize: 12,
            padding: "2px 0",
            ...(uppercase && { textTransform: 'uppercase' }),
        },
        content: {
            fontSize: 12,
            padding: '5px 10px 10px 10px'
        },
        item: {
            // omit bottom border on last child
            ...(noBottomBorder && {
                "&:last-child": { borderBottom: "none" }
            }),
        }
    })

    return (
        <Accordion multiple styles={accordionStyles} mt={topMargin ? 10 : 0} {...props}>
            {data.map(child =>
                <Accordion.Item value={child.id} key={child.id}>
                    <Accordion.Control>
                        {child.title} {child.titleInfo != null && `(${child.titleInfo})`}
                    </Accordion.Control>
                    <Accordion.Panel>
                        {showCreateButton &&
                            <Button variant="subtle" fullWidth compact>
                                <Group>
                                    <Text><TbPlus /></Text>
                                    <Text>Create New</Text>
                                </Group>
                            </Button>}
                        {child.content}
                    </Accordion.Panel>
                </Accordion.Item>
            )}
        </Accordion>
    )
}