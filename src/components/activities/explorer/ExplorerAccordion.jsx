import { Accordion } from '@mantine/core'

export default function ExplorerAccordion({ data, topMargin = false, noBottomBorder = false, uppercase = true, ...props }) {
    
    const accordionStyles = theme => ({
        control: {
            padding: '4px 0',
            borderRadius: 4
        },
        label: {
            fontWeight: 600,
            fontSize: 12,
            paddingTop: 2,
            paddingBottom: 2,
            ...(uppercase && { textTransform: 'uppercase' }),
        },
        content: {
            fontSize: 12,
            padding: '5px 0 10px 10px'
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
                        {child.content}
                    </Accordion.Panel>
                </Accordion.Item>
            )}
        </Accordion>
    )
}