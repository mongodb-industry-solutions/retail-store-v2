"use client"

import React from 'react';
import Image from 'next/image';

import styles from "./chatbotComp.module.css";
import { Body, Description, H3, Label } from '@leafygreen-ui/typography';

const ArchitectureComp = () => {

    return (
        <div className={styles.ArchitectureComp}>
            <div style={{ width: '90%' }}>
                <Image
                    src="/rsc/diagrams/chatbotDiagram.png" // Replace with your image path
                    alt="Dataworkz + MDB architecture"
                    layout="responsive"
                    width={100} // Arbitrary width for setting aspect ratio
                    height={60} // Arbitrary height to set the aspect ratio
                />
            </div>
            <Body className={'mt-2'}>
                <strong>Retrieval-Augmented Generation (RAG)</strong> is the process of optimizing the output of a large language model by referencing internal, secure, authoritative knowledge. RAG extends capabilities of LLMs with enterprise’s internal knowledgebase, without having to retrain the model
            </Body>
            <H3>Transform Retail Industry with GenAI</H3>
            <Body>
                Generative AI is changing retail in fascinating ways. It’s providing new avenues for IT leaders at Retailers to explore the ways to enhance customer experience, streamline operations, and grow revenue in a fast-paced environment. In this demo we are leveraging <a href='https://www.dataworkz.com/' target='_blank'>Dataworkz</a> and <a href='https://www.mongodb.com/products/platform/atlas-database' target='_blank'>MongoDB Atlas</a> to bring a retail use case to life.
            </Body>
            
            {/* ... Description of usecase of GenAI chatbot in the retail industry ...<br></br><br></br> */}
        </div>
    );
};

export default ArchitectureComp;