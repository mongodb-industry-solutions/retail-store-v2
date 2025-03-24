import React, { useState } from 'react'
import { H1, H2, H3, Subtitle, Description } from '@leafygreen-ui/typography';
import InfoWizard from '../InfoWizard/InfoWizard';
import Card from '@leafygreen-ui/card';
import PRCard from './PRCard';

const PRList = (props) => {
    const { sections } = props
    const [openHelpModal, setOpenHelpModal] = useState(false);

    return (
        <div className='PRList'>
            {
                sections.map(section => (
                    <div className='mb-4' key={section.id}>
                        <div className='d-flex'>
                            <H3 className="me-2">{section.title}</H3>
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
                        </div>
                        <div className='scroll-container'>
                            <div className='scroll-content'>
                                {
                                    [1, 2, 3, 4, 5, 6].map((product, i) => (
                                        <PRCard key={i} product={product} />
                                    ))
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