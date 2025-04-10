import React, { useState } from 'react'
import { H3 } from '@leafygreen-ui/typography';
import InfoWizard from '../InfoWizard/InfoWizard';
import PRCard from './PRCard';

const PRList = (props) => {
    const { sections } = props
    const [openHelpModal, setOpenHelpModal] = useState(false);

    return (
        <div className='PRList'>
            {
                sections.map(section => (
                    <div className='mb-4' key={section.id}>
                        <div className='d-flex mb-2'>
                            <H3 className="me-2">{section.title}</H3>
                            {
                                section.query &&
                                <InfoWizard
                                    open={openHelpModal}
                                    setOpen={setOpenHelpModal}
                                    tooltipText="See query"
                                    iconGlyph="Wizard"
                                    sections={[
                                        {
                                            heading: "Query that retrieved this recommendation",
                                            content: [
                                                {
                                                    heading: '',
                                                    body: `
                                                    <br/>
                                                    <pre>${section.query}</pre>                                                    
                                                `,
                                                    isHTML: true
                                                }
                                            ]
                                        },
                                    ]}
                                    openModalIsButton={false}
                                />
                            }
                        </div>
                        <div className='scroll-container'>
                            <div className='scroll-content'>
                                {
                                    section.items.length > 0
                                        ? section.items.map((product, i) => (
                                            <PRCard key={i} product={product} />
                                        ))
                                        : 'Loading recommendations...'
                                }
                            </div>
                        </div>
                    </div>
                ))
            }
        </div>
    )
}

export default PRList